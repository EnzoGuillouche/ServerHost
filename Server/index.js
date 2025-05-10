//#region IMPORTS
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { WebSocketServer } from 'ws';
import { createInterface } from 'readline/promises';
import { stdin as input, stdout as output } from 'node:process';

import { users, sessions } from './db.js';
import { app, server, PORT } from './connection.js';
//#endregion

//#region VARIABLES
const wss = new WebSocketServer({ server });
//#endregion

//#region SET IP INTO FILE
function getLocalExternalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

function writeIntoIpFile(ip) {
  const content = `http://${ip}:${PORT}\n`;

  // Get the directory of the current module
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const filePath = path.join(__dirname, '../server_ip.txt');

  fs.writeFile(filePath, content, (err) => {
    if (err) {
      console.error('Failed to write IP to file:', err);
    } else {
      console.log('IP address written to server_ip.txt');
    }
  });
}
//#endregion

//#region WEB SOCKET
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
        ws.send(JSON.stringify( { type:'user_data', data: {message: `Hello, ${user.username}` } } ));
      } else {
        ws.send(JSON.stringify( { error: 'Invalid session' }));
        return;
      }
    //#region HANDLE ACTIONS FROM USER
    } else if (ws.user && data.message) {
      console.log(`Message from ${ws.user.username}: ${data.message}`);
    //#endregion
    } else {
      ws.send(JSON.stringify({ error: "Unauthorized or unknown message" }));
    }
  });

  ws.on('close', (ws) => {
    console.log(`User ${ws.user.username} disconnected`);
  });
});
//#endregion

//#region SERVER LISTEN
server.listen(PORT, () => {
  const ip = getLocalExternalIP();
  console.log(`Server running on http://${ip}:${PORT}`);
  writeIntoIpFile(ip);
  waitForUserInput();
});
//#endregion

//#region CONSOLE INPUTS

async function waitForUserInput() {
  const rl = createInterface({ input, output });

  while (true) {
    const line = await rl.question('> ');
    const inputText = line.trim();

    if (inputText === 'exit') {
      console.log('Shutting down server...');
      rl.close();
      server.close(() => {
        console.log('Server closed.');
        process.exit(0);
      });
      break;
    } else {
      console.log(`Unrecognized input: ${inputText}`);
    }
  }
}
//#endregion
