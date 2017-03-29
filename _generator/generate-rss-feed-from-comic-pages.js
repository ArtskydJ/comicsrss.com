var Feed = require('feed')
var crypto = require('crypto')

module.exports = function (comicPages) {
	if (!comicPages || !comicPages.length)  {
		throw new Error('Expected comicPages to be a non-empty array')
	}

	var feedAuthor = comicPages[0].author
	var feedUrl = comicPages[0].url
	var filename = feedUrl.split('/')[3] + '.rss'

	var feed = new Feed({
		title: comicPages[0].title.split(' by ')[0],
		description: comicPages[0].title.split(' for ')[0],
		link: feedUrl,
		image: comicPages[0].headerImageUrl,
		copyright: 'Copyright ' + feedAuthor,
		author: { name: feedAuthor },
		id: makeId(feedUrl)
	})

	comicPages.forEach(function (comicPage) {
		feed.addItem({
			title: comicPage.title,
			link: comicPage.url,
			description: generateHtml(comicPage),
			author: [{ name: feedAuthor }],
			date: new Date(comicPage.date),
			// Unfortunately, if the link changes, so will the ID.
			// The links shouldn't be changing, so hopefully this doesn't become an issue.
			id: makeId(comicPage.url)
		})
	})

	return {
		filename: filename,
		rss: feed.render('rss-2.0')
	}
}

function makeId(str) {
	var hasher = crypto.createHash('md5')
	hasher.update(str)
	var hash = hasher.digest('hex')
	return hash.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5')
}

function generateHtml(comicPage) {
	return '<img src="' + comicPage.comicUrl + '" alt="' + comicPage.title + '" title="' + comicPage.title + '">'
}

/* example comicPage:
{ imageUrl: 'http://assets.amuniversal.com/1fb42a70f47b013479d5005056a9545d',
title: 'Basic Instructions by Scott Meyer for Mar 26, 2017 ',
date: '2017-03-26',
author: 'Scott Meyer',
url: 'http://www.gocomics.com/basicinstructions/2017/03/26',
olderRelUrl: '/basicinstructions/2017/03/24',
newerRelUrl: '/basicinstructions/2017/03/28',
headerImageUrl: 'http://avatar.amuniversal.com/feature_avatars/header_images/features/basic/large_header-201701251538.jpg' }
*/
