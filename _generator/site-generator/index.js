const renderTemplate = require('./render-template.js')
const writeFile = require('./write-file.js')
const generateRssFeedFromComicObject = require('./generate-rss-feed-from-comic-object.js')

module.exports = function writeFilesFromSeriesObjects(seriesObjects, supporters) {
	
	const renderedOutput = renderTemplate('master', generateIndexData(seriesObjects, supporters, 'eng'))
	writeFile('../../index.html', renderedOutput)

	const renderedOutputSpa = renderTemplate('master', generateIndexData(seriesObjects, supporters, 'spa'))
	writeFile('../../espanol.html', renderedOutputSpa)

	seriesObjects.forEach(function (comicObject) {
		if (!comicObject) return null

		const rssFeed = generateRssFeedFromComicObject(comicObject)
		writeFile(`../../rss/${comicObject.basename}.rss`, rssFeed)
	})
}

function generateIndexData(seriesObjects, supporters, language) {
	return {
		subtemplate: 'index',
		seriesObjects: seriesObjects.sort(sortCO),
		supporters: supporters,
		language: language,
		generatedDate: new Date().toDateString()
	}

	function sortCO(aa, bb) {
		const a = aa.titleAndAuthor.toLowerCase()
		const b = bb.titleAndAuthor.toLowerCase()
		return a > b ? 1 : (b > a ? -1 : 0)
	}
}
