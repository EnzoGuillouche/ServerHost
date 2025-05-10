import requests
import websocket
import json
import threading

# === Configuration ===
SERVER_IP = "192.168.1.235"  # IP of the server
PORT = 3000

# === Login ===
def login():
    username = input("Username: ")
    password = input("Password: ")

    try:
        res = requests.post(f"http://{SERVER_IP}:{PORT}/login", json={
            "username": username,
            "password": password
        })

        if res.status_code == 200:
            data = res.json()
            print("Logged in successfully!")
            return data['sessionId']
        else:
            print("Login failed:", res.json().get("message", "Unknown error"))
            return None
    except Exception as e:
        print("Error connecting to server:", e)
        return None

# === WebSocket callbacks ===
def on_message(ws, message):
    try:
        data = json.loads(message)
        if 'error' in data:
            print("⚠️ Server error:", data['error'])
        elif data.get('type') == 'user_data':
            print("📨 User data received:", data['data'])
        else:
            print("📩 Message:", data)
    except Exception as e:
        print("Failed to parse message:", e)

def on_error(ws, error):
    print("WebSocket error:", error)

def on_close(ws, close_status_code, close_msg):
    print("WebSocket connection closed")

def create_on_open(session_id):
    def on_open(ws):
        def run():
            print("Sending session ID to server...")
            ws.send(json.dumps({"sessionId": session_id}))
        threading.Thread(target=run).start()
    return on_open

def start_ws(ws):
    print("Connecting to WebSocket...")
    ws.run_forever()

# === Main ===
def main():
    session_id = login()
    if not session_id:
        return

    ws = websocket.WebSocketApp(
        f"ws://{SERVER_IP}:{PORT}",
        on_message=on_message,
        on_error=on_error,
        on_close=on_close,
        on_open=create_on_open(session_id)
    )
    
    ws_thread = threading.Thread(target=start_ws, args=(ws,))
    ws_thread.daemon = True
    ws_thread.start()
    
    while True:
        msg = input("Type a message to send: ")
        if msg.lower() == "exit":
            break
        if ws.sock and ws.sock.connected:
            ws.send(json.dumps({"message": msg}))
        else:
            print("⚠️ WebSocket not connected.")

if __name__ == "__main__":
    main()
