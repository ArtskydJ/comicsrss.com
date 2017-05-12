var fs = require('fs')
var path = require('path')

module.exports = function generateMainPage(linkObjects) {
	var html = fs.readFileSync(path.resolve(__dirname, 'index-template.html'), 'utf-8')

	var rssFeedList = linkObjectsToHtml(linkObjects)
	var todaysDate = new Date().toDateString()

	html = html.replace('<!-- RSS FEED LIST -->', rssFeedList)
	html = html.replace('<!-- DATE GENERATED -->', todaysDate)

	fs.writeFileSync(path.resolve(__dirname, '..', 'index.html'), html, 'utf-8')
}

function linkObjectsToHtml(linkObjects) {
	return '<ul>' +
	linkObjects
	.filter(Boolean)
	.map(function (linkObject) {
		return `
		<li data-search="${linkObject.titleAndAuthor.toLowerCase()}">
			<a href="${linkObject.feedUrl}">
				${linkObject.titleAndAuthor}
			</a>
		</li>`
	})
	.sort()
	.join('\n') +
	'</ul>'
}