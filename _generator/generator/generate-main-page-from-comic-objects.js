var fs = require('fs')
var path = require('path')
var mustache = require('art-template')

var indexTemplateHtmlPath = path.resolve(__dirname, 'template', 'index-template.html')
var indexTemplateHtml = fs.readFileSync(indexTemplateHtmlPath, 'utf-8')

module.exports = function generateMainPage(comicObjects) {
	var suggestedComicObjects = comicObjects.filter(function (comicObject) {
		return [
			'calvinandhobbes',
			'foxtrot',
			'foxtrotclassics',
			'peanuts',
			'pearlsbeforeswine',
			'dilbert-classics'
		].indexOf(comicObject.basename) !== -1
	}).sort(comicObjectSorter)

	var sortedComicObjects = comicObjects.sort(comicObjectSorter)
	
	return mustache.render(indexTemplateHtml, {
		suggestedComicObjects: suggestedComicObjects,
		comicObjects: sortedComicObjects,
		generatedDate: new Date().toDateString(),
		encodeURI: encodeURI
	})
}

function comicObjectSorter(aa, bb) {
	var a = aa.titleAndAuthor.toLowerCase()
	var b = bb.titleAndAuthor.toLowerCase()
	return a > b ? 1 : (b > a ? -1 : 0)
}
