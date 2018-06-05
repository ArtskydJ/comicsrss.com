var Feed = require('feed')
var crypto = require('crypto')

module.exports = function (comicObject) {
	if (!comicObject || !comicObject.comicStrips || !comicObject.comicStrips.length) {
		console.log(comicObject)
		throw new Error('Expected comicObject.comicStrips to be a non-empty array')
	}

	var feedAuthor = comicObject.author

	var feed = new Feed({
		title: comicObject.titleAndAuthor.split(' by ')[0],
		description: comicObject.titleAndAuthor,
		link: 'https://www.comicsrss.com/preview/' + comicObject.basename,
		image: comicObject.headerImageUrl,
		feed: 'https://www.comicsrss.com/rss/' + comicObject.basename + '.rss',
		copyright: 'Copyright ' + feedAuthor,
		author: { name: feedAuthor },
		id: makeId(comicObject.comicUrl)
	})

	comicObject.comicStrips.forEach(function (comicStrip) {
		var comicStripDate = new Date(comicStrip.date)

		var comicStripLink = comicStripDate < new Date('2018-06-05T05:00:00.000Z') ?
			comicStrip.url : // old link (required because the rss module doesn't seem to honor the `id` field)
			'https://www.comicsrss.com/preview/' + comicObject.basename + '#' + comicStripDate.toISOString().slice(0, 10) // new link
		feed.addItem({
			title: comicStrip.titleAuthorDate,
			link: comicStripLink,
			description: generateHtml(comicStrip),
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

function generateHtml(comicStrip) {
	return '<img src="' + comicStrip.comicImageUrl + '" alt="' + comicStrip.titleAuthorDate + '" title="' + comicStrip.titleAuthorDate + '">'
}
