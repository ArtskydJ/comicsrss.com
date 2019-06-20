var pEach = require('p-map-series')
var comicObjectsIO = require('../../comic-objects-io.js')
var getPageList = require('./get-page-list.js')
var getComicObject = require('./get-comic-object.js')
var comicObjects = comicObjectsIO.read('gocomics')

getPageList()
	.then(function (pageList) {
		if (!pageList.length) {
			throw new Error('No comics found')
		}
		if (DEBUG) {
			pageList = pageList.slice(0, 10)
		}
		return pEach(pageList, function (page) {
			var comicObjectIndex = comicObjects.findIndex(function (comicObject) {
				return (comicObject && comicObject.basename === page.basename)
			})
			var comicObject = comicObjects[comicObjectIndex]
			if (DEBUG) console.log((comicObject ? '' : 'New: ') + comicObject.basename)

			return getComicObject(page, comicObject)
				.then(function (newComicObject) {
					if (newComicObject) {
						if (comicObject) {
							if (DEBUG) {
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
					if (DEBUG) console.log(err)
					if (err.message === 'Comic no longer exists') return null

					console.error(page.basename + ' ' + err.message)
				})
		})
	})
	.then(function (_) {
		comicObjectsIO.write('gocomics', comicObjects)
	})
	.catch(function (err) {
		console.error(err)
		process.exit(1)
	})
