var fs = require('fs')
var path = require('path')
var mustache = require('art-template')

var rssitemcontentTemplateHtmlPath = path.resolve(__dirname, 'template', 'rssitemcontent-template.html')
var rssitemcontentTemplate = fs.readFileSync(rssitemcontentTemplateHtmlPath, 'utf-8')

module.exports = function generateHtml(comicObject, comicStrip) {
	return mustache.render(rssitemcontentTemplate, {
		comicsRssUrl: 'https://www.comicsrss.com/preview/' + encodeURI(comicObject.basename),
		comicStrip: comicStrip
	})
}

