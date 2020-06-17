const fetch = require('./lib/fetch.js')
const multipageScraper = require('./lib/multipage-scraper.js')

function between(str, begin, end) {
	return (str.split(begin, 2)[1] || '').split(end, 1)[0]
}

async function getSeriesObjects() {
	const html = await fetch('https://www.arcamax.com/comics')
	const seriesEntries = between(html, 'Comics A-Z', 'Editorial Cartoons')
		.split('\n')
		.filter(l => l.startsWith('<li><a href="/thefunnies/'))
		.map(line => {
			const href = between(line, '<li><a href="', '"')
			const basename = between(line, 'data-code="', '"')
			const title = between(line, '" >', '</a>')
			// const author = between(html, '<cite>', '</cite>')

			return [ basename, {
				// author, // The author info is not in the sidebar
				title,
				url: 'https://www.arcamax.com/thefunnies/' + basename, // these should be the same as each other in arcamax
				mostRecentStripUrl: 'https://www.arcamax.com' + href, // these should be the same as each other in arcamax
				isPolitical: false,
				language: 'eng'
			}]
		})
	return Object.fromEntries(seriesEntries)
}

async function getStrip(stripPageUrl) {
	const html = await fetch(stripPageUrl)
	const imageUrlMatches = html.match(/<img id="comic-zoom".+src="([^">]+)"/)
	const dateMatches = html.match(/<span class="cur">(\w{3}).*?([\d/]+)<\/span>/)
	const authorMatches = html.match(/<cite>by (.+?)<\/cite>/)
	const urlMatches = html.match(/var disqus_url = '(.+?)';/)
	const isOldestStrip = /class="prev-off"/.test(html)
	const olderRelUrlMatches = html.match(/<a.+class=["']prev["'].+href=["'](.*?)["']/)
	// const newerRelUrlMatches = html.match(/<a.+class=["']next["'].+href=["'](.*?)["']/)
	const headerImageUrlMatches = html.match(/<meta property="og:image" content=["'](.+?)["']/)

	if (urlMatches === null || ! urlMatches[1]) throw new Error('Unable to parse url')
	const url = urlMatches[1]
	if (imageUrlMatches === null || ! imageUrlMatches[1]) throw new Error('Unable to parse comicImageUrl in ' + url)
	if (dateMatches === null || ! dateMatches[1] || ! dateMatches[2]) throw new Error('Unable to parse date in ' + url)
	if (authorMatches === null || ! authorMatches[1]) throw new Error('Unable to parse author in ' + url)
	if (olderRelUrlMatches === null || (! olderRelUrlMatches[1] && ! isOldestStrip)) throw new Error('Unable to parse olderRelUrl in ' + url)
	// if (newerRelUrlMatches === null) throw new Error('Unable to parse newerRelUrl in ' + url)

	const year = new Date().toISOString().slice(0, 4)
	const date = new Date(`${year} ${dateMatches[1]} ${dateMatches[2]}`).toISOString().slice(0, 10)

	return {
		imageUrl: imageUrlMatches[1],
		date,
		author: authorMatches[1],
		url,
		isOldestStrip,
		olderRelUrl: olderRelUrlMatches[1],
		// newerRelUrl: newerRelUrlMatches[1],
		headerImageUrl: headerImageUrlMatches[1]
	}
}

module.exports = cachedSeriesObjects => multipageScraper(getSeriesObjects, getStrip, cachedSeriesObjects)
