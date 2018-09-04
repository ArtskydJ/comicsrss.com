var fs = require('fs')
var path = require('path')

var rssitemcontentTemplateHtmlPath = path.resolve(__dirname, 'template', 'rssitemcontent-template.html')
var rssitemcontentTemplate = fs.readFileSync(rssitemcontentTemplateHtmlPath, 'utf-8')

module.exports = function generateHtml(comicObject, comicStrip) {
	return rssitemcontentTemplate
		.replace(/<!-- GOCOMICS URL -->/g, comicStrip.url)
		.replace(/<!-- COMICSRSS URL -->/g, 'https://www.comicsrss.com/preview/' + encodeURI(comicObject.basename))
		.replace(/<!-- COMIC IMAGE URL -->/g, comicStrip.comicImageUrl)
		.replace(/<!-- TITLE AUTHOR DATE -->/g, comicStrip.titleAuthorDate)
}

