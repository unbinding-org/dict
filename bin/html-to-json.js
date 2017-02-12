/*
  html-to-json.js

  take an en html dict file from SC and convert it to JSON
  usage: node bin/html-to-json file.html

  var word = {
    label: "gatī",
    case: "feminine",
    see: "gati"
    definitions: []
  }
*/

const fs = require('fs')
const filepath = process.argv[2]
const cheerio = require('cheerio')
const html = fs.readFileSync(filepath).toString()
const $ = cheerio.load(html)

const words = $('dl').map(function (i, el) {
  let word = {}

  const regular = $(el).find('.regular').first().text()
  const definitions = $(el).find('ol').first().children('li').map(toDef).get()

  word.label = $(el).children('dt').first('dfn').text()
  word.case = $(el).children('dd').find('.case').first().text()

  if (regular) 
    word.regular = regular

  if (definitions.length) 
    word.definitions = definitions

  return word

  function toDef (i, el) {
    let text = $(el).text()

    // handle the case where a word refers to another one
    if (text.slice(0, 5) === '(see ') {
      const closing = text.indexOf(')')
      const note = text.slice(closing + 1)
      // sometimes there's additional notes after the (see... ) reference
      if (note) word.see_note = note
      word.see = text.slice(0, closing).slice(5)
      return
    } 
    
    return text
  }
}).get()

dict = {}
words.forEach(word => dict[word.label] = word)
console.log(dict)



