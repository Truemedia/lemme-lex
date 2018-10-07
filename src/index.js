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

    toJson()
    {
        return this.lexemes.map( (lexeme) => lexeme.toJson() );
    }
}

class Lexeme
{
    constructor(word, tags)
    {
        this.word = word;
        this.tags = tags;
    }

    toJson()
    {
        return {[this.word]: this.tags};
    }
}

module.exports = {Lexicon, Lexeme};
