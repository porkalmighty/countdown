const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const port = 4000;

let playerCount = 0;
const playerList = [];

app.use(express.static("public"));

function Player(id, name){
  this.id = id;
  this.name = name;
}

function Play(players, socks){
  let connectedUsers = parseInt(io.engine.clientsCount);
  const randomNum = Math.floor(Math.random() * connectedUsers);
  let playerTurn = Object.keys(io.sockets.sockets)[randomNum];
  io.to(playerTurn).emit('turn', "it's your turn");
} 

// socket
io.on("connection", socket => {

  socket.on('player-join', player => {
    let newPlayer = new Player(socket.id, player);
    playerList.push(newPlayer);
    playerCount++;
    if(playerCount === 1) {
      socket.emit('waiting');
    }

    if(playerCount >= 2) {
      io.emit('game-start');
      Play(playerList, socket);
    }
  });

  socket.on('player-name', player => {
    socket.broadcast.emit('broadcast-turn', player);
  });

  socket.on('pick-letters', letter => {
    io.emit('show-letter', letter);
  });

  socket.on('letters-left', charLength => {
    charLength === 0 ?  "The picking phase is over" : charLength + " letters left";
    io.emit('letters-counter', charLength);
  });

  socket.on('setTimer', time => {
    io.emit('timer', time);
  });

  socket.on('end-round', () => {
    console.log('round ends');
    io.emit('check-words');
  });

});


http.listen(port, () => {
  console.log("connected to port " + port);
});
