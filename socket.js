// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app); // Required for socket.io
const io = new Server(server);

// Serve static files if needed
app.use(express.static('public'));

// Home route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('chat message', (msg) => {
    console.log('message: ' + msg);
    // Broadcast message to all clients
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start server
server.listen(3000, () => {
  console.log('Server listening on http://localhost:3000');
});
