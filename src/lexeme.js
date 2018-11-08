const JaExpander = require('./expander/ja_expander');

module.exports = class Lexeme
{
  /**
    * Create a Lexeme
    * @param {String} word - The word that the lexeme describes
    * @param {Array} tags - Tags used to associate the word to other simillar words
    * @param {String} locale - Locale code (language and country) phrase is applicable to
    * @param {Object} spellings - Context of different spellings of the same word
    */
  constructor(word = '', tags = [], locale = 'en_GB', spellings = {})
  {
    this.word = word;
    this.tags = tags;
    this.locale = locale;
    this.spellings = spellings;

    /**
      * Expander used for building on top of maluable data
      */
    switch (this.locale) {
      case 'ja_JP': // Cover spelling for different japanese alphabets (hiragana, katakana, romaji, kanji)
        this.expander = new JaExpander(this.word);
      break;
      default:
        this.expander = null;
      break;
    }
  }

  get spells()
  {
    return new Promise( (resolve, reject) => {
      if (this.hasSpellings) {
        resolve(this.spellings);
      } else { // No spellings, therefore autospell
        resolve( this.autospell() );
      }
    });
  }

  /**
    * Dictionary data (used when compiling lexicon)
    */
  get dict()
  {
    return this.spells.then(() => {
      let dict = {};
      Object.values(this.spellings).map(spelling => {
        dict[spelling] = this.flat;
      });
      return dict;
    });
  }

  /**
    * Check if lexeme has spellings
    */
  get hasSpellings()
  {
    return (Object.keys(this.spellings).length > 0);
  }

  /**
    * Get lexeme as flat array [name, ...tags]
    */
  get flat()
  {
    return [this.word].concat(this.tags);
  }

  /**
    * Get lexeme as object {name: tags}
    */
  get json()
  {
    return {[this.word]: this.tags};
  }

  /**
    * Get lexeme as record (suitable for db or api) {name, tags}
    */
  get record()
  {
    return {
      name: this.word, tags: this.tags
    };
  }

  /**
    * Add a spelling
    * @param {String} spelling - Spelled phrase
    * @param {String} context - Context of spelling
    */
  addSpelling(spelling, context = null)
  {
    if (context == null) {
      context = this.missingContext();
    }
    this.spellings[context] = spelling;
  }

  /**
    * Find the first context with no speling
    */
  missingContext()
  {
    let ctx = 'default';
    let match = Object.entries(this.expander.opts).find(ctx => {
      let [context, allowed] = ctx;
      if (allowed) {
        return (this.spellings[context] == undefined);
      } else {
        return false;
      }
    });

    if (match) {
      [ctx] = match;
    }
    return ctx;
  }

  /**
    * Automatically set spellings
    */
  autospell()
  {
    if (this.expander != null) {
      return this.expander.expanded().then(spellings => {
        this.spellings = spellings;
      }).then(() => {
        this.addSpelling(this.word, 'default');
      });
    } else {
      return this.json;
    }

    return expander;
  }

  /**
    * Check if record has matching tag
    */
  hasTag(tag)
  {
    return this.tags.includes(tag);
  }
}
