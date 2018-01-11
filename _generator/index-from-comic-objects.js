var fs = require('fs')
var path = require('path')
var generateRssFeedFromComicObject = require('./generate-rss-feed-from-comic-object.js')
var generateMainPageFromComicObjects = require('./generate-main-page-from-comic-objects.js')
var comicObjects = require('./_comic-objects.json')

// comicObjects.forEach(function (comicObject) {
// 	if (!comicObject) return null

// 	var rssFeed = generateRssFeedFromComicObject(comicObject)
// 	writeFile('rss/' + comicObject.filename, rssFeed)
// })

generateMainPageFromComicObjects(comicObjects)

// function writeFile(filename, contents) {
// 	var filePath = path.resolve(__dirname, '..', filename)
// 	fs.writeFileSync(filePath, contents, 'utf-8')
// }
