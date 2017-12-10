var fs = require('fs')
var path = require('path')
var generateRssFeedFromComicPages = require('./generate-rss-feed-from-comic-pages.js')
var generateMainPageFromLinkObjects = require('./generate-main-page.js')
var linkObjectsAndPages = require('./_saved-state.json')

linkObjectsAndPages.forEach(function (linkObject) {
	if (!linkObject) return null

	var rssFeed = generateRssFeedFromComicPages(linkObject.pages)
	writeFile('rss/' + rssFeed.filename, rssFeed.rss)
})

generateMainPageFromLinkObjects(linkObjectsAndPages)

function writeFile(filename, contents) {
	var filePath = path.resolve(__dirname, '..', filename)
	fs.writeFileSync(filePath, contents, 'utf-8')
}
