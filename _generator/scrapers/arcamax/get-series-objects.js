const fetch = require('../fetch.js')

function between(str, begin, end) {
	return (str.split(begin, 2)[1] || '').split(end, 1)[0]
}

module.exports = async function getPages() {
	const html = await fetch('https://www.arcamax.com/comics')
	const seriesEntries = between(html, 'Comics A-Z', 'Editorial Cartoons')
		.split('\n')
		.filter(l => l.startsWith('<li><a href="/thefunnies/'))
		.map(line => {
			const href = between(line, '<li><a href="', '"')
			const basename = between(line, 'data-code="', '"')
			const title = between(line, '" >', '</a>')
			// const author = between(html, '<cite>', '</cite>')

			return [ basename, {
				// author, // The author info is not in the sidebar
				title,
				url: 'https://www.arcamax.com/thefunnies/' + basename, // these should be the same as each other in arcamax
				mostRecentStripUrl: 'https://www.arcamax.com' + href, // these should be the same as each other in arcamax
				isPolitical: false,
				language: 'eng'
			}]
		})
	return Object.fromEntries(seriesEntries)
}

