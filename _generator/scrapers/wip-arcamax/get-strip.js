const httpGet = require('./http-get.js')

module.exports = async function getStrip(stripPageUrl) {
	const html = await httpGet(stripPageUrl)
	const imageUrlMatches = html.match(/<img id="comic-zoom".+src="([^">]+)"/)
	const dateMatches = html.match(/<span class="cur">(\w{3}).*?([\d/]+)<\/span>/)
	const authorMatches = html.match(/<cite>by (.+?)<\/cite>/)
	const urlMatches = html.match(/var disqus_url = '(.+?)';/)
	const isOldestStrip = /class="prev-off"/.test(html)
	const olderRelUrlMatches = html.match(/<a.+class=["']prev["'].+href=["'](.*?)["']/)
	// const newerRelUrlMatches = html.match(/<a.+class=["']next["'].+href=["'](.*?)["']/)
	const headerImageUrlMatches = html.match(/<meta property="og:image" content=["'](.+?)["']/)

	if (urlMatches === null || ! urlMatches[1]) throw new Error('Unable to parse url')
	const url = urlMatches[1]
	if (imageUrlMatches === null || ! imageUrlMatches[1]) throw new Error('Unable to parse comicImageUrl in ' + url)
	if (dateMatches === null || ! dateMatches[1] || ! dateMatches[2]) throw new Error('Unable to parse date in ' + url)
	if (authorMatches === null || ! authorMatches[1]) throw new Error('Unable to parse author in ' + url)
	if (olderRelUrlMatches === null || (! olderRelUrlMatches[1] && ! isOldestStrip)) throw new Error('Unable to parse olderRelUrl in ' + url)
	// if (newerRelUrlMatches === null) throw new Error('Unable to parse newerRelUrl in ' + url)

	const year = new Date().toISOString().slice(0, 4)
	const date = new Date(`${year} ${dateMatches[1]} ${dateMatches[2]}`).toISOString().slice(0, 10)

	return {
		imageUrl: imageUrlMatches[1],
		date,
		author: authorMatches[1],
		url,
		isOldestStrip,
		olderRelUrl: olderRelUrlMatches[1],
		// newerRelUrl: newerRelUrlMatches[1],
		headerImageUrl: headerImageUrlMatches[1]
	}
}
