var httpGet = require('./http-get.js')
var url = require('url')

module.exports = function (page, index) {
	var pages = []

	return getPage(page.loc)
		.then(getPage)
		.then(getPage)
		.then(getPage)
		.then(getPage)
		.catch(function (err) {
			console.error(page.loc + ' ' + err.message)
		})
		.then(function () {
			return pages
		})

	function getPage(pageUrl) {
		if (pageUrl !== '') return httpGet(pageUrl)
			.then(function (html) {
				var parsed = parseComicPage(pageUrl, html)
				pages.push(parsed)
				if (parsed.isFirstComic) return ''
				return url.resolve(pageUrl, parsed.olderRelUrl)
			})
	}
}


function parseComicPage(pageUrl, html) {
	var comicUrlMatches = html.match(/<meta property="og:image" content="([^">]+)"/)
	var titleMatches = html.match(/<meta property="og:title" content="([^">|]+)/)
	var dateMatches = html.match(/<meta property="article:published_time" content="([^">]+)"/)
	var authorMatches = html.match(/<meta property="article:author" content="([^">]+)"/)
	var urlMatches = html.match(/<input .*?name="link.+?" value="([^"]+)"/)
	var isFirstComic = /<a.+class=["'][^"']*fa-caret-left[^"']*disabled/.test(html)
	var olderRelUrlMatches = html.match(/<a.+href=["'](.*?)["'] class=["'][^"']*fa-caret-left/)
	var newerRelUrlMatches = html.match(/<a.+href=["'](.*?)["'] class=["'][^"']*fa-caret-right/)
	var headerImageUrlMatches = html.match(/src="(http:\/\/avatar\.amuniversal\.com\/.+?)"/) || []

	if (comicUrlMatches === null || !comicUrlMatches[1]) throw new Error('Unable to parse comicUrl')
	if (titleMatches === null || !titleMatches[1]) throw new Error('Unable to parse title')
	if (dateMatches === null || !dateMatches[1]) throw new Error('Unable to parse date')
	if (authorMatches === null || !authorMatches[1]) throw new Error('Unable to parse author')
	if (urlMatches === null || !urlMatches[1]) throw new Error('Unable to parse url')
	if (olderRelUrlMatches === null || (!olderRelUrlMatches[1] && !isFirstComic)) throw new Error('Unable to parse olderRelUrl')
	if (newerRelUrlMatches === null) throw new Error('Unable to parse newerRelUrl')

	return {
		comicUrl: comicUrlMatches[1],
		title: titleMatches[1],
		date: dateMatches[1],
		author: authorMatches[1],
		url: urlMatches[1],
		isFirstComic: isFirstComic,
		olderRelUrl: olderRelUrlMatches[1],
		newerRelUrl: newerRelUrlMatches[1],
		headerImageUrl: headerImageUrlMatches[1]
	}
}
