var fs = require('fs')
var path = require('path')
var pMap = require('p-map-series')
var getPageList = require('./get-page-list.js')
var getComicObject = require('./get-comic-object.js')
var writeFilesFromComicObjects = require('./write-files-from-comic-objects.js')

getPageList()
	.then(function (pageUrls) {
		return pMap(pageUrls, function (pageUrl) {
			return getComicObject(pageUrl)
				.then(function (comicObject) {
					if (!comicObject) return null

					return comicObject
				})
				.catch(function (err) {
					if (err.message === 'Comic no longer exists') return null

					console.error(pageUrl + ' ' + err.message)
				})
		})
	})
	.then(function (comicObjects) {
		writeFile('../tmp/_comic-objects.json', JSON.stringify(comicObjects))

		writeFilesFromComicObjects(comicObjects)
	})
	.catch(function (err) {
		console.error(err)
		process.exit(1)
	})

function writeFile(filename, contents) {
	var filePath = path.resolve(__dirname, filename)
	fs.writeFileSync(filePath, contents, 'utf-8')
}
