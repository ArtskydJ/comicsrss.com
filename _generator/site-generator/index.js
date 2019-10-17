var renderTemplate = require('./render-template.js')
var writeFile = require('./write-file.js')
var generateRssFeedFromComicObject = require('./generate-rss-feed-from-comic-object.js')

module.exports = function writeFilesFromComicObjects(comicObjects, supporters) {
	
	var renderedOutput = renderTemplate('master', generateIndexData(comicObjects, supporters, 'eng'))
	writeFile('../../index.html', renderedOutput)

	var renderedOutputSpa = renderTemplate('master', generateIndexData(comicObjects, supporters, 'spa'))
	writeFile('../../espanol.html', renderedOutputSpa)

	comicObjects.forEach(function (comicObject) {
		if (!comicObject) return null

		var rssFeed = generateRssFeedFromComicObject(comicObject)
		writeFile('../../rss/' + comicObject.basename + '.rss', rssFeed)

		var renderedOutput = renderTemplate('master', { subtemplate: 'preview' })
		writeFile('../../preview/' + comicObject.basename + '.html', renderedOutput)
	})
}

function generateIndexData(comicObjects, supporters, language) {
	var SUGGESTED_COMIC_NAMES = 'calvinandhobbes,dilbert,foxtrot,foxtrotclassics,getfuzzy,peanuts'.split(',')
	return {
		subtemplate: 'index',
		suggestedComicObjects: comicObjects.filter(filterCO).sort(sortCO),
		comicObjects: comicObjects.sort(sortCO),
		supporters: supporters,
		language: language,
		generatedDate: new Date().toDateString()
	}

	function filterCO(comicObject) {
		return SUGGESTED_COMIC_NAMES.indexOf(comicObject.basename) !== -1
	}

	function sortCO(aa, bb) {
		var a = aa.titleAndAuthor.toLowerCase()
		var b = bb.titleAndAuthor.toLowerCase()
		return a > b ? 1 : (b > a ? -1 : 0)
	}
}
