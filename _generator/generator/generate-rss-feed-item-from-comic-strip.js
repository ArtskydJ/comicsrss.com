var fs = require('fs')
var path = require('path')

var rssitemcontentTemplateHtmlPath = path.resolve(__dirname, 'template', 'rssitemcontent-template.html')
var rssitemcontentTemplate = fs.readFileSync(rssitemcontentTemplateHtmlPath, 'utf-8')

module.exports = function generateHtml(comicStrip) {
	return rssitemcontentTemplate
		.replace(/<!-- GOCOMICS URL -->/g, comicStrip.url)
		.replace(/<!-- COMIC IMAGE URL -->/g, comicStrip.comicImageUrl)
		.replace(/<!-- TITLE AUTHOR DATE -->/g, comicStrip.titleAuthorDate)
}

