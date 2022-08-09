const fetch = require('./lib/fetch.js')
const multipageScraper = require('./lib/multipage-scraper.js')
const { query_html, element_to_text } = require('./lib/query-html.js')

async function getSeriesObjects() {
	const base = 'https://comicskingdom.com/'
	const html = await fetch(base)
	const $ = query_html(html)

	const seriesObjectEntries = $('.comics-lists .comics-list')
		.flatMap(list_div_element => {
			const a_elements = $('a', list_div_element)
			const is_political = element_to_text($('.comics-list-header', list_div_element)[0]).trim() === 'Political'
			return a_elements
				.map(a_element => ({ a_element, is_political }))
		})
		.map(({ a_element, is_political }) => {
			const href = a_element.attribs.href
			const slug = href.startsWith(base) ? href.replace(base, '') : href
			const title = element_to_text(a_element)

			return [ slug, {
				author: null,
				title,
				url: base + slug,
				mostRecentStripUrl: base + slug + '/' + (new Date().toISOString().slice(0, 10)),
				isPolitical: is_political,
				language: 'eng'
			}]
		})

	return Object.fromEntries(seriesObjectEntries)
}

async function getStrip(stripPageUrl) {
	const html = await fetch(stripPageUrl)
	const $ = query_html(html)

	const permalink = new URLSearchParams($('a[aria-label="FaceBook Share icon"]')[0].attribs.href.split('?')[1]).get('href')
	const older_a_element = $('.cv-nav:first-child a')[0]

	return {
		imageUrl: $('img#theComicImage')[0].attribs.src,
		date: permalink.slice(-10),
		author: element_to_text($('title')[0]).replace(/^.+? by /, ''),
		url: permalink,
		isOldestStrip: !older_a_element,
		olderRelUrl: older_a_element?.attribs?.href,
		newerRelUrl: $('.cv-nav:last-child a')[0].attribs.href,
		headerImageUrl: $('.feature-logo')[0]?.attribs?.src,
	}
}

module.exports = cachedSeriesObjects => multipageScraper({ getSeriesObjects, getStrip, cachedSeriesObjects })
