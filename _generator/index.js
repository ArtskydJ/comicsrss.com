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
		return results.filter(function (comicPages) {
			return comicPages.length > 0
		})
	})
	.then(createFiles)
	.catch(function (err) {
		console.error(err)
		process.exit(1)
	})

function createFiles(results) {
	var markdown = [
		'# comicsrss.com',
		'Copy one of the following rss links, and add it to your favorite feed reader!',
		results.map(comicPagesToMdLink).sort().join(''),
		'-----',
		'[View on GitHub](https://github.com/ArtskydJ/comicsrss.com) - Made by [Joseph Dykstra](http://www.josephdykstra.com)',
		'> Generated on ' + new Date().toDateString() // This works because of my time zone...
	].join('\n\n')
	writeFile('README.md', markdown)

	results
		.map(generateRssFeedFromComicPages)
		.forEach(function (rssFeed) {
			writeFile('rss/' + rssFeed.filename, rssFeed.rss)
		})
}

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
	return '- [' + description + '](http://www.comicsrss.com/rss/' + filename + ')\n'
}

function caseInsensitiveSort(a, b) {
	return a.localeCompare(b, 'en', { sensitivity: 'base' })
}

function writeFile(filename, contents) {
	var filePath = path.resolve(__dirname, '..', filename)
	fs.writeFileSync(filePath, contents, 'utf-8')
}
