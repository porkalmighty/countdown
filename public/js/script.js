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
  letterCount.innerHTML = charLength + " letters left";
  $('form').submit((e) => {
    e.preventDefault();
    let ans = document.querySelector('#answer').value.toLowerCase();
    let letters = ['vowel', 'consonant'];
    let requestedLetter = "";

    // make the array length fixed
    if(containers.length === 9){
      // TODO: stop the round
      console.log('picking phase over');
    } else {
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
      screenArea.innerHTML += "<span id=\"character-\"" + containers.length + ">" + requestedLetter.toUpperCase() + "</span>";
      // store the letters in the array
      containers.push(requestedLetter);
      console.log(containers.length);
      charLength--;
    }

    letterCount.innerHTML = charLength === 0 ?  "The picking phase is over" : charLength + " letters left";
  });
});
