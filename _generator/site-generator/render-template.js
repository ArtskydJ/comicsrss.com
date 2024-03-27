const path = require('path')
const mustache = require('art-template')

const defaultData = {
	encodeURI,
	encodeURIComponent
}

module.exports = function renderTemplate(templateFilenamePrefix, templateData) {
	if (typeof templateFilenamePrefix !== 'string') throw new TypeError('`templateFilenamePrefix` must be a string')
	if (!templateData || typeof templateData !== 'object') throw new TypeError('`templateData` must be an object')

	const templateHtmlPath = path.resolve(__dirname, 'template', templateFilenamePrefix + '-template.html')
	const templateDataWithDefaults = Object.assign({}, defaultData, templateData)
	return mustache(templateHtmlPath, templateDataWithDefaults)
}
