const renderTemplate = require('./render-template.js')
const writeFileRoot = require('./write-file-root.js')
const generateRssFeedFromSeriesObject = require('./generate-rss-feed-from-series-object.js')

module.exports = function writeFilesFromSeriesObjects(seriesObjects, supporters) {
	const s = seriesObject => seriesObject.title.toLowerCase()

	const seriesObjectsArr = Object.entries(seriesObjects)
		.map(([ basename, seriesObject ]) => ({ ...seriesObject, basename }))
		.sort((a, b) => s(a) > s(b) ? 1 : (s(b) > s(a) ? -1 : 0))

	const renderData = {
		subtemplate: 'index',
		seriesObjects: seriesObjectsArr,
		supporters,
		generatedDate: new Date().toDateString(),
	}

	writeFileRoot('index.html', renderTemplate('master', { ...renderData, language: 'eng' }))
	writeFileRoot('espanol.html', renderTemplate('master', { ...renderData, language: 'spa' }))

	const limit = global.DEBUG ? 10 : Infinity
	for (const seriesObject of seriesObjectsArr.slice(0, limit)) {
		writeFileRoot(`rss/${seriesObject.basename}.rss`, generateRssFeedFromSeriesObject(seriesObject))
	}
}
