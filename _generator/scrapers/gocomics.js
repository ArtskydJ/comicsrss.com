const fetch = require('./lib/fetch.js')
const multipageScraper = require('./lib/multipage-scraper.js')

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
	const seriesObjectEntries = html
		.split('<a class="gc-blended-link')
		.slice(1) // remove the first item since it is empty
		.map((bodyPart, index) => {
			const todayHrefMatches = bodyPart.match(/" href=['"](.+?)['"]>/)
			if (todayHrefMatches === null || ! todayHrefMatches[1]) throw new Error(`Unable to parse todayHref in a-to-z, #${ index }\n${ bodyPart }`)
			const todayHref = todayHrefMatches[1]
			if (/^\/(news|comics|profiles)/.test(todayHref)) throw new Error('Unexpected todayHref URL in comics a-to-z: ' + todayHref)

			const basenameMatches = todayHrefMatches[0].match(/\/([^/]+)\//)
			if (basenameMatches === null || ! basenameMatches[1]) throw new Error(`Unable to parse basename in a-to-z, #${ index }\n${ bodyPart }`)
			const basename = basenameMatches[1].trim()

			// If I find a place for icon URLs, I can enable this later...
			// const iconUrlMatches = bodyPart.match(/<img.+?data-srcset="(.+?), 72w"/)
			// fan-art and outland are missing icon URLs

			const titleMatches = bodyPart.match(/<h4 class=['"](?:media-heading h4 mb-0|card-title)['"]>(.+?)<\/h4>/i)
			if (titleMatches === null || ! titleMatches[1]) throw new Error('Unable to parse title in a-to-z: ' + basename)
			const title = titleMatches[1]

			let authorMatches = bodyPart.match(/<span class=['"]media-(?:sub)?heading small['"]>By (.+?)<\/span>/i) // atoz
			if (! authorMatches) {
				authorMatches = bodyPart.match(/<h5 class=['"]card-subtitle text-muted['"]>(.+?)<\/h5>/i) // espanol
			}
			const author = authorMatches && authorMatches[1]
			const isPolitical = ! author // Gocomics' political comics are named after their author

			// https://iso639-3.sil.org/code_tables/639/data
			const language = url.includes('espanol') ? 'spa' : 'eng'

			return [ basename, {
				author: author || title,
				title,
				url: 'https://www.gocomics.com/' + basename,
				mostRecentStripUrl: 'https://www.gocomics.com' + todayHref,
				isPolitical,
				language
			}]
		})
	return Object.fromEntries(seriesObjectEntries)
}

const dumbRateLimit = () => new Promise(resolve => setTimeout(resolve, global.DEBUG ? 0 : 900)) // 800 might work, 700 doesn't

async function getStrip(stripPageUrl) {
	await dumbRateLimit()
	const html = await fetch(stripPageUrl)
	const imageUrlMatches = html.match(/<meta property="og:image" content="([^">]+)"/)
	const dateMatches = html.match(/<meta property="article:published_time" content="([^">]+)"/)
	const authorMatches = html.match(/<meta property="article:author" content="([^">]+)"/)
	const urlMatches = html.match(/<input .*?value="([^"]+)".+?aria-label=["']Get the permalink["']/)
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
