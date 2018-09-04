var fs = require('fs')
var path = require('path')
var generateRssFeedFromComicObject = require('./generate-rss-feed-from-comic-object.js')
var generatePreviewPageFromComicObject = require('./generate-preview-page-from-comic-object.js')
var generateMainPageFromComicObjects = require('./generate-main-page-from-comic-objects.js')
var generateRssFeedItemFromComicStrip = require('./generate-rss-feed-item-from-comic-strip.js')
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

		comicObject.comicStrips.slice(0, 3).forEach(function (comicStrip) {
			var uniqueString = comicStrip.comicImageUrl.split('/').pop()
			var filename = '../../rssitemcontent/' + comicStrip.date + '/' + uniqueString + '.html'
			var rssitemcontent = generateRssFeedItemFromComicStrip(comicObject, comicStrip)
			try {
				writeFile(filename, rssitemcontent)
			} catch (e) {
				if (e.code === 'ENOENT') {
					fs.mkdirSync(path.resolve(__dirname, '../../rssitemcontent/' + comicStrip.date))
					writeFile(filename, rssitemcontent)
				} else {
					throw e
				}
			}
		})
	})
}

function writeFile(filename, contents) {
	var filePath = path.resolve(__dirname, filename)
	fs.writeFileSync(filePath, contents, 'utf-8')
}

writeFilesFromComicObjects(comicObjects)
