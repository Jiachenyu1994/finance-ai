from sql_executor import execute_sql
from sql_ai_generator import generate_sql
from analysis_LLM_generator import answer_generator

def analysis_answer_response(question: str, user_id: str) -> str:
    sql = generate_sql(question=question, user_id_required=True)
    data = execute_sql(sql, user_id)
    print("debug: analysis_answer_response data:", data)
    summary = answer_generator(data, question)
    print("debug: analysis_answer_response summary:", summary)
    return summary




if __name__ == "__main__":
  
    test_q = "how much did I spend last month?"
    print("🧠 Question:", test_q)
    print(analysis_answer_response(test_q, "tester"))
        
