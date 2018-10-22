const {Lexicon, Lexeme} = require('./src/index');

let phrase = new Lexeme('hello there', ['ArrivalSalutation']);
let lex = new Lexicon();
lex.addEntry(phrase);
// To JSON
console.log(lex.json);
// To json file
lex.toFile('test.json');
// To text file
lex.toFile('test.txt');
// From json file
Lexicon.fromFile('test.json').then(instance => {
  console.log('instance', instance);
});
// From txt file
Lexicon.fromFile('test.txt').then(instance => {
  console.log('instance', instance);
});
