const { existsSync } = require('fs')
const { resolve } = require('url')

module.exports = async function masterScraper(scraperName, cachedSeriesObjects) {
	const scraper = (existsSync(`${__dirname}/${scraperName}/index.js`)) ? simpleScraper : multipageScraper
	return await scraper(scraperName, cachedSeriesObjects)
}

async function simpleScraper(scraperName, cachedSeriesObjects) {
	// console.log(`simple ${scraperName}`)
	const simpleScraper = require(`./${scraperName}/index.js`)
	return await simpleScraper(cachedSeriesObjects)
}

async function multipageScraper(scraperName, cachedSeriesObjects) {
	// console.log(`multipage ${scraperName}`)
	const getSeriesObjects = require(`./${scraperName}/get-series-objects.js`)
	const getStrip = require(`./${scraperName}/get-strip.js`)

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
		if (global.VERBOSE) console.log((cachedSeriesObject ? '' : 'New: ') + basename)

		try {
			const finalSeriesObject = await getStrips(getStrip, newSeriesObject, cachedStrips)

			if (finalSeriesObject) {
				// insert the series into into the cache, or overwrite the cached series
				cachedSeriesObjects[basename] = finalSeriesObject
			}
		} catch (err) {
			if (global.VERBOSE) console.log(err)
			if (err.message === 'Comic no longer exists') return null

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
		.then(() => {
			if (! strips.length) {
				// If no new info was gathered, then avoid changing the cached copy
				return null
			}
			return Object.assign(newSeriesObject, {
				strips: strips.concat(cachedStrips),
				imageUrl: strips[0].headerImageUrl,
				author: strips[0].author
			})
		})

	async function getStripPage(stripPageUrl) {
		if (! stripPageUrl || previousUrls.includes(stripPageUrl) || previousUrls.includes(decodeURI(stripPageUrl))) {
			return null
		}

		const strip = await getStrip(stripPageUrl)
		// Doesn't really work for arcamax:
		// if (previousUrls.includes(strip.url)) {
		// 	// 2019-10-29 This is happening every day for three spanish comics that have spaces in the URL.
		// 	console.log(`Parsed URL (${ strip.url }) does not match requested URL (${ stripPageUrl })`)
		// 	return null
		// }
		strips.push(strip)
		if (! strip.isOldestStrip) {
			return resolve(stripPageUrl, strip.olderRelUrl)
		}
	}
}
