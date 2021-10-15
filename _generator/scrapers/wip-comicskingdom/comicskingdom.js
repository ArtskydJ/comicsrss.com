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
	const imageUrl = $('meta[property="og:image"]')[0].attribs.content
	const date = element_to_text($('title')[0]).trim().slice(-10)
	const author = element_to_text($('#comic-hero .author p')[0])
	const url = $('.breadcrumbs .active')[0].attribs.href
	const headerImageUrlMatches = $('#comic-hero .background')[0].attribs.style.match(/(https:\/\/[^'"); ]+)/) || []
	// const isOldestStrip = /<a.+class=["'][^"']*fa-caret-left[^"']*disabled/.test(html)
	// const olderRelUrl = $(/<a.+href=["'](.*?)["'] class=["'][^"']*fa-caret-left/)
	// const newerRelUrl = $(/<a.+href=["'](.*?)["'] class=["'][^"']*fa-caret-right/)
	// const headerImageUrlMatches =

	return {
		imageUrl,
		date,
		author,
		url,
		isOldestStrip,
		olderRelUrl,
		// newerRelUrl,
		headerImageUrl: headerImageUrlMatches[1]
	}
}

module.exports = cachedSeriesObjects => multipageScraper({ getSeriesObjects, getStrip, cachedSeriesObjects })
