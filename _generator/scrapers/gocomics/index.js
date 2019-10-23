const pEach = require('p-map-series')
const getPageList = require('./get-page-list.js')
const getSeriesObject = require('./get-comic-object.js')

module.exports = function main(seriesObjects) {
	return getPageList()
	.then(function (pageList) {
		if (!pageList.length) {
			throw new Error('No comics found')
		}
		if (global.DEBUG) {
			pageList = pageList.slice(0, 10)
		}
		return pEach(pageList, function (page) {
			const seriesObjectIndex = seriesObjects.findIndex(function (seriesObject) {
				return (seriesObject && seriesObject.basename.trim() === page.basename)
			})
			const seriesObject = seriesObjects[seriesObjectIndex] // might be undefined
			if (global.VERBOSE) console.log((seriesObject ? seriesObject.basename : 'New: '))

			return getSeriesObject(page, seriesObject)
				.then(function (newSeriesObject) {
					if (newSeriesObject) {
						if (seriesObject) {
							if (global.DEBUG) {
								const oldDate = seriesObject.comicStrips[0].date
								const newDate = newSeriesObject.comicStrips[0].date
								if (oldDate !== newDate) {
									console.log(`  Replacing ${oldDate} with ${newDate}`)
								}
							}
							seriesObjects[seriesObjectIndex] = newSeriesObject
						} else {
							seriesObjects.push(newSeriesObject)
						}
					}
				})
				.catch(function (err) {
					if (global.VERBOSE) console.log(err)
					if (err.message === 'Comic no longer exists') return null

					console.error(page.basename + ' ' + err.message)
				})
		})
	})
	.then(function (_) {
		return seriesObjects
	})
}
