const fetch = require('./lib/fetch.js')
const multipageScraper = require('./lib/multipage-scraper.js')
const { query_html, element_to_text } = require('./lib/query-html.js')

async function getSeriesObjects() {
	const base = 'https://comicskingdom.com/'
	const html = await fetch(base)
	const $ = query_html(html)

	const seriesObjectEntries = $('.comic-link-group .comic-link a')
		.map(a_element => {
			const basename = a_element.attribs.href
			const titleMatches = element_to_text(a_element)

			return [ basename, {
				author: null,
				title,
				url: base + basename,
				mostRecentStripUrl: base + basename + '/' + (new Date().toISOString().slice(0, 10)),
				isPolitical: null,
				language: 'eng'
			}]
		})
	return Object.fromEntries(seriesObjectEntries)
}

const dumbRateLimit = () => new Promise(resolve => setTimeout(resolve, global.DEBUG ? 0 : 900)) // 800 might work, 700 doesn't

async function getStrip(stripPageUrl) {
	await dumbRateLimit()
	const html = await fetch(stripPageUrl)
	const $ = query_html(html)
	const imageUrlMatches = $('meta[property="og:image"]')[0].attribs.content
	const dateMatches = element_to_text($('title')[0]).trim().slice(-10)
	const authorMatches = element_to_text($('#comic-hero .author p')[0])
	const urlMatches = $('.breadcrumbs .active')[0].attribs.href
	const isOldestStrip = /<a.+class=["'][^"']*fa-caret-left[^"']*disabled/.test(html)
	const olderRelUrlMatches = html.match(/<a.+href=["'](.*?)["'] class=["'][^"']*fa-caret-left/)
	const newerRelUrlMatches = html.match(/<a.+href=["'](.*?)["'] class=["'][^"']*fa-caret-right/)
	const headerImageUrlMatches = html.match(/src="(https:\/\/avatar\.amuniversal\.com\/.+?)"/) || []

	if (urlMatches === null || ! urlMatches[1]) throw new Error('Unable to parse url')
	const url = urlMatches[1]
	if (imageUrlMatches === null || ! imageUrlMatches[1]) throw new Error('Unable to parse comicImageUrl in ' + url)
	if (dateMatches === null || ! dateMatches[1]) throw new Error('Unable to parse date in ' + url)
	if (authorMatches === null || ! authorMatches[1]) throw new Error('Unable to parse author in ' + url)
	if (olderRelUrlMatches === null || (! olderRelUrlMatches[1] && ! isOldestStrip)) throw new Error('Unable to parse olderRelUrl in ' + url)
	if (newerRelUrlMatches === null) throw new Error('Unable to parse newerRelUrl in ' + url)

	return {
		imageUrl: imageUrlMatches[1],
		date: dateMatches[1],
		author: authorMatches[1],
		url,
		isOldestStrip,
		olderRelUrl: olderRelUrlMatches[1],
		// newerRelUrl: newerRelUrlMatches[1],
		headerImageUrl: headerImageUrlMatches[1]
	}
}

module.exports = cachedSeriesObjects => multipageScraper({ getSeriesObjects, getStrip, cachedSeriesObjects })
