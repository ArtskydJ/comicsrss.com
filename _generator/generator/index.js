var util = require('./util.js')
var generateRssFeedFromComicObject = require('./generate-rss-feed-from-comic-object.js')
var comicObjects = require('../tmp/_comic-objects')
var supporters = require('./supporters.json')

function writeFilesFromComicObjects(comicObjects) {
	comicObjects = comicObjects.filter(Boolean)
	
	util.render('index', '../../index.html', generateIndexData(comicObjects))

	util.render('supporters', '../../supporters.html', {
		dateGenerated: new Date().toDateString(),
		supporters: supporters
	})
	
	comicObjects.forEach(function (comicObject) {
		if (!comicObject) return null

		var rssFeed = generateRssFeedFromComicObject(comicObject)
		util.writeFile('../../rss/' + comicObject.basename + '.rss', rssFeed)

		var comicsRssFeedUrl = 'https://www.comicsrss.com/rss/' + encodeURI(comicObject.basename) + '.rss'
		util.render('preview', '../../preview/' + comicObject.basename + '.html', {
			comicObject: comicObject,
			dateGenerated: new Date().toDateString(),
			comicsRssFeedUrl: comicsRssFeedUrl,
			feedlyFeedUrl: 'https://feedly.com/i/subscription/feed/' + encodeURIComponent(comicsRssFeedUrl),
			isoDate: function isoDate(date) { return new Date(date).toISOString().slice(0, 10) }
		})

		comicObject.comicStrips.slice(0, 3).forEach(function (comicStrip) {
			var uniqueString = comicStrip.comicImageUrl.split('/').pop()
			var filename = '../../rssitemcontent/' + comicStrip.date + '/' + uniqueString + '.html'
			util.render('rssitemcontent', filename, {
				comicName: comicObject.basename,
				comicStrip: comicStrip
			})
		})
	})
}

function generateIndexData(comicObjects) {
	var SUGGESTED_COMIC_NAMES = 'calvinandhobbes,foxtrot,foxtrotclassics,peanuts,pearlsbeforeswine,dilbert-classics'.split(',')
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


writeFilesFromComicObjects(comicObjects)
