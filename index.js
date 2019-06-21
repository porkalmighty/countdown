const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const axios = require('axios');
const port = 4000;
const playerList = [];

var answers = 0;
var pickingPhase = false;
var playerCount = 0;
var wordList = [];
var currentGame = {
  picker: "",
  currentLetters: [],
  charlength: "",
};

app.use(express.static("public"));

function Player(id, name){
  this.id = id;
  this.name = name;
  this.letterLength = 0;
  this.score = 0;
}

function Play(){
  let connectedUsers = parseInt(io.engine.clientsCount);
  const randomNum = Math.floor(Math.random() * connectedUsers);
  let playerTurn = Object.keys(io.sockets.sockets)[randomNum];
  io.to(playerTurn).emit('turn', "it's your turn");
}

function sortAsc(value1, value2){
  return value1.letterLength - value2.letterLength;
}

function fetchAnagram(characters) {
  return axios.get(`http://www.anagramica.com/all/${characters}`)
  .then(response => {
    return response.data.all;
  }).catch(err => console.log(err));
}

// socket
io.on("connection", socket => {
  socket.on('player-join', player => {
    let newPlayer = new Player(socket.id, player);
    playerList.push(newPlayer);
    playerCount++;
    socket.emit('join', player)

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

  socket.on('end-round', letters => {
    console.log('round ends');
    // fetch anagram api
    letters = letters.join('');
    console.log(letters);
    console.log('---------');
    fetchAnagram(letters).then(data => {
      console.log(data);
      wordList.push(data);
    });
    io.emit('check-words');
  });

  socket.on('letter-length', data => {
    console.log(`this is the word length ${data}`);
    answers++;
    let player = playerList.find(p => p.id === socket.id);
    player.letterLength = data;

    // check if all users entered their answers
    if(answers === playerList.length){
      console.log(playerList.length);
      console.log(playerList);
      let sortedList = [...playerList];
      let sortedUser = sortedList.sort(sortAsc).pop();

      // emit answer form to the user that has the highest letter
      io.to(sortedUser.id).emit('get-answer', sortedUser.letterLength);
      socket.broadcast.emit('show-highest', sortedUser.name);
    }
  });

// game logic
// score system

  socket.on('evaluate', data => {
    let match = wordList[0].includes(data);
    let player = playerList.find(p => p.id === socket.id);
    if(match){
      console.log(`matched: ${player.name}`);
      player.score = parseInt(player.letterLength) * 10;
      socket.broadcast.emit('ans', player);
      io.emit('show-answers', wordList[0]);
    }
  });


  // todo: add rounds

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
      socket.broadcast.emit('quit', quitter);
    }
  });

});


http.listen(port, () => {
  console.log("connected to port " + port);
});

// useful references I used for sockets
// https://stackoverflow.com/questions/35680565/sending-message-to-specific-client-in-socket-io/35681189
// https://stackoverflow.com/questions/35249770/how-to-get-all-the-sockets-connected-to-socket-io/35251958
// https://stackoverflow.com/questions/10275667/socket-io-connected-user-count