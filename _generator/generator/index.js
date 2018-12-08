var renderTemplate = require('./render-template.js')
var writeFile = require('../lib/write-file.js')
var generateRssFeedFromComicObject = require('./generate-rss-feed-from-comic-object.js')
var isDebug = !!process.env.DEBUG

var comicObjects = require('../tmp/_comic-objects')
var moreComicObjects = [
	require('../tmp/_dilbert-comic-object')
]
var supporters = require('../tmp/supporters.json')

function writeFilesFromComicObjects(comicObjects) {
	comicObjects = comicObjects.concat(moreComicObjects).filter(Boolean)
	
	render('../../index.html', 'index', generateIndexData(comicObjects))
	render('../../supporters.html', 'supporters', { supporters: supporters })
	
	if (isDebug) { return }

	comicObjects.forEach(function (comicObject) {
		if (!comicObject) return null

		var rssFeed = generateRssFeedFromComicObject(comicObject)
		writeFile('../../rss/' + comicObject.basename + '.rss', rssFeed)

		var comicsRssFeedUrl = 'https://www.comicsrss.com/rss/' + encodeURI(comicObject.basename) + '.rss'
		render('../../preview/' + comicObject.basename + '.html', 'preview', {
			comicObject: comicObject,
			comicsRssFeedUrl: comicsRssFeedUrl,
			feedlyFeedUrl: 'https://feedly.com/i/subscription/feed/' + encodeURIComponent(comicsRssFeedUrl),
			isoDate: function isoDate(date) { return new Date(date).toISOString().slice(0, 10) }
		})

		comicObject.comicStrips.slice(0, 3).forEach(function (comicStrip) {
			var uniqueString = comicStrip.comicImageUrl.split('/').pop()
			var filename = '../../rssitemcontent/' + comicStrip.date + '/' + uniqueString + '.html'
			render(filename, 'rssitemcontent', {
				comicName: comicObject.basename,
				comicStrip: comicStrip
			})
		})
	})
}

function generateIndexData(comicObjects) {
	var SUGGESTED_COMIC_NAMES = 'calvinandhobbes,dilbert,foxtrot,foxtrotclassics,getfuzzy,peanuts'.split(',')
	return {
		suggestedComicObjects: comicObjects.filter(filterCO).sort(sortCO),
		comicObjects: comicObjects.sort(sortCO),
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

function render(outputFilePath, templateFilenamePrefix, templateData) {
	var renderedOutput = renderTemplate(templateFilenamePrefix, templateData)
	writeFile(outputFilePath, renderedOutput)
}


writeFilesFromComicObjects(comicObjects)
