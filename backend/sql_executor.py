import sqlite3
import db

def execute_sql(sql: str, user_id: str) -> sqlite3.Row:
    conn = db.get_conn()
    try:
        print("Original SQL:", sql)
        print("Parameters:", {"user_id": user_id})
        print("Going to execute with user_id:", user_id)
        cursor = conn.execute(sql, [user_id])
        # 获取列名
        columns = [description[0] for description in cursor.description] if cursor.description else []
        data = cursor.fetchall()
        if data:
            print("Got results:", len(data), "rows")
            print("Columns:", columns)
            print("Data:", data)
            # 将结果转换为字典列表
            result = []
            for row in data:
                row_dict = {}
                for i, value in enumerate(row):
                    if i < len(columns):
                        row_dict[columns[i]] = value
                result.append(row_dict)
            return result
        else:
            print("No results found")
            return []
    except Exception as e:
        print("Error executing SQL:", str(e))
        raise
    finally:
        conn.close()