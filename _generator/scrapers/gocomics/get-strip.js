const httpGet = require('./http-get.js')

module.exports = async function getStrip(stripPageUrl) {
	const html = await httpGet(stripPageUrl)
	const imageUrlMatches = html.match(/<meta property="og:image" content="([^">]+)"/)
	const dateMatches = html.match(/<meta property="article:published_time" content="([^">]+)"/)
	const authorMatches = html.match(/<meta property="article:author" content="([^">]+)"/)
	const urlMatches = html.match(/<input .*?value="([^"]+)".+?aria-label=["']Get the permalink["']/)
	const isOldestStrip = /<a.+class=["'][^"']*fa-caret-left[^"']*disabled/.test(html)
	const olderRelUrlMatches = html.match(/<a.+href=["'](.*?)["'] class=["'][^"']*fa-caret-left/)
	const newerRelUrlMatches = html.match(/<a.+href=["'](.*?)["'] class=["'][^"']*fa-caret-right/)
	const headerImageUrlMatches = html.match(/src="(https:\/\/avatar\.amuniversal\.com\/.+?)"/) || []

	if (urlMatches === null || ! urlMatches[1]) throw new Error('Unable to parse url')
	const url = urlMatches[1]
	if (imageUrlMatches === null || ! imageUrlMatches[1]) throw new Error('Unable to parse comicImageUrl in ' + url)
	if (dateMatches === null || ! dateMatches[1]) throw new Error('Unable to parse date in ' + url)
	if (authorMatches === null || ! authorMatches[1]) throw new Error('Unable to parse author in ' + url)
	if (olderRelUrlMatches === null || (! olderRelUrlMatches[1] && ! isOldestStrip)) throw new Error('Unable to parse olderRelUrl in ' + url)
	if (newerRelUrlMatches === null) throw new Error('Unable to parse newerRelUrl in ' + url)

	return {
		imageUrl: imageUrlMatches[1],
		date: dateMatches[1],
		author: authorMatches[1],
		url,
		isOldestStrip,
		olderRelUrl: olderRelUrlMatches[1],
		// newerRelUrl: newerRelUrlMatches[1],
		headerImageUrl: headerImageUrlMatches[1]
	}
}
