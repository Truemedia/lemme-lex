const Kuroshiro = require('kuroshiro');
const kuroshiro = new Kuroshiro();
const KuromojiAnalyzer = require('kuroshiro-analyzer-kuromoji');
const Expander = require('./expander');

module.exports = class JaExpander extends Expander
{
    constructor(phrase, opts)
    {
      super(phrase);
      this.opts = Object.assign({
        hiragana: true,
        katakana: true,
        romaji: true
      }, opts);
    }

    expanded()
    {
      return kuroshiro.init( new KuromojiAnalyzer({}) )
      .then( () => {
        return Promise.all([
          this.opts.hiragana ? kuroshiro.convert(this.phrase, { to: 'hiragana' }) : null,
          this.opts.katakana ? kuroshiro.convert(this.phrase, { to: 'katakana' }) : null,
          this.opts.romaji ? kuroshiro.convert(this.phrase, { to: 'romaji' }) : null
        ]);
      }).then(spellings => {
        let [hiragana, katakana, romaji] = spellings;
        return {hiragana, katakana, romaji};
      })
    }
}
