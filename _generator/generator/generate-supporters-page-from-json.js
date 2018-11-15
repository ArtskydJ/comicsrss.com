// var fs = require('fs')
var path = require('path')
var mustache = require('art-template')

var supportersTemplateHtmlPath = path.resolve(__dirname, 'template', 'supporters-template.html')
// var supportersTemplateHtml = fs.readFileSync(supportersTemplateHtmlPath, 'utf-8')

module.exports = function generateSupportersPage(supporters) {
	return mustache(supportersTemplateHtmlPath, {
		dateGenerated: new Date().toDateString(),
		supporters: supporters
	})
}
