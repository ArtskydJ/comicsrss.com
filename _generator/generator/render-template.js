var fs = require('fs')
var path = require('path')
var mustache = require('art-template')

var defaultData = {
	encodeURI,
	encodeURIComponent
}

module.exports = function renderTemplate(templateFilenamePrefix, templateData) {
	var templateHtmlPath = path.resolve(__dirname, 'template', templateFilenamePrefix + '-template.html')
	var templateHtml = fs.readFileSync(templateHtmlPath, 'utf-8')
	var templateDataWithDefaults = Object.assign({}, defaultData, templateData)
	return mustache.render(templateHtml, templateDataWithDefaults)
}
