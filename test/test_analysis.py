

# import pytest
# from datetime import datetime, timedelta

# def test_add_transaction_authenticated(client):
#     # 注册用户
#     r = client.post(
#         "/api/register_user",
#         json={
#             "name": "Test User",
#             "username": "testuser",
#             "email": "testuser@example.com",
#             "password": "testpassword"
#         }
#     )
#     assert r.status_code == 201

#     # 登录
#     r = client.post(
#         "/api/login",
#         json={
#             "identifier": "testuser@example.com",
#             "password": "testpassword"
#         }
#     )
#     assert r.status_code == 200
#     data = r.json()
#     token = data["token"]
#     headers = {"Authorization": f"Bearer {token}"}

#     # 添加测试交易数据
#     today = datetime.now().strftime("%Y-%m-%d")
#     last_month = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
    
#     transactions = [
#         {
#             "date": today,
#             "merchant": "Test Shop",
#             "amount_cents": 1000,  # $10.00
#             "category": "food"
#         },
#         {
#             "date": last_month,
#             "merchant": "Old Shop",
#             "amount_cents": 2000,  # $20.00
#             "category": "entertainment"
#         }
#     ]
    
#     for tx in transactions:
#         r = client.post("/api/add_transaction", headers=headers, json=tx)
#         assert r.status_code == 201

#     # 测试分析功能
#     r = client.post(
#         "/api/analyze/query",
#         headers=headers,
#         json={
#             "question": "how much did I spend last month?"
#         }
#     )
#     assert r.status_code == 200  # 分析查询应该返回200
#     response_data = r.json()
    
#     # 验证响应格式
#     assert "summary" in response_data
#     assert isinstance(response_data["summary"], str)
#     assert len(response_data["summary"]) > 0



# def test_analyze_complex_queries(client):
#     """测试复杂查询场景"""
#     r = client.post(
#         "/api/login",
#         json={
#             "identifier": "testuser@example.com",
#             "password": "testpassword"
#         }
#     )
#     assert r.status_code == 200
#     token = r.json()["token"]
#     headers = {"Authorization": f"Bearer {token}"}

#     # 测试各种复杂查询
#     test_questions = [
#         "What's my average spending per category?",
#         "What's my highest transaction amount?",
#         "How many transactions do I have in each category?",
#         "What are my top 3 spending categories?"
#     ]

#     for question in test_questions:
#         r = client.post(
#             "/api/analyze/query",
#             headers=headers,
#             json={"question": question}
#         )
#         assert r.status_code == 200
#         response_data = r.json()
#         assert "sql" in response_data
#         assert "summary" in response_data
#         assert len(response_data["summary"]) > 0