const renderTemplate = require('./render-template.js')
const writeFile = require('./write-file.js')
const generateRssFeedFromComicObject = require('./generate-rss-feed-from-comic-object.js')

module.exports = function writeFilesFromComicObjects(comicObjects, supporters) {
	
	const renderedOutput = renderTemplate('master', generateIndexData(comicObjects, supporters, 'eng'))
	writeFile('../../index.html', renderedOutput)

	const renderedOutputSpa = renderTemplate('master', generateIndexData(comicObjects, supporters, 'spa'))
	writeFile('../../espanol.html', renderedOutputSpa)

	comicObjects.forEach(function (comicObject) {
		if (!comicObject) return null

		const rssFeed = generateRssFeedFromComicObject(comicObject)
		writeFile(`../../rss/${comicObject.basename}.rss`, rssFeed)
	})
}

function generateIndexData(comicObjects, supporters, language) {
	const SUGGESTED_COMIC_NAMES = 'calvinandhobbes,dilbert,foxtrot,foxtrotclassics,getfuzzy,peanuts'.split(',')
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
		const a = aa.titleAndAuthor.toLowerCase()
		const b = bb.titleAndAuthor.toLowerCase()
		return a > b ? 1 : (b > a ? -1 : 0)
	}
}
