import websocket
import threading
import json

from user import User

# === WebSocket callbacks ===
def on_message(ws, message):
    try:
        data = json.loads(message)
        if 'error' in data:
            print("⚠️ Server error:", data['error'])
        elif data.get('type') == 'user_data':
            print("User data received:", data['data'])
        else:
            print("Message:", data)
    except Exception as e:
        print("Failed to parse message:", e)

def on_error(ws, error):
    print("WebSocket error:", error)

def on_close(ws, close_status_code, close_msg):
    print("WebSocket connection closed")

def create_on_open(session_id):
    def on_open(ws):
        def run():
            ws.send(json.dumps({"sessionId": session_id}))
        threading.Thread(target=run).start()
    return on_open

def start_ws(ws):
    print("Connecting to WebSocket...")
    ws.run_forever()
    
def createWs(SERVER_IP, id):
    return websocket.WebSocketApp(
        f"ws://{SERVER_IP}",
        on_message=on_message,
        on_error=on_error,
        on_close=on_close,
        on_open=create_on_open(id)
    )
