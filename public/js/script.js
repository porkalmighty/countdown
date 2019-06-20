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
function setTimer(element){
  let timer = 30;
  let startTimer = setInterval(() => {
    if(timer === 0){
      clearInterval(startTimer);
      element.innerHTML = "Time's up!";
      // TODO: check inputs in dictionary

    } else {
      timer--;
      element.innerHTML = timer + ' seconds left';
    }
  },1000);
}
// TODO: game logic
// TODO: score system
// TODO: emitting values

// connection
$(function() {
  var socket = io();
  var charLength = 9;
  const containers = new Array();
  const screenArea = document.querySelector('.screen-area');
  const chatMsg = document.querySelector('#chat-msg');
  const letterCount = document.querySelector('#letter-count');
  const timer = document.querySelector('.timer');

  letterCount.innerHTML = charLength + " letters left";

  $('.chars').click((e) => {
    let requestedLetter = '';
<<<<<<< HEAD
    let msg = document.querySelector('#answer').value;
    let ans = msg.toLowerCase();

    // add chat to window
    chatMsg.innerHTML += "<li>" + msg + "</li>";

    if(containers.length != 9){
      if(ans.includes(letters[0]))
      {
        // TODO: generate a random vowel
        requestedLetter = generate(letters[0]);
        console.log('you requested a vowel: '  + requestedLetter);
      } else if(ans.includes(letters[1])) {
        // TODO: generate a random consonant
        requestedLetter = generate(letters[1]);
        console.log('you requested a consonant: ' + requestedLetter);
      }
      screenArea.innerHTML += "<span id=\"character-" + containers.length + "\">" + requestedLetter.toUpperCase() + "</span>";

      if(ans.includes(letters[0]) || ans.includes(letters[1])) {
        // store the letters in the array
        containers.push(requestedLetter);
        console.log(containers.length);
        charLength--;
      }
=======
    let ans = e.target.value;
    if(containers.length != 9){
      requestedLetter = generate(ans);
      screenArea.innerHTML += "<span id=\"character-\"" + containers.length + ">" + requestedLetter.toUpperCase() + "</span>";
      // store the letters in the array
      containers.push(requestedLetter);
      charLength--;
>>>>>>> 275b4623d2178fa4ef46e883220342f187bc02e6
    }

    letterCount.innerHTML = charLength === 0 ?  "The picking phase is over" : charLength + " letters left";

    if(charLength === 0) {
      $('.chars').prop('disabled', true);
      timer.innerHTML = "starting in 5 seconds";
      const start = setTimeout(setTimer(timer), 5000);
    }
  });
});
