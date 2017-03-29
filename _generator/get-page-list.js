var http = require('http')
var htmlParser = require('htmlparser2')

module.exports = function getPages() {
	return new Promise(function (resolve, reject) {
		http.get('http://www.gocomics.com/sitemap.xml', function (res) {
			res.pipe( siteMapParser(resolve, reject) )
		})
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
