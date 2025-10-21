

def test_add_transaction_authenticated(client):
    r = client.post(
        "/api/register_user",
        json={
            "name": "Test User",
            "username": "testuser",
            "email": "testuser@example.com",
            "password": "testpassword"
        }
    )
    assert r.status_code == 201
    r = client.post(
        "/api/login",
        json={
            "identifier": "testuser@example.com",
            "password": "testpassword"
        }
    )
    assert r.status_code == 200
    data = r.json()
    token= data["token"]
    headers = {"Authorization": f"Bearer {token}"}
    r=client.post(
        "/api/add_transaction",
        headers=headers,
        json={
            "date": "2025-10-20",
            "merchant": "Starbucks",
            "amount_cents": 650,
            "note": "morning coffee",
            "category": "food"
        }
    )
    assert r.status_code == 201
    assert "inserted_id" in r.json()
    assert r.json()["status"] == "success"