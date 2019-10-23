const crypto = require('crypto')
const renderTemplate = require('./render-template.js')

module.exports = function (seriesObject) {
	if (! seriesObject || ! seriesObject.strips || ! seriesObject.strips.length) {
		console.log(seriesObject)
		throw new Error('Expected seriesObject.strips to be a non-empty array')
	}

	const { basename, title, imageUrl, author, language, strips } = seriesObject

	const templateOpts = {
		basename: encodeURI(basename),
		title,
		imageUrl,
		author,
		language,
		updatedDate: new Date(strips[0].date),
		strips: strips.map(function (strip) {
			strip.guid = strip.url
			strip.isPermaLink = true
			if (strip.date >= '2019-10-20') {
				strip.guid = basename + strip.date
				strip.isPermaLink = false
			} else if (strip.date >= '2019-10-17') {
				strip.guid = makeId(strip.basename + strip.date) // strip.basename is undefined. I'm a doofus. Issue #116
				strip.isPermaLink = false
			}
			strip.includePreviewLink = strip.date <= '2019-10-19'
			strip.date = new Date(strip.date)
			return strip
		})
	}

	return renderTemplate('rss-feed', templateOpts)
}

function makeId(str) {
	const hasher = crypto.createHash('md5')
	hasher.update(str)
	const hash = hasher.digest('hex')
	return hash.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5')
}
