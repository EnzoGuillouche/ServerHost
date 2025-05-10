import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';

import { users, sessions } from './db.js';

export const app = express();
export const server = http.createServer(app);
app.use(bodyParser.json());

export const PORT = 3000;

//#region LOGIN
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
//#endregion
