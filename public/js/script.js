function generate(type){
  let chars = '';
  if(type === 'vowel'){
    chars = "aeiou";
  } else {
    chars = "bcdfghjklmnpqrstvwxyz";
  }
  // aasign a random character
  let randomChar = chars.charAt(Math.floor(Math.random() * chars.length));

  //return the character
  return randomChar;
}

// TODO: add timer
// function setTimer(element){
//   let timer = 30;
//   let startTimer = setInterval(() => {
//     if(timer === 0){
//       element.innerHTML = "Time's up!";
//       clearInterval(startTimer);
//       return false;
//     } else {
//       timer--;
//       element.innerHTML = timer + ' seconds left';
//     }
//   },1000);
// }
// TODO: game logic
// TODO: score system

// connection

function init() {
  var socket = io("http://localhost:4000");
  var charLength = 9;
  var startTimer;
  const containers = new Array();
  const screenArea = document.querySelector('.screen-area');
  const letterCount = document.querySelector('#letter-count');
  const announcer = document.querySelector('#announcer');
  const turnMsg = document.querySelector('#turn-msg');
  const letterChoice = document.querySelector('#letter-choice');
  const timer = document.querySelector('.timer');

    // TODO: emitting values
    socket.on('waiting', () => {
      screenArea.innerHTML = "<h2>Waiting for other players to join...</h2>";
    });
  
    socket.on('game-start', () => {
      console.log('the game has started');
      screenArea.innerHTML = '';
    });

    socket.on('quit', player => {
      announcer.innerHTML = player.name + " has left the game";
    });

    socket.on('rage-quit', player => {
      letterCount.innerHTML = '';
      letterChoice.style.display = "none";
      turnMsg.innerHTML = '';
      clearInterval(startTimer);
      timer.innerHTML = '';
      announcer.innerHTML = player.name + " has left the game";
    });

    socket.on('turn', message => {
      let player = document.querySelector('#player-name').innerHTML;
      socket.emit('player-name', player);
      screenArea.innerHTML = '';
      letterCount.innerHTML = charLength + " letters left";
      letterChoice.style.display = "block";
    });

    socket.on('broadcast-turn', player => {
      turnMsg.innerHTML = 'get ready, <strong>' + player + '</strong> is picking the letters';
      letterCount.innerHTML = charLength + " letters left";
    });

    socket.on('letters-counter', counter => {
      letterCount.innerHTML = counter;
    });

    socket.on('show-letter', letter => {
      screenArea.innerHTML += "<span id=\"character-\"" + containers.length + ">" + letter + "</span>";
    });

    socket.on('timer', time => {
      timer.innerHTML = time;
    });

    socket.on('check-words', () => {
      let letterLength = prompt('How many letters?\nEnter[0-9]');
      letterLength = parseInt(letterLength);
      socket.emit('letter-length', letterLength);
    });

    socket.on('new-challenger', gameStatus => {
      turnMsg.innerHTML = 'get ready, <strong>' + gameStatus.picker + '</strong> is picking the letters';
      let length = gameStatus.currentLetters.length;
      letterCount.innerHTML = (charLength - length) + " letters left";
      gameStatus.currentLetters.forEach(letters => {
        screenArea.innerHTML += "<span id=\"character-\"" + length + ">" + letters + "</span>";
      });
    })


  $('.chars').click((e) => {
    let requestedLetter = '';
    let ans = e.target.value;
    if(containers.length != 9){
      charLength--;
      requestedLetter = generate(ans);
      socket.emit('pick-letters', requestedLetter.toUpperCase());
      // store the letters in the array
      containers.push(requestedLetter);
      socket.emit('letters-left', charLength + " letters left");
    }

    if(charLength === 0) {
      socket.emit('letters-left', "Picking phase is over!");
      $('.chars').prop('disabled', true);
      socket.emit('setTimer', "starting in 5 seconds");
      const start = setTimeout(() => {
        let time = 30;
        startTimer = setInterval(() => {
          if(time === 0){
            clearInterval(startTimer);
            socket.emit('setTimer', "Time's up!");
            socket.emit('end-round');
          } else {
            time--;
            socket.emit('setTimer', time + " seconds left");
          }
        },1000);
      }, 5000);
    }
  });


  let playerName = "";
  while(playerName === "" || playerName === null){
    playerName = prompt('What is your name?');
  };

  if(playerName !== "" || playerName !== null){
    playerName = playerName.trim()
    socket.emit('player-join', playerName);
    document.querySelector('#player-name').innerHTML = playerName;
  }
}

window.onload = init();