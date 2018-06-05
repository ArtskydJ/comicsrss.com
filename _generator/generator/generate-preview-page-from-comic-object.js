var fs = require('fs')
var path = require('path')

var previewTemplateHtmlPath = path.resolve(__dirname, 'template', 'preview-template.html')
var previewTemplateHtml = fs.readFileSync(previewTemplateHtmlPath, 'utf-8')

module.exports = function generatePreviewPage(comicObject) {
// 	var rssFeedList = comicObjectsToHtml(comicObjects)
	var comicsRssPreviewUrl = 'https://www.comicsrss.com/preview/' + encodeURI(comicObject.basename)
	var comicsRssFeedUrl = 'https://www.comicsrss.com/rss/' + encodeURI(comicObject.basename) + '.rss'
	var feedlyFeedUrl = 'https://feedly.com/i/subscription/feed/' + encodeURIComponent(comicsRssFeedUrl)
	var comicImagesHtml = generateComicImagesHtml(comicObject)
	var todaysDate = new Date().toDateString()

	return previewTemplateHtml
		.replace('<!-- COMIC TITLE -->', comicObject.titleAndAuthor)
		.replace('<!-- GOCOMICS URL -->', comicObject.comicUrl)
		.replace('<!-- FEEDLY FEED URL -->', feedlyFeedUrl)
		.replace('<!-- RSS URL -->', comicsRssFeedUrl)
		.replace('<!-- COMIC IMAGES -->', comicImagesHtml)
		.replace('<!-- DATE GENERATED -->', todaysDate)
}

function generateComicImagesHtml(comicObject) {
	return comicObject.comicStrips
	.slice(0, 14) // two weeks
	.map(function (comicStrip) {
		var comicStripDate = new Date(comicStrip.titleAuthorDate.split(' for ').pop()).toISOString().slice(0, 10)
		return `<p id="${comicStripDate}">
			<div>
				<span class="preview-header">${comicStrip.titleAuthorDate}</span>
				<a href="#${comicStripDate}">
					<img src="../static/link_sm.png" alt="Link to this comic strip">
				</a>
				<a href="${comicStrip.url}">
					<img src="../static/gocomics_sm.png" alt="View on GoComics">
				</a>
			</div>
			<img class="preview-comic" src="${comicStrip.comicImageUrl}">
		</p>`
	})
	.join('')
}
