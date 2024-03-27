const crypto = require('crypto')
const renderTemplate = require('./render-template.js')

module.exports = seriesObject => {
	if (! seriesObject || ! seriesObject.strips || ! seriesObject.strips.length) {
		console.log(seriesObject)
		throw new Error('Expected seriesObject.strips to be a non-empty array')
	}

	const { scraper, basename, title, imageUrl, author, language, strips, url } = seriesObject

	const templateOpts = {
		basename: encodeURI(basename),
		title,
		imageUrl,
		author,
		language,
		updatedDate: new Date(strips[0].date),
		strips: strips.map(strip => {
			strip.guid = basename + strip.date + cacheBuster(scraper, basename, strip.date)
			strip.isPermaLink = false
			strip.includePreviewLink = false
			strip.date = new Date(strip.date)
			return strip
		}),
		url,
	}

	return renderTemplate('rss-feed', templateOpts)
}

function betweenDate(testDate, minDate, maxDate) {
	testDate = testDate.slice(0, 10) // Fix arcamax dates prior to 2021-05-26 // remove after 2021-08-25
	console.log(testDate, minDate, maxDate, minDate <= testDate, testDate <= maxDate)
	return minDate <= testDate && testDate <= maxDate
}

function cacheBuster(scraper, basename, date) {
	if (scraper === 'arcamax' && betweenDate(date, '2021-05-19', '2021-05-25')) { // remove after 2021-08-25
		return 'fix_bad_img_url'
	}
	return ''
}
