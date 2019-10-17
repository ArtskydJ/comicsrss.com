var Feed = require('feed').Feed
var crypto = require('crypto')
var renderTemplate = require('./render-template.js')

module.exports = function (comicObject) {
	if (!comicObject || !comicObject.comicStrips || !comicObject.comicStrips.length) {
		console.log(comicObject)
		throw new Error('Expected comicObject.comicStrips to be a non-empty array')
	}

	var feedAuthor = comicObject.author
	var lastComicDate = comicObject.comicStrips[0].date

	var feed = new Feed({
		title: comicObject.titleAndAuthor.split(' by ')[0],
		description: comicObject.titleAndAuthor,
		link: 'https://www.comicsrss.com/preview/' + encodeURI(comicObject.basename),
		image: comicObject.headerImageUrl,
		feed: 'https://www.comicsrss.com/rss/' + comicObject.basename + '.rss',
		copyright: 'Copyright ' + feedAuthor,
		updated: new Date(lastComicDate),
		author: { name: feedAuthor },
		id: makeId(comicObject.comicUrl)
	})

	comicObject.comicStrips.slice(0, 15).forEach(function (comicStrip) {
		var comicStripDate = new Date(comicStrip.date)
		var guid = comicStrip.url
		if (comicStripDate >= new Date('2019-10-17')) {
			guid = makeId(comicStrip.basename + comicStrip.date)
		}

		feed.addItem({
			title: comicStrip.titleAuthorDate,
			link: comicStrip.url,
			description: renderTemplate('rssitemcontent', {
				comicName: comicObject.basename,
				comicStrip: comicStrip
			}),
			author: [{ name: feedAuthor }],
			date: comicStripDate,
			guid: guid,
			id: guid
		})
	})

	return feed.rss2()
}

function makeId(str) {
	var hasher = crypto.createHash('md5')
	hasher.update(str)
	var hash = hasher.digest('hex')
	return hash.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5')
}
