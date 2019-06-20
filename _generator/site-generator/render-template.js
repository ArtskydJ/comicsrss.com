var path = require('path')
var mustache = require('art-template')

var defaultData = {
	encodeURI,
	encodeURIComponent
}

module.exports = function renderTemplate(templateFilenamePrefix, templateData) {
	if (typeof templateFilenamePrefix !== 'string') throw new TypeError('`templateFilenamePrefix` must be a string')
	if (!templateData || typeof templateData !== 'object') throw new TypeError('`templateData` must be an object')
	
	var templateHtmlPath = path.resolve(__dirname, 'template', templateFilenamePrefix + '-template.html')
	var templateDataWithDefaults = Object.assign({}, defaultData, templateData)
	return mustache(templateHtmlPath, templateDataWithDefaults)
}
