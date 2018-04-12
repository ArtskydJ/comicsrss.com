var fs = require('fs')
var path = require('path')

var indexTemplateHtmlPath = path.resolve(__dirname, 'template', 'index-template.html')
var indexTemplateHtml = fs.readFileSync(indexTemplateHtmlPath, 'utf-8')

module.exports = function generateMainPage(comicObjects) {
	var rssFeedList = comicObjectsToHtml(comicObjects)
	var todaysDate = new Date().toDateString()
	
	return indexTemplateHtml
		.replace('<!-- RSS FEED LIST -->', rssFeedList)
		.replace('<!-- DATE GENERATED -->', todaysDate)
}

function comicObjectsToHtml(comicObjects) {
	return '<ul>' +
	comicObjects
		.filter(Boolean)
		.map(function (comicObject) {
			var comicsRssFeedUrl = 'http://www.comicsrss.com/rss/' + comicObject.basename + '.rss'
			return `
				<li data-search="${comicObject.titleAndAuthor.toLowerCase()}">
					<a href="./preview/${encodeURI(comicObject.basename)}" class="comic-title">${comicObject.titleAndAuthor}</a>
				</li>`.replace(/^\t{4}/mg, '')
		})
		.sort()
		.join('\n') +
	'</ul>'
}
