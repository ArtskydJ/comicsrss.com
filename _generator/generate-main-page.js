var fs = require('fs')
var path = require('path')

var feedlyIconUrl = 'https://s3.feedly.com/img/follows/feedly-follow-logo-black_2x.png'

module.exports = function generateMainPage(linkObjects) {
	var html = fs.readFileSync(path.resolve(__dirname, 'index-template.html'), 'utf-8')

	var rssFeedList = linkObjectsToHtml(linkObjects)
	var todaysDate = new Date().toDateString()

	html = html.replace('<!-- FEEDLY ICON URL -->', feedlyIconUrl)
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
			${linkObject.titleAndAuthor}
			<a href="javascript:copyToClipboard('${linkObject.feedUrl}')">
				<img src="./rss.svg" class="icon rss-icon">
			</a>
			<a href="http://cloud.feedly.com/#subscription%2Ffeed%2F${encodeURIComponent(linkObject.feedUrl)}" target="blank">
				<img src="${feedlyIconUrl}" alt="follow us in feedly" class="icon feedly-icon">
			</a>
		</li>`
	})
	.sort()
	.join('\n') +
	'</ul>'
}