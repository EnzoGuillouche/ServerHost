import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import bodyParser from 'body-parser';

import { users, sessions } from './db.js';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(bodyParser.json());

const PORT = 3000;

// Example login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    const sessionId = `${Date.now()}-${Math.random()}`;
    sessions[sessionId] = user;
    res.json({ success: true, sessionId });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// WebSocket: on user connection
wss.on('connection', (ws, req) => {
  console.log('A client connected via WebSocket');

  // Identifying the user after receiving a session ID
  ws.on('message', (message) => {
    let data;
    try {
      data = JSON.parse(message);
    }
    catch (e) {
      console.log('Invalid JSON received:', message);
      return;
    }

    if (data.sessionId) {
      const user = sessions[data.sessionId];
      if (user){
        ws.user = user;
        console.log(`Session authenticated for ${user.username}`);
        ws.send(JSON.stringify( { type:'user_data', data: {welcome: `Hello, ${user.username}` } } ));
      } else {
        ws.send(JSON.stringify( { error: 'Invalid session' }));
        return;
      }
    } else if (ws.user && data.message) { 
      console.log(`Message from ${ws.user.username}: ${data.message}`);
    } else {
      ws.send(JSON.stringify({ error: "Unauthorized or unknown message" }));
    }

  });

  ws.on('close', () => {
    console.log(`Connected closed`);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
