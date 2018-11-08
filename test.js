const {Lexicon, Lexeme} = require('./src/index');

let testLocales = {
  'en_GB': false,
  'ja_JP': true
};

/**
  * English
  */
if (testLocales['en_GB']) {
  let enPhrase = new Lexeme('hello', ['ArrivalSalutation']);
  let enLex = new Lexicon();
  enLex.addEntry(enPhrase);
  enLex.object.then(lex => console.log(lex)); // To JSON
  enLex.toFile('test/en_GB.json'); // To json file
  enLex.toFile('test/en_GB.txt'); // To text file
  Lexicon.fromFile('test/en_GB.json').then(instance => { // From json file
    console.log('instance', instance);
  });
  Lexicon.fromFile('test/en_GB.txt').then(instance => { // From txt file
    console.log('instance', instance);
  });
}

/**
  * Japanese
  */
if (testLocales['ja_JP']) {
  // Build data
  let jaLex = new Lexicon();
  let jaPhrase = new Lexeme('お早う御座います', ['ArrivalSalutation'], 'ja_JP');
  jaLex.addEntry(jaPhrase);

  // Run tests
  Promise.all([
    jaLex.toFile('test/ja_JP.json').then(msg => {
      console.log(msg)
      return Lexicon.fromFile('test/ja_JP.json').then(instance => { // From json file
        return instance;
      });
    }), // To and from json file
    jaLex.toFile('test/ja_JP.txt').then(msg => {
      console.log(msg)
      return Lexicon.fromFile('test/ja_JP.txt').then(instance => { // From txt file
        return instance;
      });
    }) // To and from text file
  ]).then((instances) => {
    let [json, txt] = instances;
    console.log('from JSON', json);
    console.log('from TXT', txt);
    jaLex.object.then(lex => console.log('from build', lex)); // To JSON
  });
}
