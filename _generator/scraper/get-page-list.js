var https = require('https')
var htmlParser = require('htmlparser2')
var isDebug = !!process.env.DEBUG

module.exports = function getPages() {
	return new Promise(function (resolve, reject) {
		https.get('https://www.gocomics.com/sitemap.xml', function (res) {
			res.pipe( siteMapParser(resolve, reject) )
		})
	}).then(function (pages) {
		var pageUrls = pages
			.map(getPageUrl)
			.filter(isComicPage)
			.sort()
		return isDebug ? pageUrls.slice(0, 5) : pageUrls
	})
}


function siteMapParser(resolve, reject) {
	var pages = []
	var currentTag = ''
	var currentPage = {}

	var parserEvents = {
		onopentag: function (name, attribs) { currentTag = name },
		ontext: function (text) { currentPage[currentTag] = (currentPage[currentTag] || '') + text },
		onclosetag: function (name) {
			if (name === 'url') {
				pages.push(currentPage)
				currentPage = {}
			}
		},
		onerror: reject,
		onend: function () { resolve(pages) }
	}

	return new htmlParser.Parser(parserEvents, {
		xmlMode: true,
		decodeEntities: true,
		lowerCaseTags: true
	})
}

function isComicPage(pageUrl) {
	return !(
		pageUrl === 'https://www.gocomics.com' ||
		pageUrl.startsWith('https://www.gocomics.com/news') ||
		pageUrl.startsWith('https://www.gocomics.com/comics') ||
		pageUrl.startsWith('https://www.gocomics.com/profiles')
	)
}

function getPageUrl(page) {
	return page.loc
}
