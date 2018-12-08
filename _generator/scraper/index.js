var pMap = require('p-map-series')
var writeFile = require('../lib/write-file.js')
var getPageList = require('./get-page-list.js')
var getComicObject = require('./get-comic-object.js')
var previousComicObjects = require('../tmp/_comic-objects.json')
var isDebug = !!process.env.DEBUG

getPageList()
	.then(function (pageUrls) {
		if (!pageUrls.length) {
			throw new Error('No comics found')
		}
		if (isDebug) {
			pageUrls = pageUrls.slice(0, 3)
		}
		return pMap(pageUrls, function (pageUrl) {
			var basename = getBasename(pageUrl)
			var previousComicObject = previousComicObjects.find(function (comicObject) {
				return (comicObject && comicObject.basename === basename)
			})

			return getComicObject(pageUrl, previousComicObject)
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
		writeFile('../tmp/_comic-objects.json', JSON.stringify(comicObjects, null, '\t'))
	})
	.catch(function (err) {
		console.error(err)
		process.exit(1)
	})

function getBasename(pageUrl) {
	return pageUrl.split('/')[3].trim()
}
