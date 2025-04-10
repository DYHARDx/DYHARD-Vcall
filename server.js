const WebSocket = require('ws');
const port = process.env.PORT || 3000;
const server = new WebSocket.Server({ port });

const rooms = {};

server.on('connection', socket => {
  let roomId;

  socket.on('message', message => {
    const data = JSON.parse(message);

    if (data.join) {
      roomId = data.join;
      if (!rooms[roomId]) rooms[roomId] = [];
      rooms[roomId].push(socket);
      return;
    }

    if (roomId && rooms[roomId]) {
      rooms[roomId].forEach(client => {
        if (client !== socket && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    }
  });

  socket.on('close', () => {
    if (roomId && rooms[roomId]) {
      rooms[roomId] = rooms[roomId].filter(s => s !== socket);
      if (rooms[roomId].length === 0) {
        delete rooms[roomId];
      }
    }
  });
});

console.log("Signaling server running on ws://localhost:" + port);