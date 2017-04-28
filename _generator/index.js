var fs = require('fs')
var path = require('path')
var pMap = require('p-map')
var getPageList = require('./get-page-list.js')
var getComicPages = require('./get-comic-pages.js')
var generateRssFeedFromComicPages = require('./generate-rss-feed-from-comic-pages.js')

getPageList()
	.then(function (pageList) {
		var filteredPages = pageList.filter(pageFilter)
		return pMap(filteredPages, function (page) {
			return getComicPages(page).then(function (pages) {
				if (!pages.length) return null

				var rssFeed = generateRssFeedFromComicPages(pages)
				writeFile('rss/' + rssFeed.filename, rssFeed.rss)

				return comicPagesToMdLink(pages)
			})
		}, { concurrency: 8 })
	})
	.then(createIndexPage)
	.catch(function (err) {
		console.error(err)
		process.exit(1)
	})

function createIndexPage(mdLinks) {
	var markdown = [
		'# comicsrss.com',
		'Copy one of the following rss links, and add it to your favorite feed reader!',
		mdLinks.filter(Boolean).sort(caseInsensitiveSort).join('\n'),
		'-----',
		'[View on GitHub](https://github.com/ArtskydJ/comicsrss.com) - Made by [Joseph Dykstra](http://www.josephdykstra.com)',
		'> Generated on ' + new Date().toDateString() // This works because of my time zone...
	].join('\n\n')
	writeFile('README.md', markdown)
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
	return '- [' + description + '](http://www.comicsrss.com/rss/' + filename + ')'
}

function caseInsensitiveSort(a, b) {
	return a.localeCompare(b, 'en', { sensitivity: 'base' })
}

function writeFile(filename, contents) {
	var filePath = path.resolve(__dirname, '..', filename)
	fs.writeFileSync(filePath, contents, 'utf-8')
}
