from ws import *
from connection import *
from user import *

with open('../server_ip.txt', 'r') as file:
    content = file.read().strip()

# Remove the 'http://' prefix for WebSocket
if content.startswith("http://"):
    SERVER_IP = content[7:]

# === Main ===
def main():
    current_user = login(SERVER_IP)
    if not current_user.session_id:
        return

    ws = createWs(SERVER_IP, current_user.session_id)
    ws_thread = threading.Thread(target=start_ws, args=(ws,))
    ws_thread.daemon = True
    ws_thread.start()
    
    while True:
        msg = input("> ")
        if msg.lower() == "exit":
            break
        if ws.sock and ws.sock.connected:
            ws.send(json.dumps({"message": msg}))
        else:
            print("⚠️ WebSocket not connected.")

if __name__ == "__main__":
    main()