var fs = require('fs')
var path = require('path')
var pMap = require('p-map')
var getPageList = require('./get-page-list.js')
var getComicPages = require('./get-comic-pages.js')
var generateRssFeedFromComicPages = require('./generate-rss-feed-from-comic-pages.js')

getPageList()
	.then(function (pageList) {
		return pageList.filter(pageFilter)
	})
	.then(function (filteredPages) {
		return pMap(filteredPages, getComicPages, { concurrency: 8 })
	})
	.then(function (results) {
		results
			.map(generateRssFeedFromComicPages)
			.forEach(writeFeed)
	})
	.catch(function (err) {
		console.error(err)
	})

function pageFilter(page) {
	var url = page.loc

	return !(
		url === 'http://www.gocomics.com' ||
		url.startsWith('http://www.gocomics.com/news') ||
		url.startsWith('http://www.gocomics.com/comics') ||
		url.startsWith('http://www.gocomics.com/profiles')
	)
}

function writeFeed(feedInfo) {
	var filePath = path.resolve(__dirname, '..', feedInfo.filename)
	fs.writeFileSync(filePath, feedInfo.rss, 'utf-8')
}
