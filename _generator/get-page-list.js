var http = require('http')
var htmlParser = require('htmlparser2')

module.exports = function getPages() {
	// return DEBUG_PAGES
	return new Promise(function (resolve, reject) {
		http.get('http://www.gocomics.com/sitemap.xml', function (res) {
			res.pipe( siteMapParser(resolve, reject) )
		})
	}).then(function (pages) {
		return pages
			.map(getPageUrl)
			.filter(isComicPage)
			.sort()
	})
}


function siteMapParser(resolve, reject) {
	var pages = []

	var currentTag = ''
	var currentPage = {}

	var parserOptions = {
		xmlMode: true,
		decodeEntities: true,
		lowerCaseTags: true
	}

	return new htmlParser.Parser({
		onopentag: onOpenTag,
		ontext: onText,
		onclosetag: onCloseTag,
		onerror: onError,
		onend: onEnd
	}, parserOptions)


	function onOpenTag(name, attribs) {
		currentTag = name
	}
	function onText(text) {
		currentPage[currentTag] = (currentPage[currentTag] || '') + text
	}
	function onCloseTag(name) {
		if (name === 'url') {
			pages.push(currentPage)
			currentPage = {}
		}
	}
	function onError(err) {
		reject(err)
	}
	function onEnd() {
		resolve(pages)
	}
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

const DEBUG_PAGES = Promise.resolve([
	'http://www.gocomics.com/1-and-done',
	'http://www.gocomics.com/2cowsandachicken',
	'http://www.gocomics.com/9chickweedlane',
	'http://www.gocomics.com/9to5',
	'http://www.gocomics.com/this_does_not_exist'
])
