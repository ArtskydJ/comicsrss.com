const httpGet = require('./http-get.js')

function between(str, begin, end) {
	if (typeof str !== 'string') {
		console.log(str)
		throw new TypeError('ur dum')
	}
	return (str.split(begin, 2)[1] || '').split(end, 1)[0]
}

module.exports = function getPages() {
	return httpGet('https://www.arcamax.com/comics')
	.then(function (html) {
		return between(html, 'Comics A-Z', 'Editorial Cartoons')
		.split('\n')
		.filter(l => l.startsWith('<li><a href="/thefunnies/'))
		.reduce(function (memo, line) {
			const href = between(line, '<li><a href="', '"')
			const basename = between(line, 'data-code="', '"')
			const title = between(line, /<a.+>/, '</a>')
			const author = between(html, '<cite>', '</cite>')

			memo[basename] = {
				author,
				title,
				url: 'https://www.arcamax.com/thefunnies/' + basename, // these should be the same as each other in arcamax
				mostRecentStripUrl: 'https://www.arcamax.com' + href, // these should be the same as each other in arcamax
				isPolitical: false,
				language: 'eng'
			}
			return memo
		}, {})
	})
}

