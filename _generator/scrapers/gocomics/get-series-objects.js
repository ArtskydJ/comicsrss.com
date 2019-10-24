const https = require('https')
const concat = require('simple-concat')

module.exports = function getPages() {
	return Promise.all([
		getPage('https://www.gocomics.com/comics/a-to-z'),
		getPage('https://www.gocomics.com/comics/espanol?page=1'),
		getPage('https://www.gocomics.com/comics/espanol?page=2')
	])
	.then(function flatten(arrayOfObjects) {
		return Object.assign({}, ...arrayOfObjects)
	})
}

function getPage(url) {
	return new Promise(function (resolve, reject) {
		https.get(url, function (res) {
			concat(res, function (err, buf) {
				if (err) { reject(err) }
				else { resolve(atozAndEspanolParser(url, buf.toString())) }
			})
		})
	})
}


function atozAndEspanolParser(url, body) {
	return body
	.split('<a class="gc-blended-link')
	.slice(1) // remove the first item since it is empty
	.reduce(function (memo, bodyPart, index) {
		const todayHrefMatches = bodyPart.match(/" href=['"](.+?)['"]>/)
		if (todayHrefMatches === null || ! todayHrefMatches[1]) throw new Error(`Unable to parse todayHref in a-to-z, #${ index }\n${ bodyPart }`)
		const todayHref = todayHrefMatches[1]
		if (/^\/(news|comics|profiles)/.test(todayHref)) throw new Error('Unexpected todayHref URL in comics a-to-z: ' + todayHref)

		const basenameMatches = todayHrefMatches[0].match(/\/([^\/]+)\//)
		if (basenameMatches === null || ! basenameMatches[1]) throw new Error(`Unable to parse basename in a-to-z, #${ index }\n${ bodyPart }`)
		const basename = basenameMatches[1].trim()

		// If I find a place for icon URLs, I can enable this later...
		// const iconUrlMatches = bodyPart.match(/<img.+?data-srcset="(.+?), 72w"/)
		// fan-art and outland are missing icon URLs

		const titleMatches = bodyPart.match(/<h4 class=['"](?:media-heading h4 mb-0|card-title)['"]>(.+?)<\/h4>/i)
		if (titleMatches === null || ! titleMatches[1]) throw new Error('Unable to parse title in a-to-z: ' + basename)
		const title = titleMatches[1]

		var authorMatches = bodyPart.match(/<span class=['"]media-(?:sub)?heading small['"]>By (.+?)<\/span>/i) // atoz
		if (! authorMatches) {
			authorMatches = bodyPart.match(/<h5 class=['"]card-subtitle text-muted['"]>(.+?)<\/h5>/i) // espanol
		}
		const author = authorMatches && authorMatches[1]
		const isPolitical = ! author // Gocomics' political comics are named after their author

		// https://iso639-3.sil.org/code_tables/639/data
		const language = url.includes('espanol') ? 'spa' : 'eng'

		memo[basename] = {
			author: author || title,
			title,
			url: 'https://www.gocomics.com/' + basename,
			mostRecentStripUrl: 'https://www.gocomics.com' + todayHref,
			isPolitical,
			language
		}
		return memo
	}, {})
}

