var fs = require('fs')
var path = require('path')
var pMap = require('p-map-series')
var getPageList = require('./get-page-list.js')
var getComicPages = require('./get-comic-pages.js')
var generateMainPageFromLinkObjects = require('./generate-main-page.js')
var generateRssFeedFromComicPages = require('./generate-rss-feed-from-comic-pages.js')

getPageList()
	.then(function (pageList) {
		var filteredPages = pageList.filter(pageFilter)
		return pMap(filteredPages, function (page) {
			return getComicPages(page)
				.then(function (pages) {
					if (!pages.length) return null

					var rssFeed = generateRssFeedFromComicPages(pages)
					writeFile('rss/' + rssFeed.filename, rssFeed.rss)

					return comicPagesToLinkObjects(pages)
				})
				.catch(function (err) {
					console.error(err.message)
				})
		})
	})
	.then(generateMainPageFromLinkObjects)
	.catch(function (err) {
		console.error(err)
		process.exit(1)
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

function comicPagesToLinkObjects(comicPages) {
	var description = comicPages[0].title.split(' for ')[0]
	var filename = comicPages[0].url.split('/')[3].trim() + '.rss'
	var feedUrl = 'http://www.comicsrss.com/rss/' + filename
	return {
		titleAndAuthor: description,
		feedUrl: feedUrl
	}
}

function writeFile(filename, contents) {
	var filePath = path.resolve(__dirname, '..', filename)
	fs.writeFileSync(filePath, contents, 'utf-8')
}
