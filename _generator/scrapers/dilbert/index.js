const fetch = require('../fetch.js')

module.exports = async function main(cachedSeriesObjects) {
	const html = await fetch('https://dilbert.com')

	const newStrips = html
		.split('\n')
		.map(l => l.trim())
		.filter(l => l.startsWith('<div class="comic-item-container'))
		.map(line => {
			const dataEntries = line
				.split('" ')
				.filter(a => a.startsWith('data-'))
				.map(attr => {
					let [ name, value ] = attr.split('=')
					name = name.replace(/^data-/, ''),
					value = value.replace(/.*?"(.*)/, '$1').replace(/(.*)".*/, '$1')
					return [ name, value ]
				})
			const { url, id, image } = Object.fromEntries(dataEntries)
			const imageUrl = image.replace(/^\/\//, 'https://')

			return { url, date: id, imageUrl }
		})
		// data-id="2018-11-20"
		// data-url="https://dilbert.com/strip/2018-11-20"
		// data-image="//assets.amuniversal.com/6a95e580..."
		// data-date="November 20, 2018"
		// data-creator="Scott Adams"
		// data-title="Boss Email Password"

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
