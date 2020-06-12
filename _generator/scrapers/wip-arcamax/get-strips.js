const httpGet = require('./http-get.js')
const { resolve } = require('url')

module.exports = function getStrips(newSeriesObject, cachedStrips) {
	var strips = []
	var previousUrls = cachedStrips.map(strip => strip.url)

	return Promise.resolve(newSeriesObject.mostRecentStripUrl)
		.then(getStripPage)
		.then(getStripPage)
		.then(getStripPage)
		.then(getStripPage)
		.then(getStripPage)
		.then(function () {
			if (! strips.length) {
				// If no new info was gathered, then avoid changing the cached copy
				return null
			}
			return Object.assign(newSeriesObject, {
				strips: strips.concat(cachedStrips),
				imageUrl: strips[0].headerImageUrl
			})
		})

	function getStripPage(stripPageUrl) {
		if (! stripPageUrl || previousUrls.includes(stripPageUrl) || previousUrls.includes(decodeURI(stripPageUrl))) {
			return null
		}

		return httpGet(stripPageUrl)
		.then(function (html) {
			var strip = parseStripPage(html)
			if (previousUrls.includes(strip.url)) {
				// 2019-10-29 This is happening every day for three spanish comics that have spaces in the URL.
				console.log(`Parsed URL (${ strip.url }) does not match requested URL (${ stripPageUrl })`)
				return null
			}
			strips.push(strip)
			if (! strip.isMostRecentStrip) return resolve(stripPageUrl, strip.olderRelUrl)
		})
	}
}


function parseStripPage(html) {
	const imageUrlMatches = html.match(/<img id="comic-zoom".+src="([^">]+)"/)
	const dateMatches = html.match(/var disqus_title = '.+ for ([\d/]+)';/)
	const authorMatches = html.match(/<cite>by (.+?)<\/cite>/)
	const urlMatches = html.match(/var disqus_url = '(.+?)';/)
	const isMostRecentStrip = /<a class="next-off" href="#">/.test(html)
	const olderRelUrlMatches = html.match(/<a.+class=["']prev["'].+href=["'](.*?)["']/)
	const newerRelUrlMatches = html.match(/<a.+class=["']next["'].+href=["'](.*?)["']/)
	const headerImageUrlMatches = html.match(/<meta property="og:image" content=["'](.+?)["']/)

	if (urlMatches === null || ! urlMatches[1]) throw new Error('Unable to parse url')
	const url = urlMatches[1]
	if (imageUrlMatches === null || ! imageUrlMatches[1]) throw new Error('Unable to parse comicImageUrl in ' + url)
	if (dateMatches === null || ! dateMatches[1]) throw new Error('Unable to parse date in ' + url)
	if (authorMatches === null || ! authorMatches[1]) throw new Error('Unable to parse author in ' + url)
	if (olderRelUrlMatches === null || (! olderRelUrlMatches[1] && ! isMostRecentStrip)) throw new Error('Unable to parse olderRelUrl in ' + url)
	// if (newerRelUrlMatches === null) throw new Error('Unable to parse newerRelUrl in ' + url)

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