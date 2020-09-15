/*
WIP
*/

const html = ''

return matcher(html, {
	urls: /<input .*?value="([^"]+)".+?aria-label=["']Get the permalink["']/,
	imageUrl: /<meta property="og:image" content="([^">]+)"/,
	date: /<meta property="article:published_time" content="([^">]+)"/,
	author: /<meta property="article:author" content="([^">]+)"/,
	isOldestStrip: /<a.+class=["'][^"']*fa-caret-left[^"']*disabled/,
	olderRelUrl: /<a.+href=["'](.*?)["'] class=["'][^"']*fa-caret-left/,
	newerRelUrl: /<a.+href=["'](.*?)["'] class=["'][^"']*fa-caret-right/,
	headerImageUrl: /src="(https:\/\/avatar\.amuniversal\.com\/.+?)"/,
})


function matcher(str, regexes) {
	let url = 'unknown URL'
	return Object.fromEntries(Object.entries(regexes).map(([ name, regex ]) => {
		const matches = str.match(regex)
		if (matches === null || !matches[1]) {
			throw new Error(`Unable to parse ${name} in ${url}`)
		}
		if (name === 'url') {
			url = matches[1]
		}
		return [ name, matches[1] ]
	}))
}
