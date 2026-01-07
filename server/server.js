const express = require("express");
const app = express();
const http = require("http").createServer(app);

const io = require("socket.io")(http, {
  cors: { origin: "*" }
});

let players = {};

io.on("connection", socket => {
  players[socket.id] = {
    x: Math.random() * 700,
    y: Math.random() * 400,
    hp: 100,
    score: 0
  };

  socket.on("move", data => {
    players[socket.id] = { ...players[socket.id], ...data };
  });

  socket.on("shoot", bullet => {
    io.emit("newBullet", bullet);
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
  });
});

setInterval(() => {
  io.emit("state", players);
}, 33);

http.listen(process.env.PORT || 3000);
