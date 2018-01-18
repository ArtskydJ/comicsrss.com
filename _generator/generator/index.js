var fs = require('fs')
var path = require('path')
var generateRssFeedFromComicObject = require('./generate-rss-feed-from-comic-object.js')
var generateMainPageFromComicObjects = require('./generate-main-page-from-comic-objects.js')

function writeFilesFromComicObjects(comicObjects) {
	var mainPageHtml = generateMainPageFromComicObjects(comicObjects)
	writeFile('../../index.html', mainPageHtml)
	
	comicObjects.forEach(function (comicObject) {
		if (!comicObject) return null

		var rssFeed = generateRssFeedFromComicObject(comicObject)
		writeFile('../../rss/' + comicObject.filename, rssFeed)
	})
}

function writeFile(filename, contents) {
	var filePath = path.resolve(__dirname, filename)
	fs.writeFileSync(filePath, contents, 'utf-8')
}

if (require.main === module) {
	var comicObjects = require('../tmp/_comic-objects')
	writeFilesFromComicObjects(comicObjects)
}

module.exports = writeFilesFromComicObjects
