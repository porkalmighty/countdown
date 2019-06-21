const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const port = 4000;
const playerList = [];


var pickingPhase = false;
var playerCount = 0;
var currentGame = {
  picker: "",
  currentLetters: [],
  charlength: "",
};

app.use(express.static("public"));

function Player(id, name){
  this.id = id;
  this.name = name;
}

function Play(){
  let connectedUsers = parseInt(io.engine.clientsCount);
  const randomNum = Math.floor(Math.random() * connectedUsers);
  let playerTurn = Object.keys(io.sockets.sockets)[randomNum];
  io.to(playerTurn).emit('turn', "it's your turn");
} 

// socket
io.on("connection", socket => {

  socket.on("disconnect", () => {
    console.log('disconnection notice');
    if(playerCount === 2){
      let quitter = playerList.find(p => p.id === socket.id);
      let index = playerList.findIndex(p => p.id === socket.id);
      socket.broadcast.emit('rage-quit', quitter);
      socket.broadcast.emit('waiting');
      playerCount--;
      playerList.splice(index, 1);
    } else {
      let quitter = playerList.find(p => p.id === socket.id);
      console.log(quitter);
      socket.broadcast.emit('quit', quitter);
    }

  });

  socket.on('player-join', player => {
    let newPlayer = new Player(socket.id, player);
    playerList.push(newPlayer);
    playerCount++;

    if(playerCount === 1) {
      socket.emit('waiting');
    }

    if(playerCount === 2) {
      io.emit('game-start');
      pickingPhase = true;
      Play();
    }

    if(playerCount > 2 && pickingPhase == true) {
      io.to(socket.id).emit('new-challenger', currentGame);
    } else {
      // todo: decline user
    }
  });

  socket.on('player-name', player => {
    socket.broadcast.emit('broadcast-turn', player);
    currentGame.picker = player;
  });

  socket.on('pick-letters', letter => {
    io.emit('show-letter', letter);
    currentGame.currentLetters.push(letter);
  });

  socket.on('letters-left', charLength => {
    charLength === 0 ?  "The picking phase is over" : charLength + " letters left";
    pickingPhase = charLength === 0 ? false : true;
    io.emit('letters-counter', charLength);
    currentGame.charLength = charLength;
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

// useful references I used for sockets
// https://stackoverflow.com/questions/35680565/sending-message-to-specific-client-in-socket-io/35681189
// https://stackoverflow.com/questions/35249770/how-to-get-all-the-sockets-connected-to-socket-io/35251958
// https://stackoverflow.com/questions/10275667/socket-io-connected-user-count