import os, re
import json
from dotenv import load_dotenv
from langchain.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langchain.schema import StrOutputParser


load_dotenv()

analysis_LLM=ChatOpenAI(
    model_name=os.getenv("OPEN_ROUTER_MODEL"),
    api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url=os.getenv("OPENROUTER_BASE_URL"),
    max_tokens=1024,
    temperature=0.3,
    max_retries=5,
    timeout=20,
    default_headers={
        "HTTP-Referer": "https://github.com/Jiachenyu1994/finance-ai",
        "X-Title": "Finance AI Assistant"

    }
)

# ----------- Classify Question by Intent -----------

POINT_QUERY_PATTERNS = [
    r"recent", r"latest", r"most\s+recent",
    r"what\s+is", r"which\s+is",
    r"how\s+much",
    r"top\s+\d*\s*(merchant|category)",
    r"last\s+(transaction|expense|purchase|income)"
]

ANALYSIS_PATTERNS = [
    r"trend|breakdown|distribution|insight|comparison|ratio|change",
    r"last\s+(week|month|year|quarter)|past\s+\d+\s+(days|weeks|months|years)",
    r"pattern|average|summary"
]


def classify_mode(question: str) -> str:
    q = question.lower()
    if any(re.search(p, q) for p in POINT_QUERY_PATTERNS) and not any(
        re.search(p, q) for p in ANALYSIS_PATTERNS
    ):
        return "minimal"
    return "structured"


# ----------- Prompt with Explicit Mode Instructions -----------

SYSTEM_PROMPT = (
    "You are a professional personal finance assistant.\n"
    "You must rely ONLY on the provided transaction data.\n"
    "Do NOT invent or assume missing data.\n"
    "Convert `amount_cents` into US dollars: $xx.xx format.\n"
    "If there is no relevant data, respond exactly: No data found.\n"
    "Never reveal SQL, schema, or internal reasoning.\n"
)

analysis_prompt = ChatPromptTemplate.from_messages([
    ("system", SYSTEM_PROMPT),
    ("user",
     "Response mode: {mode}\n"
     "- If mode = `minimal`: Provide ONE short direct answer sentence.\n"
     "- If mode = `structured`: Provide up to 3 short lines: Summary, Breakdown, Suggestion.\n"
     "Keep responses clear and professional.\n\n"
     "User question: {question}\n\n"
     "Transaction data (JSON):\n{data_json}")
])

_chain = analysis_prompt | analysis_LLM | StrOutputParser()


# ----------- Public API Called by Backend -----------

def answer_generator(rows, question: str) -> str:
    # 输入验证
    if not rows:
        print("Debug: No data rows provided")
        return "No data found for your query. Please make sure you have some transactions recorded."
    
    if not isinstance(rows, list):
        print(f"Debug: Invalid data type for rows: {type(rows)}")
        return "Error: Invalid data format"

    mode = classify_mode(question)
    print(f"Debug: Question mode classified as: {mode}")
    print(f"Debug: Number of rows received: {len(rows)}")
    
    # 限制数据量但保持最新数据
    if len(rows) > 200:
        print("Debug: Truncating rows to latest 200")
        rows = rows[-200:]  # 保留最新的200条记录

    try:
        data_json = json.dumps({"rows": rows}, ensure_ascii=False)
        print(f"Debug: Data prepared for LLM: {data_json[:200]}...")  # 只打印前200个字符
        
        text = _chain.invoke({
            "mode": mode,
            "question": question,
            "data_json": data_json
        })
        
        text = text.strip()
        text = re.sub(r"\s+", " ", text)
        
        print(f"Debug: LLM response: {text}")
        
        if not text or text.lower() == "no data found":
            print("Debug: Empty or 'No data found' response from LLM")
            return "No data found for your query. Please try rephrasing your question."
            
        return text
        
    except Exception as e:
        print(f"Error in answer_generator: {str(e)}")
        return f"Sorry, there was an error processing your query. Error: {str(e)}"

# if __name__ == "__main__":
#     from sql_excutor import execute_sql
#     from sql_ai_generator import generate_sql
#     test_q = "how much did I spend last month?"
#     print("🧠 Question:", test_q)
#     print("🧾 SQL:", generate_sql(test_q, user_id_required=True))
#     data=execute_sql(generate_sql(test_q, user_id_required=True), "tester")
#     print(f"Answer: {answer_generator(data,test_q)}")
