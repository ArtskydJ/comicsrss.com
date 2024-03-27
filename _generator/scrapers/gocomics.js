const fetch = require('./lib/fetch.js')
const multipageScraper = require('./lib/multipage-scraper.js')
const { query_html, element_to_text } = require('./lib/query-html.js')

function getSeriesObjects() {
	return Promise.all([
		getPage('https://www.gocomics.com/comics/a-to-z'),
		getPage('https://www.gocomics.com/comics/espanol?page=1'),
		getPage('https://www.gocomics.com/comics/espanol?page=2')
	])
	.then(function flatten(arrayOfObjects) {
		return Object.assign({}, ...arrayOfObjects)
	})
}


async function getPage(url) {
	const html = await fetch(url)
	const $ = query_html(html)

	const seriesObjectEntries = $('.gc-blended-link')
		.map(link_element => {
			const today_href = link_element.attribs.href
			const { pathname } = new URL(today_href, 'https://www.gocomics.com')
			const basename = pathname.split('/')[1]

			// If I find a place for icon URLs, I can enable this later...
			// const iconUrl = $('img[data-srcset]', link_element)[0].attribs['data-srcset'].replace(/, 72w$/, '')
			// fan-art and outland are missing icon URLs

			const title = element_to_text($('.media-heading, .card-title', link_element)[0])

			const author_element = (
				$('span.media-subheading.small, span.media-heading.small', link_element)[0] ||
				$('h5.card-subtitle.text-muted', link_element)[0]
			)
			const author = author_element && element_to_text(author_element).replace(/^By /, '')

			const isPolitical = ! author // Gocomics' political comics are named after their author

			// https://iso639-3.sil.org/code_tables/639/data
			const language = url.includes('espanol') ? 'spa' : 'eng'

			return [ basename, {
				author: author || title,
				title,
				url: 'https://www.gocomics.com/' + basename,
				mostRecentStripUrl: 'https://www.gocomics.com' + today_href,
				isPolitical,
				language
			}]
		})
	return Object.fromEntries(seriesObjectEntries)
}

const dumbRateLimit = () => new Promise(resolve => setTimeout(resolve, global.DEBUG ? 0 : 900)) // 800 might work, 700 doesn't

async function getStrip(strip_page_url) {
	await dumbRateLimit()
	console.log(`fetching ${ strip_page_url}`)
	const html = await fetch(strip_page_url)
	const $ = query_html(html)

	return {
		imageUrl: $('meta[property="og:image"]')[0].attribs.content,
		date: $('meta[property="article:published_time"]')[0].attribs.content,
		author: $('meta[property="article:author"]')[0].attribs.content,
		url: $('input[aria-label="Get the permalink"]')[0].attribs.value,
		isOldestStrip: !!($('a.fa-caret-left.disabled')[0]),
		olderRelUrl: $('a.fa-caret-left')[0].attribs.href,
		// newerRelUrl: $('a.fa-caret-right')[0].attribs.href,
		headerImageUrl: $('.layout-2col-sidebar .card-img img')[0].attribs.src,
	}
}

module.exports = cachedSeriesObjects => multipageScraper({ getSeriesObjects, getStrip, cachedSeriesObjects })
