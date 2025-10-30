from sql_executor import execute_sql
from sql_ai_generator import generate_sql
from analysis_LLM_generator import answer_generator

def analysis_answer_response(question: str, user_id: str) -> str:
    sql = generate_sql(question=question, user_id_required=True)
    data = execute_sql(sql, user_id)
    return answer_generator(data, question=question)
