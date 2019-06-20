var pEach = require('p-map-series')
var writeFile = require('../lib/write-file.js')
var getPageList = require('./get-page-list.js')
var getComicObject = require('./get-comic-object.js')
var comicObjects = require('../tmp/_comic-objects.json')
var isDebug = !!process.env.DEBUG

getPageList()
	.then(function (pageList) {
		if (!pageList.length) {
			throw new Error('No comics found')
		}
		if (isDebug) {
			pageList = pageList.slice(0, 10)
		}
		return pEach(pageList, function (page) {
			var comicObjectIndex = comicObjects.findIndex(function (comicObject) {
				return (comicObject && comicObject.basename === page.basename)
			})
			var comicObject = comicObjects[comicObjectIndex]
			if (isDebug) console.log((comicObject ? '' : 'New: ') + comicObject.basename)

			return getComicObject(page, comicObject)
				.then(function (newComicObject) {
					if (newComicObject) {
						if (comicObject) {
							if (isDebug) {
								var oldDate = comicObject.comicStrips[0].date
								var newDate = newComicObject.comicStrips[0].date
								if (oldDate !== newDate) {
									console.log(`  Replacing ${oldDate} with ${newDate}`)
								}
							}
							comicObjects[comicObjectIndex] = newComicObject
						} else {
							comicObjects.push(newComicObject)
						}
					}
				})
				.catch(function (err) {
					if (isDebug) console.log(err)
					if (err.message === 'Comic no longer exists') return null

					console.error(page.basename + ' ' + err.message)
				})
		})
	})
	.then(function (_) {
		writeFile('../tmp/_comic-objects.json', JSON.stringify(comicObjects, null, '\t'))
	})
	.catch(function (err) {
		console.error(err)
		process.exit(1)
	})
