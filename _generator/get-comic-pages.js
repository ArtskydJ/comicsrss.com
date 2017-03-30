var httpGet = require('./http-get.js')
var url = require('url')

module.exports = function (page, index) {
	// console.log(page.loc)
	var pages = []
	return getPage(page.loc)
		.then(function (page1) {
			pages.push(page1)
			return getPage(url.resolve(page.loc, page1.olderRelUrl))
		})
		.then(function (page2) {
			pages.push(page2)
			return getPage(url.resolve(page.loc, page2.olderRelUrl))
		})
		.then(function (page3) {
			pages.push(page3)
			return pages
		})
}

function getPage(pageUrl) {
	return httpGet(pageUrl)
		.then(parseComicPage)
		.catch(function (err) {
			throw new Error('Could not parse "' + pageUrl + '" - Unable to parse ' + err.message)
		})
}

function parseComicPage(html) {
	var comicUrlMatches = html.match(/<meta property="og:image" content="([^">]+)"/)
	var titleMatches = html.match(/<meta property="og:title" content="([^">|]+)/)
	var dateMatches = html.match(/<meta property="article:published_time" content="([^">]+)"/)
	var authorMatches = html.match(/<meta property="article:author" content="([^">]+)"/)
	var urlMatches = html.match(/<input .*?name="link.+?" value="([^"]+)"/)
	var olderRelUrlMatches = html.match(/<a.+href=["'](.*?)["'] class=["'][^"']*fa-caret-left/)
	var newerRelUrlMatches = html.match(/<a.+href=["'](.*?)["'] class=["'][^"']*fa-caret-right/)
	var headerImageUrlMatches = html.match(/src="(http:\/\/avatar\.amuniversal\.com\/.+?)"/) || []

	if (comicUrlMatches === null) throw new Error('comicUrl')
	if (titleMatches === null) throw new Error('title')
	if (dateMatches === null) throw new Error('date')
	if (authorMatches === null) throw new Error('author')
	if (urlMatches === null) throw new Error('url')
	if (olderRelUrlMatches === null) throw new Error('olderRelUrl')
	if (newerRelUrlMatches === null) throw new Error('newerRelUrl')

	return {
		comicUrl: comicUrlMatches[1],
		title: titleMatches[1],
		date: dateMatches[1],
		author: authorMatches[1],
		url: urlMatches[1],
		olderRelUrl: olderRelUrlMatches[1],
		newerRelUrl: newerRelUrlMatches[1],
		headerImageUrl: headerImageUrlMatches[1]
	}
}
