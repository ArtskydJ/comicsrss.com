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
		var markdown = [
			'# gocomics-to-rss',
			'Copy one of the following rss links, and add it to your favorite feed reader!',
			results.map(comicPagesToMdLink).sort().join('')
		].join('\n\n')
		writeFile('README.md', markdown)

		results
			.map(generateRssFeedFromComicPages)
			.forEach(function (rssFeed) {
				writeFile(rssFeed.filename, rssFeed.rss)
			})
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

function comicPagesToMdLink(comicPages) {
	var description = comicPages[0].title.split(' for ')[0]
	var feedUrl = comicPages[0].url
	var filename = feedUrl.split('/')[3].trim() + '.rss'
	return '- [' + description + '](https://artskydj.github.io/gocomics-to-rss/' + filename + ')\n'
}

function writeFile(filename, contents) {
	var filePath = path.resolve(__dirname, '..', filename)
	fs.writeFileSync(filePath, contents, 'utf-8')
}
