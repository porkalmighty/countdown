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

// connection

function init() {
  var socket = io("http://localhost:4000");
  var charLength = 9;
  var startTimer;
  var containers = new Array();
  const screenArea = document.querySelector('.screen-area');
  const letterCount = document.querySelector('#letter-count');
  const announcer = document.querySelector('#announcer');
  const turnMsg = document.querySelector('#turn-msg');
  const letterChoice = document.querySelector('#letter-choice');
  const timer = document.querySelector('.timer');
  const answerForm = document.querySelector('.form');
  const submitBtn = document.querySelector('#send');
  const answerKey = document.querySelector('#possible-answers');

  let playerName = "";
  while(playerName === "" || playerName === null){
    playerName = prompt('What is your name?');
  };

  if(playerName !== "" || playerName !== null){
    playerName = playerName.trim()
    socket.emit('player-join', playerName);
    document.querySelector('#player-name').innerHTML = playerName;
  }

    // TODO: emitting values
    socket.on('waiting', () => {
      screenArea.innerHTML = "<h2>Waiting for other players to join...</h2>";
    });
  
    socket.on('game-start', () => {
      console.log('the game has started');
      screenArea.innerHTML = '';
      letterCount.innerHTML = '';
      letterChoice.style.display = "none";
      turnMsg.innerHTML = '';
      clearInterval(startTimer);
      timer.innerHTML = '';
      announcer.innerHTML = "";
      answerForm.style.display = "none";
    });

    socket.on('join', player => {
      announcer.innerHTML = player.name + " has joined the game";
    });

    socket.on('quit', player => {
      announcer.innerHTML = player.name + " has left the game";
      containers = new Array();
    });

    socket.on('rage-quit', player => {
      letterCount.innerHTML = '';
      letterChoice.style.display = "none";
      turnMsg.innerHTML = '';
      clearInterval(startTimer);
      timer.innerHTML = '';
      announcer.innerHTML = player.name + " has left the game";
      answerForm.style.display = "none";
      containers = new Array();
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

    socket.on('show-highest', player => {
      turnMsg.innerHTML = '<strong>' + player + '</strong> has the longest word!';
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
      let letterLength = "";
      let inputStatus = false;
      while(inputStatus === false){
          letterLength = prompt('How many letters?\nEnter word length [4-9]');
          letterLength = parseInt(letterLength);
          if(letterLength > 3 && letterLength < 10){
            socket.emit('letter-length', letterLength);
            inputStatus = true;
          }
      }
    });

    socket.on('get-answer', letterLength => {
      alert("enter your answer on the form")
      answerForm.style.display = "block";
      submitBtn.value = letterLength;
    });

    socket.on('ans', data => {
      announcer.innerHTML = `${data.name} won and got ${data.score} points for answering a ${data.letterLength}-letter word!`;
    });

    socket.on('show-answers', answers => {
      let keyAnswers = "";
      answers.map(val => {
        if(val.length > 3) {
          keyAnswers += `<li> ${val} </li>`;
        }
      });
      answerKey.innerHTML = `<h3>Possible Answers</h3><ul id="answers">${keyAnswers}</ul>`;
    });

    socket.on('new-challenger', gameStatus => {
      turnMsg.innerHTML = 'get ready, <strong>' + gameStatus.picker + '</strong> is picking the letters';
      let length = gameStatus.currentLetters.length;
      letterCount.innerHTML = (charLength - length) + " letters left";
      gameStatus.currentLetters.forEach(letters => {
        screenArea.innerHTML += "<span id=\"character-\"" + length + ">" + letters + "</span>";
      });
    })


  $('form').submit((e) => {
    e.preventDefault();
    let wordLength = parseInt(submitBtn.value);
    let answer = $('#answer').val();
    console.log(answer.length);
    console.log(wordLength);
    if(answer.length === wordLength){
      console.log('match');
      // check the word from generated results
      socket.emit('evaluate', answer);
    } else {
      alert(`Your answer does not match the wordlength(${wordLength}) you specified!`);
    }
    $('#answer').val('');
  });


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
        let time = 1;
        startTimer = setInterval(() => {
          if(time === 0){
            clearInterval(startTimer);
            socket.emit('setTimer', "Time's up!");
            socket.emit('end-round', containers);
          } else {
            time--;
            socket.emit('setTimer', time + " seconds left");
          }
        },1000);
      }, 1000);
    }
  });
}

window.onload = init();