const httpGet = require('./http-get.js')
const { resolve } = require('url')

module.exports = function getComicSeriesObject(page, cachedSeriesObject) {
	var strips = []
	var previousUrls = []
	if (cachedSeriesObject) {
		previousUrls = cachedSeriesObject.strips.map(strip => strip.url)
	}
	const seriesUrl = 'https://www.gocomics.com' + page.todayHref

	return Promise.resolve(seriesUrl)
		.then(getStripPage)
		.then(getStripPage)
		.then(getStripPage)
		.then(getStripPage)
		.then(getStripPage)
		.then(function () {
			if (cachedSeriesObject && ! strips.length) {
				// If no new info was gathered, then avoid changing the cached copy
				return cachedSeriesObject
			}
			if (cachedSeriesObject) {
				strips = strips.concat(cachedSeriesObject.strips)
			}

			return {
				basename: page.basename,
				author: page.author,
				title: page.title,
				url: seriesUrl,
				imageUrl: strips[0].headerImageUrl,
				isPolitical: page.isPolitical,
				language: page.language,
				strips
			}
		})

	function getStripPage(stripPageUrl) {
		if (! stripPageUrl || previousUrls.indexOf(stripPageUrl) !== -1) {
			return null
		}

		return httpGet(stripPageUrl)
		.then(function (html) {
			var strip = parseStripPage(html)
			if (previousUrls.indexOf(strip.url) !== -1) {
				console.log(`Previous day does not match (${ page.basename })`)
				return null
			}
			strips.push(strip)
			if (! strip.isMostRecentStrip) return resolve(stripPageUrl, strip.olderRelUrl)
		})
	}
}


function parseStripPage(html) {
	const imageUrlMatches = html.match(/<meta property="og:image" content="([^">]+)"/)
	const dateMatches = html.match(/<meta property="article:published_time" content="([^">]+)"/)
	const authorMatches = html.match(/<meta property="article:author" content="([^">]+)"/)
	const urlMatches = html.match(/<input .*?value="([^"]+)".+?aria-label=["']Get the permalink["']/)
	const isMostRecentStrip = /<a.+class=["'][^"']*fa-caret-left[^"']*disabled/.test(html)
	const olderRelUrlMatches = html.match(/<a.+href=["'](.*?)["'] class=["'][^"']*fa-caret-left/)
	const newerRelUrlMatches = html.match(/<a.+href=["'](.*?)["'] class=["'][^"']*fa-caret-right/)
	const headerImageUrlMatches = html.match(/src="(https:\/\/avatar\.amuniversal\.com\/.+?)"/) || []

	if (urlMatches === null || ! urlMatches[1]) throw new Error('Unable to parse url')
	const url = urlMatches[1]
	if (imageUrlMatches === null || ! imageUrlMatches[1]) throw new Error('Unable to parse comicImageUrl in ' + url)
	if (dateMatches === null || ! dateMatches[1]) throw new Error('Unable to parse date in ' + url)
	if (authorMatches === null || ! authorMatches[1]) throw new Error('Unable to parse author in ' + url)
	if (olderRelUrlMatches === null || (! olderRelUrlMatches[1] && ! isMostRecentStrip)) throw new Error('Unable to parse olderRelUrl in ' + url)
	if (newerRelUrlMatches === null) throw new Error('Unable to parse newerRelUrl in ' + url)

	return {
		imageUrl: imageUrlMatches[1],
		date: dateMatches[1],
		author: authorMatches[1],
		url,
		isMostRecentStrip,
		olderRelUrl: olderRelUrlMatches[1],
		// newerRelUrl: newerRelUrlMatches[1],
		headerImageUrl: headerImageUrlMatches[1]
	}
}
