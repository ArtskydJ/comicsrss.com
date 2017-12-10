var fs = require('fs')
var path = require('path')
var pMap = require('p-map-series')
var getPageList = require('./get-page-list.js')
var getComicObject = require('./get-comic-object.js')
var generateMainPageFromComicObjects = require('./generate-main-page-from-comic-objects.js')
var generateRssFeedFromComicObject = require('./generate-rss-feed-from-comic-object.js')

getPageList()
	.then(function (pageUrls) {
		return pMap(pageUrls, function (pageUrl) {
			return getComicObject(pageUrl)
				.then(function (comicObject) {
					if (!comicObject) return null

					var rssFeed = generateRssFeedFromComicObject(comicObject)
					writeFile('rss/' + comicObject.filename, rssFeed)

					return comicObject
				})
				.catch(function (err) {
					if (err.message === 'Comic no longer exists') return null

					console.error(pageUrl + ' ' + err.message)
				})
		})
	})
	.then(function (comicObjects) {
		writeFile('_generator/_comic-objects.json', JSON.stringify(comicObjects))
		generateMainPageFromComicObjects(comicObjects)
	})
	.catch(function (err) {
		console.error(err)
		process.exit(1)
	})

function writeFile(filename, contents) {
	var filePath = path.resolve(__dirname, '..', filename)
	fs.writeFileSync(filePath, contents, 'utf-8')
}
