const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 500;

// WE WILL CHANGE THIS AFTER SERVER HOSTING
const socket = io("https://YOUR-SERVER-URL");

let me = { x: 200, y: 200, speed: 4 };
let players = {};
let bullets = [];

document.addEventListener("keydown", e => {
  if (e.key === "w") me.y -= me.speed;
  if (e.key === "s") me.y += me.speed;
  if (e.key === "a") me.x -= me.speed;
  if (e.key === "d") me.x += me.speed;
  socket.emit("move", me);
});

document.addEventListener("click", () => {
  socket.emit("shoot", { x: me.x + 20, y: me.y + 10 });
});

socket.on("state", s => players = s);
socket.on("newBullet", b => bullets.push(b));

function loop(){
  ctx.clearRect(0,0,800,500);

  for(let id in players){
    ctx.fillStyle = "lime";
    ctx.fillRect(players[id].x, players[id].y,20,20);
  }

  ctx.fillStyle="yellow";
  bullets.forEach(b=>{ b.x+=8; ctx.fillRect(b.x,b.y,6,3); });

  requestAnimationFrame(loop);
}
loop();
