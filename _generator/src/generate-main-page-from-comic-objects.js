var fs = require('fs')
var path = require('path')

var feedlyIconUrl = 'https://s3.feedly.com/img/follows/feedly-follow-logo-black_2x.png'

module.exports = function generateMainPage(comicObjects) {
	var indexTemplateHtmlPath = path.resolve(__dirname, '..', 'template', 'index-template.html')
	var indexTemplateHtml = fs.readFileSync(indexTemplateHtmlPath, 'utf-8')
	var rssFeedList = comicObjectsToHtml(comicObjects)
	var todaysDate = new Date().toDateString()
	var html = indexTemplateHtml
		.replace('<!-- FEEDLY ICON URL -->', feedlyIconUrl)
		.replace('<!-- RSS FEED LIST -->', rssFeedList)
		.replace('<!-- DATE GENERATED -->', todaysDate)
	return html
}

function comicObjectsToHtml(comicObjects) {
	return '<ul>' +
	comicObjects
		.filter(Boolean)
		.map(function (comicObject) {
			var comicsRssFeedUrl = 'http://www.comicsrss.com/rss/' + comicObject.filename
			return `
				<li data-search="${comicObject.titleAndAuthor.toLowerCase()}">
					<span class="comic-title">${comicObject.titleAndAuthor}</span>
					<a href="${comicsRssFeedUrl}" onclick="return copy(this, '${comicsRssFeedUrl}')" class="icon-link" title="Copy RSS URL">
						<img src="./static/rss.svg" alt="copy rss feed url for ${comicObject.titleAndAuthor}" class="icon rss-icon">
					</a>
					<a href="https://feedly.com/i/subscription/feed/${encodeURIComponent(comicsRssFeedUrl)}" target="_blank" class="icon-link" title="Open in feedly">
						<img src="${feedlyIconUrl}" alt="follow ${comicObject.titleAndAuthor} in feedly" class="icon feedly-icon">
					</a>
				</li>`.replace(/^\t{4}/mg, '')
		})
		.sort()
		.join('\n') +
	'</ul>'
}
