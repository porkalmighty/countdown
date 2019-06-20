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
  const letterCount = document.querySelector('#letter-count');
  const timer = document.querySelector('.timer');

  letterCount.innerHTML = charLength + " letters left";

  $('.chars').click((e) => {
    let requestedLetter = '';
    let ans = e.target.value;
    if(containers.length != 9){
      requestedLetter = generate(ans);
      screenArea.innerHTML += "<span id=\"character-\"" + containers.length + ">" + requestedLetter.toUpperCase() + "</span>";
      // store the letters in the array
      containers.push(requestedLetter);
      charLength--;
    }

    letterCount.innerHTML = charLength === 0 ?  "The picking phase is over" : charLength + " letters left";

    if(charLength === 0) {
      $('.chars').prop('disabled', true);
      timer.innerHTML = "starting in 5 seconds";
      const start = setTimeout(setTimer(timer), 5000);
    }
  });
});
