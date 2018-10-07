# Lemme Lex
A library for creating dictionaries that can be utilised by NLP tools

## Installation

NPM
```bash
    npm i --save lemme-lex
```

Yarn
```bash
    yarn add lemme-lex
```

## Usage

```js
const {Lexicon, Lexeme} = require('lemme-lex');
let phrase = new Lexeme('hello there', ['ArrivalSalutation']);
let lex = new Lexicon();
lex.addEntry(phrase);
console.log(lex.toJson()); // Should output an object
```
