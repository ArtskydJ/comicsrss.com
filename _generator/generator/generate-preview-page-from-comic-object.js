var fs = require('fs')
var path = require('path')
var mustache = require('art-template')

var previewTemplateHtmlPath = path.resolve(__dirname, 'template', 'preview-template.html')
var previewTemplateHtml = fs.readFileSync(previewTemplateHtmlPath, 'utf-8')

module.exports = function generatePreviewPage(comicObject) {
	var comicsRssFeedUrl = 'https://www.comicsrss.com/rss/' + encodeURI(comicObject.basename) + '.rss'

	return mustache.render(previewTemplateHtml, {
		comicObject: comicObject,
		dateGenerated: new Date().toDateString(),
		comicsRssPreviewUrl: 'https://www.comicsrss.com/preview/' + encodeURI(comicObject.basename),
		comicsRssFeedUrl: comicsRssFeedUrl,
		feedlyFeedUrl: 'https://feedly.com/i/subscription/feed/' + encodeURIComponent(comicsRssFeedUrl),
		isoDate: function isoDate(date) {
			return new Date(date).toISOString().slice(0, 10)
		}
	})
}
