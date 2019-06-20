var writeFile = require('../lib/write-file.js')
var httpGet = require('./http-get.js')
var dilbertComicObjectJsonPath = '../tmp/_dilbert-comic-object.json'
var dilbertComicObject = require(dilbertComicObjectJsonPath)

httpGet('https://dilbert.com')
	.then(function (html) {
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
			// data-image="//assets.amunibersal.com/6a95e580..."
			// data-date="November 20, 2018"
			// data-creator="Scott Adams"
			// data-title="Boss Email Password"

		var merged = mergeComicStrips(dilbertComicObject.comicStrips, newComicStrips)
		dilbertComicObject.comicStrips = merged.slice(0, 25)
		var dilbertComicObjectJson = JSON.stringify(dilbertComicObject, null, '\t')
		writeFile(dilbertComicObjectJsonPath, dilbertComicObjectJson)
	})

function mergeComicStrips(oldComicStrips, newComicStrips) {
	var previousComicStrip = oldComicStrips[0]
	var addTheseComicStrips = []
	for (var i = 0; i < newComicStrips.length; i++) {
		var comicStrip = newComicStrips[i]
		if (comicStrip.date === previousComicStrip.date) {
			break
		}
		addTheseComicStrips.push(comicStrip)
	}
	return addTheseComicStrips.concat(oldComicStrips)
}
