var Feed = require('feed')
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

	comicObject.comicStrips.forEach(function (comicStrip) {
		var comicStripDate = new Date(comicStrip.date)

		var uniqueString = comicStrip.comicImageUrl.split('/').pop()
		var comicStripLink = comicStripDate >= new Date('2018-08-08') ? 
			'https://www.comicsrss.com/rssitemcontent/' + comicStrip.date + '/' + uniqueString + '.html' : // new
			'https://www.comicsrss.com/rssitemcontent/' + uniqueString.slice(0, 3) + '/' + uniqueString + '.html' // old
		feed.addItem({
			title: comicStrip.titleAuthorDate,
			link: comicStripLink,
			description: renderTemplate('rssitemcontent', {
				comicName: comicObject.basename,
				comicStrip: comicStrip
			}),
			author: [{ name: feedAuthor }],
			date: comicStripDate,
			// Unfortunately, if the link changes, so will the ID.
			// The links shouldn't be changing, so hopefully this doesn't become an issue.
			id: makeId(comicStrip.url)
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
