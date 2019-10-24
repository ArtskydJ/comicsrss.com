const renderTemplate = require('./render-template.js')
const writeFile = require('./write-file.js')
const generateRssFeedFromComicObject = require('./generate-rss-feed-from-comic-object.js')

module.exports = function writeFilesFromSeriesObjects(seriesObjects, supporters) {
	var seriesObjectsArr = Object.keys(seriesObjects).map(key => Object.assign({ basename: key }, seriesObjects[key]))
	
	const renderedOutput = renderTemplate('master', generateIndexData(seriesObjectsArr, supporters, 'eng'))
	writeFile('../../index.html', renderedOutput)

	const renderedOutputSpa = renderTemplate('master', generateIndexData(seriesObjectsArr, supporters, 'spa'))
	writeFile('../../espanol.html', renderedOutputSpa)

	if (global.DEBUG) {
		seriesObjectsArr = seriesObjectsArr.slice(0, 10)
	}

	seriesObjectsArr.forEach(function (comicObject) {
		if (!comicObject) return null

		const rssFeed = generateRssFeedFromComicObject(comicObject)
		writeFile(`../../rss/${comicObject.basename}.rss`, rssFeed)
	})
}

function generateIndexData(seriesObjectsArr, supporters, language) {
	return {
		subtemplate: 'index',
		seriesObjects: seriesObjectsArr.sort(sortCO),
		supporters: supporters,
		language: language,
		generatedDate: new Date().toDateString()
	}

	function sortCO(aa, bb) {
		const a = aa.title.toLowerCase()
		const b = bb.title.toLowerCase()
		return a > b ? 1 : (b > a ? -1 : 0)
	}
}
