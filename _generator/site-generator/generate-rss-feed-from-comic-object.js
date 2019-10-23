const crypto = require('crypto')
const renderTemplate = require('./render-template.js')

module.exports = function (comicObject) {
	if (!comicObject || !comicObject.comicStrips || !comicObject.comicStrips.length) {
		console.log(comicObject)
		throw new Error('Expected comicObject.comicStrips to be a non-empty array')
	}

	const templateOpts = {
		title: comicObject.title,
		description: comicObject.titleAndAuthor,
		basename: encodeURI(comicObject.basename),
		headerImageUrl: comicObject.headerImageUrl,
		updatedDate: new Date(comicObject.comicStrips[0].date),
		author: comicObject.author,
		language: comicObject.language,
		// id: makeId(comicObject.comicUrl),
		comicStrips: comicObject.comicStrips.map(function (comicStrip) {
			comicStrip.guid = comicStrip.url
			comicStrip.isPermaLink = true
			if (comicStrip.date >= '2019-10-20') {
				comicStrip.guid = comicObject.basename + comicStrip.date
				comicStrip.isPermaLink = false
			} else if (comicStrip.date >= '2019-10-17') {
				comicStrip.guid = makeId(comicStrip.basename + comicStrip.date) // comicStrip.basename is undefined. I'm a doofus. Issue #116
				comicStrip.isPermaLink = false
			}
			comicStrip.includePreviewLink = comicStrip.date <= '2019-10-19'
			comicStrip.date = new Date(comicStrip.date)
			return comicStrip
		}).filter(function (comicStrip) {
			// Only puts comics in the RSS feed if they are under one month of age,
			// and it only puts up to 15 into the RSS feed.
			// A currently-running daily strip will hit the 15-count limit.
			// An inactive or weekly strip will hit the time limit.
			const monthAgo = new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 30)
			return comicStrip.date > monthAgo
		}).slice(0, 15)
	}

	return renderTemplate('rss-feed', templateOpts)
}

function makeId(str) {
	const hasher = crypto.createHash('md5')
	hasher.update(str)
	const hash = hasher.digest('hex')
	return hash.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5')
}
