const fetch = require('./lib/fetch.js')
const { query_html } = require('./lib/query-html.js')

module.exports = async function main(cachedSeriesObjects) {
	const html = await fetch('https://dilbert.com')
	const $ = query_html(html)

	const newStrips = $('div.comic-item-container')
		.map(container_element => {
			const attr = container_element.attribs
			return {
				url: attr['data-url'].replace(/=Dilbert_Daily$/, ''),
				date: attr['data-id'],
				imageUrl: attr['data-image'].replace(/^\/\//, 'https://')
			}
		})

	return {
		dilbert: {
			title: 'Dilbert',
			author: 'Scott Adams',
			url: 'https://dilbert.com/',
			imageUrl: 'https://avatar.amuniversal.com/feature_avatars/recommendation_images/features/dc/large_rec-201701251557.jpg',
			isPolitical: false,
			language: 'eng',
			strips: mergeStrips(cachedSeriesObjects.dilbert.strips, newStrips)
		}
	}
}

function mergeStrips(cachedStrips, newStrips) {
	const mostRecentStrip = cachedStrips[0]
	const addTheseStrips = []
	for (const strip of newStrips) {
		if (strip.date === mostRecentStrip.date) break
		addTheseStrips.push(strip)
	}
	return addTheseStrips.concat(cachedStrips)
}
