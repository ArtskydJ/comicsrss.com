const pEach = require('p-map-series')
const getSeriesObjects = require('./get-series-objects.js')
const getStrips = require('./get-strips.js')

module.exports = function main(cachedSeriesObjects) {
	return getSeriesObjects()
	.then(function (newSeriesObjects) {
		var seriesObjectsKeys = Object.keys(newSeriesObjects)
		if (! seriesObjectsKeys.length) {
			throw new Error('No comics found')
		}
		if (global.DEBUG) {
			seriesObjectsKeys = seriesObjectsKeys.slice(0, 10)
		}
		return pEach(seriesObjectsKeys, function (basename) {
			var newSeriesObject = newSeriesObjects[basename]
			var cachedSeriesObject = cachedSeriesObjects[basename]
			const cachedStrips = cachedSeriesObject && cachedSeriesObject.strips || []
			if (global.VERBOSE) console.log((cachedSeriesObject ? '' : 'New: ') + basename)

			return getStrips(newSeriesObject, cachedStrips)
			.then(function (finalSeriesObject) {
				if (finalSeriesObject) {
					// insert the series into into the cache, or overwrite the cached series
					cachedSeriesObjects[basename] = finalSeriesObject
				}
			})
			.catch(function (err) {
				if (global.VERBOSE) console.log(err)
				if (err.message === 'Comic no longer exists') return null

				console.error(basename + ' ' + err.message)
				if (newSeriesObject.mostRecentStripUrl) {
					console.error(newSeriesObject.mostRecentStripUrl)
				}
			})
		})
	})
	.then(function (_) {
		return cachedSeriesObjects
	})
}
