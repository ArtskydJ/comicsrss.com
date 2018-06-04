var fs = require('fs')
var path = require('path')
var generateRssFeedFromComicObject = require('./generate-rss-feed-from-comic-object.js')
var generatePreviewPageFromComicObject = require('./generate-preview-page-from-comic-object.js')
var generateMainPageFromComicObjects = require('./generate-main-page-from-comic-objects.js')
var comicObjects = require('../tmp/_comic-objects')

function writeFilesFromComicObjects(comicObjects) {
	comicObjects = comicObjects.filter(Boolean)
	var mainPageHtml = generateMainPageFromComicObjects(comicObjects)
	writeFile('../../index.html', mainPageHtml)
	
	comicObjects.forEach(function (comicObject) {
		if (!comicObject) return null

		var rssFeed = generateRssFeedFromComicObject(comicObject)
		writeFile('../../rss/' + comicObject.basename + '.rss', rssFeed)

		var previewPage = generatePreviewPageFromComicObject(comicObject)
		writeFile('../../preview/' + comicObject.basename + '.html', previewPage)
	})
}

function writeFile(filename, contents) {
	var filePath = path.resolve(__dirname, filename)
	fs.writeFileSync(filePath, contents, 'utf-8')
}

writeFilesFromComicObjects(comicObjects)
