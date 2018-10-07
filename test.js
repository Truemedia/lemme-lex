const {Lexicon, Lexeme} = require('./src/index');

let phrase = new Lexeme('hello there', ['ArrivalSalutation']);
let lex = new Lexicon();
lex.addEntry(phrase);
console.log(lex.toJson());
