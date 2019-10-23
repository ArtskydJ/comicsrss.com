const httpGet = require('./http-get.js')
const url = require('url')

module.exports = function getComicObject(page, previousComicObject) {
	let comicStrips = []
	let previousUrls = []
	if (previousComicObject) {
		previousUrls = previousComicObject.comicStrips.map(strip => strip.url)
	}
	const fullComicUrl = 'https://www.gocomics.com' + page.todayHref

	return Promise.resolve(fullComicUrl)
		.then(getPage)
		.then(getPage)
		.then(getPage)
		.then(getPage)
		.then(getPage)
		.then(function () {
			if (previousComicObject && ! comicStrips.length) {
				// If no new info was gathered, then avoid changing the cached copy
				return previousComicObject
			}
			if (previousComicObject) {
				comicStrips = comicStrips.concat(previousComicObject.comicStrips)
			}

			return {
				titleAndAuthor: page.title + ' by ' + page.author,
				basename: page.basename,
				author: page.author,
				title: page.title,
				comicUrl: fullComicUrl,
				headerImageUrl: comicStrips[0].headerImageUrl,
				isPolitical: page.isPolitical,
				language: page.language,
				comicStrips: comicStrips.map(function (comicStrip) {
					return {
						titleAuthorDate: comicStrip.titleAuthorDate,
						url: comicStrip.url,
						date: comicStrip.date,
						comicImageUrl: comicStrip.comicImageUrl
					}
				}).slice(0, 25)
			}
		})

	function getPage(pageUrl) {
		if (!pageUrl || previousUrls.indexOf(pageUrl) !== -1) {
			return null
		}

		return httpGet(pageUrl)
		.then(function (html) {
			var parsed = parseComicPage(pageUrl, html)
			if (previousUrls.indexOf(parsed.url) !== -1) {
				console.log('Previous day does not match (' + page.basename + ')')
				return null
			}
			comicStrips.push(parsed)
			if (!parsed.isFirstComic) return url.resolve(pageUrl, parsed.olderRelUrl)
		})
	}
}


function parseComicPage(pageUrl, html) {
	const comicImageUrlMatches = html.match(/<meta property="og:image" content="([^">]+)"/)
	const titleAuthorDateMatches = html.match(/<meta property="og:title" content="([^">|]+)/)
	const dateMatches = html.match(/<meta property="article:published_time" content="([^">]+)"/)
	const authorMatches = html.match(/<meta property="article:author" content="([^">]+)"/)
	const urlMatches = html.match(/<input .*?value="([^"]+)".+?aria-label=["']Get the permalink["']/)
	const isFirstComic = /<a.+class=["'][^"']*fa-caret-left[^"']*disabled/.test(html)
	const olderRelUrlMatches = html.match(/<a.+href=["'](.*?)["'] class=["'][^"']*fa-caret-left/)
	const newerRelUrlMatches = html.match(/<a.+href=["'](.*?)["'] class=["'][^"']*fa-caret-right/)
	const headerImageUrlMatches = html.match(/src="(https:\/\/avatar\.amuniversal\.com\/.+?)"/) || []

	if (comicImageUrlMatches === null || !comicImageUrlMatches[1]) throw new Error('Unable to parse comicImageUrl in ' + pageUrl)
	if (titleAuthorDateMatches === null || !titleAuthorDateMatches[1]) throw new Error('Unable to parse title, author, date in ' + pageUrl)
	if (dateMatches === null || !dateMatches[1]) throw new Error('Unable to parse date in ' + pageUrl)
	if (authorMatches === null || !authorMatches[1]) throw new Error('Unable to parse author in ' + pageUrl)
	if (urlMatches === null || !urlMatches[1]) throw new Error('Unable to parse url in ' + pageUrl)
	if (olderRelUrlMatches === null || (!olderRelUrlMatches[1] && !isFirstComic)) throw new Error('Unable to parse olderRelUrl in ' + pageUrl)
	if (newerRelUrlMatches === null) throw new Error('Unable to parse newerRelUrl in ' + pageUrl)

	return {
		comicUrl: pageUrl,
		comicImageUrl: comicImageUrlMatches[1],
		titleAuthorDate: titleAuthorDateMatches[1],
		date: dateMatches[1],
		author: authorMatches[1],
		url: urlMatches[1],
		isFirstComic: isFirstComic,
		olderRelUrl: olderRelUrlMatches[1],
		// newerRelUrl: newerRelUrlMatches[1],
		headerImageUrl: headerImageUrlMatches[1]
	}
}
