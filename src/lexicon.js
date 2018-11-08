const fs = require('fs');
const path = require('path');
const Json2csvParser = require('json2csv').Parser;
const jsonfile = require('jsonfile');
const lineReader = require('line-reader');
const Lexeme = require('./lexeme');
const JaExpander = require('./expander/ja_expander');

module.exports = class Lexicon
{
    constructor()
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
      return this.object.then(obj => {
        return Object.entries(obj).map(entry => {
          let [spelling, tags] = entry;
          return [spelling].concat(tags);
        });
      });
    }

    /**
      * Get lexicon as object
      */
    get object()
    {
      return Promise.all(
        this.lexemes.map( (lexeme) => lexeme.dict )
      ).then(obj => {
        return Object.assign(...obj);
      });
    }

    /**
      * Build instance from file (json or txt file)
      * @param {String} filename - Path of file to load
      */
    static fromFile(filename)
    {
      let basename = path.basename(filename);
      let [locale, ext] = basename.split('.');
      switch (ext)
      {
        case 'json':
          return jsonfile.readFile(filename)
            .then(obj => {
              let instance = new this;
              let dict = {};

              Object.entries(obj).map(entry => {
                let [name, tags] = entry;
                let root = tags.shift();
                if (dict[root] == undefined) {
                  dict[root] = new Lexeme(root, tags, locale);
                }
                dict[root].addSpelling(name);
              });

              instance.addEntries( Object.values(dict) );
              return instance;
            });
        break;
        case 'txt':
          return new Promise( (resolve, reject) => {
            let instance = new this;
            let dict = {};
            lineReader.eachLine(filename, function(line, last) {
              let values = line.split('" "').map(value => value.replace('"', ''));
              let name = values.shift();
              let root = values.shift();
              if (dict[root] == undefined) {
                dict[root] = new Lexeme(root, values, locale);
              }
              dict[root].addSpelling(name);

              if (last) {
                instance.addEntries( Object.values(dict) );
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
      return this.list.then(lex => {
        let opts = {header: false, delimiter: ' '};
        let parser = new Json2csvParser(opts);
        let txt = parser.parse(lex);
        return txt;
      });
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

    /**
      * Save instance as file (json or txt file)
      * @param {String} filename - Path of file to save to
      */
    toFile(filename)
    {
      let basename = path.basename(filename);
      let [name, ext] = basename.split('.');

      return new Promise( (resolve, reject) => {
        switch (ext)
        {
          case 'json':
            this.object.then(content => {
              return jsonfile.writeFile(filename, content, { spaces: 2 });
            }).then(() => {
              let msg = `JSON file saved to disk: ${filename}`;
              resolve(msg);
            });
          break;
          case 'txt':
            this.txt.then(content => {
              fs.writeFile(filename, content, function(err) {
                if (err) console.log(err);
                let msg = `Text file saved to disk: ${filename}`;
                resolve(msg);
              });
            })
          break;
        }
      });
    }
}
