var https = require('https')
var concat = require('simple-concat')

module.exports = function getPages() {
	return new Promise(function (resolve, reject) {
		https.get('https://www.gocomics.com/comics/a-to-z', function (res) {
			concat(res, function (err, buf) {
				if (err) { reject(err) }
				else { resolve(atozParser(buf.toString())) }
			})
		})
	})
}


function atozParser(body) {
	var bodyParts = body.split('<hr class=\'my-4\'>')
	bodyParts.pop() // throw away last result, since it doesn't have any data in it
	return bodyParts.map(function (bodyPart, index) {
		var todayHrefMatches = bodyPart.match(/<a class=['"]gc-blended-link [^'"]+['"] href=['"](.+?)">/)
		if (todayHrefMatches === null || !todayHrefMatches[1]) throw new Error('Unable to parse todayHref in a-to-z, #' + index + '\n' + bodyPart)
		if (/^\/(news|comics|profiles)/.test(todayHrefMatches[1])) throw new Error('Unexpected todayHref URL in comics a-to-z: ' + todayHrefMatches[1])

		var basenameMatches = todayHrefMatches[0].match(/\/([^\/]+)\//)
		if (basenameMatches === null || !basenameMatches[1]) throw new Error('Unable to parse basename in a-to-z, #' + index + '\n' + bodyPart)
		var basename = basenameMatches[1]

		// If I find a place for icon URLs, I can enable this later...
		// var iconUrlMatches = bodyPart.match(/<img.+?data-srcset="(.+?), 72w"/)
		// fan-art and outland are missing icon URLs

		var titleMatches = bodyPart.match(/<h4 class=['"]media-heading h4 mb-0['"]>(.+?)<\/h4>/)
		if (titleMatches === null || !titleMatches[1]) throw new Error('Unable to parse title in a-to-z: ' + basename)

		var authorMatches = bodyPart.match(/<span class=['"]media-(?:sub)?heading small['"]>(.+?)<\/span>/)
		var hasAuthor = authorMatches !== null && !!authorMatches[1]

		return {
			author: (hasAuthor ? authorMatches : titleMatches)[1],
			basename: basename,
			title: titleMatches[1],
			todayHref: todayHrefMatches[1],
			isPolitical: !hasAuthor,
			index: index
		}
	})
	.sort(sortOnKey('title'))
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
