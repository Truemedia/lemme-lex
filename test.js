const {Lexicon, Lexeme} = require('./src/index');

let testLocales = {
  'en_GB': { // English (British)
    run: false,
    phrase: 'hello'
  },
  'ja_JP': { // Japanese
    run: true,
    phrase: 'お早う御座います'
  }
};

let tags = ['ArrivalSalutation'];

Object.entries(testLocales).map(entry => {
  let [locale, settings] = entry;
  if (settings.run) {
    // Build data
    let lex = new Lexicon();
    let phrase = new Lexeme(settings.phrase, tags, locale);
    lex.addEntry(phrase);

    // Run tests
    Promise.all([
      lex.toFile(`test/${locale}.json`).then(msg => {
        console.log(msg)
        return Lexicon.fromFile(`test/${locale}.json`).then(instance => { // From json file
          return instance;
        });
      }), // To and from json file
      lex.toFile(`test/${locale}.txt`).then(msg => {
        console.log(msg)
        return Lexicon.fromFile(`test/${locale}.txt`).then(instance => { // From txt file
          return instance;
        });
      }) // To and from text file
    ]).then((instances) => {
      let [json, txt] = instances;
      console.log(`from JSON (${locale})`, json);
      console.log(`from TXT (${locale})`, txt);
      lex.object.then(obj => console.log(`from build (${locale})`, obj)); // To JSON
    });
  }
});
