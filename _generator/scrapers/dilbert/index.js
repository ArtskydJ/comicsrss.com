var httpGet = require('./http-get.js')
var mergeComicStrips = require('./merge.js')

module.exports = function main(comicObjects) {
	return httpGet('https://dilbert.com').then(function (html) {
		var newComicStrips = html
			.split('\n')
			.map(l => l.trim())
			.filter(l => l.startsWith('<div class="comic-item-container'))
			.map(function (line) {
				var data = line
					.split('" ')
					.filter(a => a.startsWith('data-'))
					.reduce(function (memo, attr) {
						var parts = attr.split('=')
						var attrName = parts[0].replace(/^data-/, '')
						var attrValue = parts[1].replace(/.*?"(.*)/, '$1').replace(/(.*)".*/, '$1')
						memo[attrName] = attrValue
						return memo
					}, {})

				return {
					titleAuthorDate: `Dilbert by ${data.creator} for ${data.date}`,
					url: data.url,
					date: data.id,
					comicImageUrl: data.image.replace(/^\/\//, 'https://')
				}
			})
			// data-id="2018-11-20"
			// data-url="https://dilbert.com/strip/2018-11-20"
			// data-image="//assets.amuniversal.com/6a95e580..."
			// data-date="November 20, 2018"
			// data-creator="Scott Adams"
			// data-title="Boss Email Password"

		return [{
			titleAndAuthor: 'Dilbert by Scott Adams',
			basename: 'dilbert',
			author: 'Scott Adams',
			comicUrl: 'https://dilbert.com/',
			headerImageUrl: 'https://avatar.amuniversal.com/feature_avatars/recommendation_images/features/dc/large_rec-201701251557.jpg',
			isPolitical: false,
			language: 'eng',
			comicStrips: mergeComicStrips(comicObjects[0].comicStrips, newComicStrips)
		}]
	})
}
