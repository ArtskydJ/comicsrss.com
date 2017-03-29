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
			throw new Error('Could not parse "' + page.loc + '" (' + index + ')')
		})
}

function parseComicPage(html) {
	return {
		comicUrl: html.match(/<meta property="og:image" content="([^">]+)"/)[1],
		title: html.match(/<meta property="og:title" content="([^">|]+)/)[1],
		date: html.match(/<meta property="article:published_time" content="([^">]+)"/)[1],
		author: html.match(/<meta property="article:author" content="([^">]+)"/)[1],
		url: html.match(/<input .*?name="link.+?" value="([^"]+)"/)[1],
		olderRelUrl: html.match(/<div class="control-nav-older"><a.+href=["'](.*?)["']/)[1],
		newerRelUrl: html.match(/<div class="control-nav-newer"><a.+href=["'](.*?)["']/)[1],
		headerImageUrl: (html.match(/src="(http:\/\/avatar\.amuniversal\.com\/.+?)"/) || [])[1]
	}
}
