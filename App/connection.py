import requests

from user import User

# === Login ===
def login(SERVER_IP):
    username = input("Username: ")
    password = input("Password: ")

    try:
        user = User(username, password)
        res = requests.post(f"http://{SERVER_IP}/login", json={
            "username": username,
            "password": password
        })

        if res.status_code == 200:
            data = res.json()
            print("Logged in successfully!")
            user.session_id = data['sessionId']
            return user
        else:
            print("Login failed:", res.json().get("message", "Unknown error"))
            del user
            return None
    except Exception as e:
        print("Error connecting to server:", e)
        return None