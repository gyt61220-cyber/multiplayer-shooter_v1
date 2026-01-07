const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, { cors:{origin:"*"} });

let rooms = {};
let players = {};
let bullets = [];

io.on("connection", socket => {

  socket.on("createRoom", () => {
    const code = Math.random().toString(36).substring(2,6).toUpperCase();
    rooms[code] = { admin: socket.id, started:false, endTime:null };
    socket.join(code);
    socket.room = code;

    players[socket.id] = spawnPlayer();
    socket.emit("roomCreated", code);
  });

  socket.on("joinRoom", code => {
    if(rooms[code] && !rooms[code].started){
      socket.join(code);
      socket.room = code;
      players[socket.id] = spawnPlayer();
      socket.emit("joinedRoom", code);
    }
  });

  socket.on("startGame", code => {
    if(rooms[code] && rooms[code].admin === socket.id){
      rooms[code].started = true;
      rooms[code].endTime = Date.now() + 5 * 60 * 1000; // 5 min
      io.to(code).emit("gameStarted");
    }
  });

  socket.on("move", pos => {
    if(players[socket.id]){
      players[socket.id].x = pos.x;
      players[socket.id].y = pos.y;
    }
  });

  socket.on("shoot", dir => {
    if(players[socket.id]){
      bullets.push({
        x: players[socket.id].x + 10,
        y: players[socket.id].y + 10,
        dx: dir.dx,
        dy: dir.dy,
        owner: socket.id
      });
    }
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
  });
});

function spawnPlayer(){
  return {
    x: Math.random()*700,
    y: Math.random()*400,
    hp: 100,
    kills: 0
  };
}

// GAME LOOP
setInterval(()=>{
  // move bullets
  bullets.forEach(b=>{
    b.x += b.dx * 8;
    b.y += b.dy * 8;
  });

  // hit detection
  bullets.forEach((b,bi)=>{
    for(let id in players){
      if(id !== b.owner){
        const p = players[id];
        if(b.x>p.x && b.x<p.x+20 && b.y>p.y && b.y<p.y+20){
          p.hp -= 50;
          bullets.splice(bi,1);

          if(p.hp <= 0){
            players[b.owner].kills++;
            players[id] = spawnPlayer();
          }
        }
      }
    }
  });

  io.emit("state", { players, bullets });

},33);

http.listen(process.env.PORT || 3000);
