const { resolve } = require('url')

module.exports = async function multipageScraper({ getSeriesObjects, getStrip, cachedSeriesObjects }) {
	const newSeriesObjects = await getSeriesObjects()

	let seriesObjectsKeys = Object.keys(newSeriesObjects)
	if (! seriesObjectsKeys.length) {
		throw new Error('No comics found')
	}
	if (global.DEBUG) {
		seriesObjectsKeys = seriesObjectsKeys.slice(0, 10)
	}
	for (const basename of seriesObjectsKeys) {
		const newSeriesObject = newSeriesObjects[basename]
		const cachedSeriesObject = cachedSeriesObjects[basename]
		const cachedStrips = cachedSeriesObject && cachedSeriesObject.strips || []
		if (global.VERBOSE) {
			console.log((cachedSeriesObject ? '' : 'New: ') + basename)
		}

		try {
			const finalSeriesObject = await getStrips(getStrip, newSeriesObject, cachedStrips)

			if (finalSeriesObject) {
				// insert the series into into the cache, or overwrite the cached series
				cachedSeriesObjects[basename] = finalSeriesObject
			}
		} catch (err) {
			if (global.VERBOSE) {
				console.error(err)
			}

			if (err.res) {
				const { statusCode, headers } = err.res
				if (statusCode >= 300 && statusCode < 400 && headers && headers.location === 'https://www.gocomics.com/') {
					return null
				}
			}

			console.error(basename + ' ' + err.message)
			if (newSeriesObject.mostRecentStripUrl) {
				console.error(newSeriesObject.mostRecentStripUrl)
			}
		}
	}

	return cachedSeriesObjects
}

async function getStrips(getStrip, newSeriesObject, cachedStrips) {
	const strips = []
	const previousUrls = cachedStrips.map(strip => strip.url)

	return Promise.resolve(newSeriesObject.mostRecentStripUrl)
		.then(getStripPage)
		.then(getStripPage)
		.then(getStripPage)
		.then(getStripPage)
		.then(getStripPage)
		.then(getStripPage)
		.then(getStripPage)
		.then(getStripPage)
		.then(getStripPage)
		.then(getStripPage)
		.then(getStripPage)
		.then(getStripPage)
		.then(getStripPage)
		.then(getStripPage)
		.then(getStripPage)
		.then(() => {
			if (! strips.length) {
				// If no new info was gathered, then avoid changing the cached copy
				return null
			}
			return Object.assign(newSeriesObject, {
				strips: strips.concat(cachedStrips),
				imageUrl: strips[0].headerImageUrl,
				author: strips[0].author,
			})
		})

	async function getStripPage(stripPageUrl) {
		if (! stripPageUrl || previousUrls.includes(stripPageUrl) || previousUrls.includes(decodeURI(stripPageUrl))) {
			return null
		}

		const strip = await getStrip(stripPageUrl)

		if (! previousUrls.includes(strip.url)) {
			strips.push(strip)
		}
		if (! strip.isOldestStrip) {
			return resolve(stripPageUrl, strip.olderRelUrl)
		}
	}
}
