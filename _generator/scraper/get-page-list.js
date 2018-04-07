var http = require('http')
var htmlParser = require('htmlparser2')

module.exports = function getPages() {
	return new Promise(function (resolve, reject) {
		http.get('http://www.gocomics.com/sitemap.xml', function (res) {
			res.pipe( siteMapParser(resolve, reject) )
		})
	}).then(function (pages) {
		return pages
			.map(getPageUrl)
			.filter(isComicPage)
			.sort()
			// .slice(0, 5) // DEBUG
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
		pageUrl === 'http://www.gocomics.com' ||
		pageUrl.startsWith('http://www.gocomics.com/news') ||
		pageUrl.startsWith('http://www.gocomics.com/comics') ||
		pageUrl.startsWith('http://www.gocomics.com/profiles')
	)
}

function getPageUrl(page) {
	return page.loc
}
