const fs = require('fs');
const path = require('path');
const Json2csvParser = require('json2csv').Parser;
const jsonfile = require('jsonfile');
const lineReader = require('line-reader');

class Lexicon
{
    constructor(locale = 'en_GB')
    {
      this.lexemes = [];
    }

    addEntry(lexeme)
    {
      this.lexemes.push(lexeme);
    }

    addEntries(lexemes)
    {
      this.lexemes.push(...lexemes);
    }

    /**
      * Get lexicon words grouped by tag ({tag: [...words]})
      */
    get byTags()
    {
      let obj = {};
      this.uniqueTags.map(tag => {
        obj[tag] = this.lexemes.filter(lexeme => {
          return lexeme.hasTag(tag)
        }).map(lexeme => lexeme.word);
      });
      return obj;
    }

    /**
      * Get lexicon as list
      */
    get list()
    {
      return this.lexemes.map(lexeme => { return lexeme.flat; });
    }

    /**
      * Get lexicon as object
      */
    get object()
    {
      return Object.assign(...this.json);
    }

    /**
      * Get lexicon as JSON
      */
    get json()
    {
      return this.lexemes.map( (lexeme) => lexeme.json );
    }

    static fromFile(filename)
    {
      let basename = path.basename(filename);
      let [name, ext] = basename.split('.');
      switch (ext)
      {
        case 'json':
          return jsonfile.readFile(filename)
            .then(obj => {
              let instance = new this;
              instance.addEntries(
                Object.entries(obj).map(entry => {
                  let [name, tags] = entry;
                  return new Lexeme(name, tags);
                })
              );
              return instance;
            });
        break;
        case 'txt':
          return new Promise( (resolve, reject) => {
            let instance = new this;
            lineReader.eachLine(filename, function(line, last) {
              let values = line.split('" "').map(value => value.replace('"', ''));
              let name = values.shift();
              instance.addEntry( new Lexeme(name, values) );
              if (last) {
                resolve(instance);
              }
            });
          });
        break;
      }
      return new this();
    }

    get txt()
    {
      let opts = {header: false, delimiter: ' '};
      let parser = new Json2csvParser(opts);
      let txt = parser.parse(this.list);
      return txt;
    }

    /**
      * Get unique tags present in lexemes
      */
    get uniqueTags()
    {
      return Array.from( new Set(
        ...this.lexemes.map(lexeme => lexeme.tags)
      ));
    }

    toFile(filename)
    {
      let basename = path.basename(filename);
      let [name, ext] = basename.split('.');

      return new Promise( (resolve, reject) => {
        switch (ext)
        {
          case 'json':
            jsonfile.writeFile(filename, this.object, { spaces: 2 }, function(err) {
              if (err) console.error(err);
              let msg = `JSON file saved to disk: ${filename}`;
              resolve(msg);
            });
          break;
          case 'txt':
            fs.writeFile(filename, this.txt, function(err) {
              if (err) console.log(err);
              let msg = `Text file saved to disk: ${filename}`;
              resolve(msg);
            });
          break;
        }
      });
    }
}

class Lexeme
{
    constructor(word, tags)
    {
        this.word = word;
        this.tags = tags;
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
      * Check if record has matching tag
      */
    hasTag(tag)
    {
      return this.tags.includes(tag);
    }
}

module.exports = {Lexicon, Lexeme};
