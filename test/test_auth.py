

def test_register_page(client):
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
    data = r.json()
    assert data["status"] == "registered"
    assert data["user_name"] == "testuser"

def test_login_page(client):
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
    assert data["status"] == "success"
    assert data["user_name"] == "testuser"

    
