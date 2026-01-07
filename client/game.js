const socket = io("https://multiplayer-shooter-server-v1.onrender.com");

const menu = document.getElementById("menu");
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let room = null;
let players = {};
let bullets = [];
let me = { x: 100, y: 100, speed: 4 };
let mouse = { x:0, y:0 };

// ----- LOBBY -----

function createRoom(){ socket.emit("createRoom"); }
function showJoin(){ document.getElementById("joinBox").style.display = "block"; }
function joinRoom(){
  const code = document.getElementById("codeInput").value;
  socket.emit("joinRoom", code);
}
function startGame(){ socket.emit("startGame", room); }

socket.on("roomCreated", code => {
  room = code;
  document.getElementById("createBox").style.display = "block";
  document.getElementById("roomCode").innerText = code;
});

socket.on("joinedRoom", code => {
  room = code;
  alert("Joined Room: " + code);
});

socket.on("gameStarted", () => {
  menu.style.display = "none";
  canvas.style.display = "block";
  gameLoop();
});

// ----- INPUT -----

document.addEventListener("keydown", e => {
  if (e.key === "w") me.y -= me.speed;
  if (e.key === "s") me.y += me.speed;
  if (e.key === "a") me.x -= me.speed;
  if (e.key === "d") me.x += me.speed;
  socket.emit("move", me);
});

canvas.addEventListener("mousemove", e=>{
  const r = canvas.getBoundingClientRect();
  mouse.x = e.clientX - r.left;
  mouse.y = e.clientY - r.top;
});

canvas.addEventListener("click", ()=>{
  const dx = mouse.x - me.x;
  const dy = mouse.y - me.y;
  const len = Math.sqrt(dx*dx + dy*dy);
  socket.emit("shoot", { dx: dx/len, dy: dy/len });
});

// ----- SERVER DATA -----

socket.on("state", data => {
  players = data.players;
  bullets = data.bullets;
});

// ----- GAME LOOP -----

function gameLoop(){
  ctx.clearRect(0,0,800,500);

  // players
  for(let id in players){
    ctx.fillStyle = "lime";
    ctx.fillRect(players[id].x, players[id].y,20,20);

    ctx.fillStyle = "white";
    ctx.fillText("HP:"+players[id].hp, players[id].x-5, players[id].y-5);
    ctx.fillText("K:"+players[id].kills, players[id].x-5, players[id].y+35);
  }

  // bullets
  ctx.fillStyle="yellow";
  bullets.forEach(b=> ctx.fillRect(b.x,b.y,5,5));

  requestAnimationFrame(gameLoop);
}
