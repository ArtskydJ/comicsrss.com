var https = require('https')
var concat = require('simple-concat')

module.exports = function getPages() {
	return Promise.all([
		getPage('https://www.gocomics.com/comics/a-to-z'),
		getPage('https://www.gocomics.com/comics/espanol?page=1'),
		getPage('https://www.gocomics.com/comics/espanol?page=2')
	])
	.then(flatten)
	.then(function (arr) {
		return arr.sort(sortOnKey('title'))
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
	var bodyParts = []
	bodyParts = body.split('<a class="gc-blended-link')
	bodyParts.shift() // remove the first item since it is empty

	return bodyParts.map(function (bodyPart, index) {
		var todayHrefMatches = bodyPart.match(/" href=['"](.+?)['"]>/)
		if (todayHrefMatches === null || !todayHrefMatches[1]) throw new Error('Unable to parse todayHref in a-to-z, #' + index + '\n' + bodyPart)
		if (/^\/(news|comics|profiles)/.test(todayHrefMatches[1])) throw new Error('Unexpected todayHref URL in comics a-to-z: ' + todayHrefMatches[1])

		var basenameMatches = todayHrefMatches[0].match(/\/([^\/]+)\//)
		if (basenameMatches === null || !basenameMatches[1]) throw new Error('Unable to parse basename in a-to-z, #' + index + '\n' + bodyPart)
		var basename = basenameMatches[1].trim()

		// If I find a place for icon URLs, I can enable this later...
		// var iconUrlMatches = bodyPart.match(/<img.+?data-srcset="(.+?), 72w"/)
		// fan-art and outland are missing icon URLs

		var titleMatches = bodyPart.match(/<h4 class=['"](?:media-heading h4 mb-0|card-title)['"]>(.+?)<\/h4>/i)
		if (titleMatches === null || !titleMatches[1]) throw new Error('Unable to parse title in a-to-z: ' + basename)

		var authorMatches = bodyPart.match(/<span class=['"]media-(?:sub)?heading small['"]>By (.+?)<\/span>/i) // atoz
		if (! authorMatches) {
			authorMatches = bodyPart.match(/<h5 class=['"]card-subtitle text-muted['"]>(.+?)<\/h5>/i) // espanol
		}

		var hasAuthor = authorMatches !== null && !!authorMatches[1]

		// https://iso639-3.sil.org/code_tables/639/data
		var language = url.indexOf('espanol') === -1 ? 'eng' : 'spa'

		return {
			author: (hasAuthor ? authorMatches : titleMatches)[1],
			basename: basename,
			title: titleMatches[1],
			todayHref: todayHrefMatches[1],
			isPolitical: !hasAuthor,
			language: language,
			index: index
		}
	})
}

// from https://stackoverflow.com/a/10865042/1509389
function flatten(arrayOfArrays) {
	return [].concat.apply([], arrayOfArrays)
}

// from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
function sortOnKey(key) {
	return function sort(a, b) {
		var valA = a[key].toUpperCase()
		var valB = b[key].toUpperCase()
		if (valA < valB) return -1
		if (valA > valB) return 1
		return 0
	}
}
