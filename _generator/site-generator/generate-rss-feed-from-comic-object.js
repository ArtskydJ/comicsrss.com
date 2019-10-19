var crypto = require('crypto')
var renderTemplate = require('./render-template.js')

module.exports = function (comicObject) {
	if (!comicObject || !comicObject.comicStrips || !comicObject.comicStrips.length) {
		console.log(comicObject)
		throw new Error('Expected comicObject.comicStrips to be a non-empty array')
	}

	var feedAuthor = comicObject.author
	var lastComicDate = comicObject.comicStrips[0].date

	var templateOpts = {
		title: comicObject.titleAndAuthor.split(' by ')[0],
		description: comicObject.titleAndAuthor,
		basename: encodeURI(comicObject.basename),
		headerImageUrl: comicObject.headerImageUrl,
		updatedDate: new Date(lastComicDate),
		author: feedAuthor,
		language: comicObject.language,
		// id: makeId(comicObject.comicUrl),
		comicStrips: comicObject.comicStrips.slice(0, 15).map(function (comicStrip) {
			comicStrip.guid = comicStrip.url
			comicStrip.isPermaLink = true
			if (comicStrip.date >= '2019-10-17') {
				comicStrip.guid = makeId(comicStrip.basename + comicStrip.date)
				comicStrip.isPermaLink = false
			}
			comicStrip.includePreviewLink = comicStrip.date <= '2019-10-19'
			comicStrip.date = new Date(comicStrip.date)
			return comicStrip
		})
	}

	return renderTemplate('rss-feed', templateOpts)
}

function makeId(str) {
	var hasher = crypto.createHash('md5')
	hasher.update(str)
	var hash = hasher.digest('hex')
	return hash.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5')
}
