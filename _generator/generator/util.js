var fs = require('fs')
var path = require('path')
var mustache = require('art-template')

function writeFile(filename, contents) {
	var filePath = path.resolve(__dirname, filename)
	try {
		fs.writeFileSync(filePath, contents, 'utf-8')
	} catch (e) {
		if (e.code === 'ENOENT') {
			fs.mkdirSync(path.dirname(filePath))
			fs.writeFileSync(filePath, contents, 'utf-8')
		} else {
			throw e
		}
	}
}

function renderOutput(templateFilenamePrefix, templateData) {
	var templateHtmlPath = path.resolve(__dirname, 'template', templateFilenamePrefix + '-template.html')
	var templateHtml = fs.readFileSync(templateHtmlPath, 'utf-8')
	templateData.encodeURI = encodeURI
	templateData.encodeURIComponent = encodeURIComponent
	return mustache.render(templateHtml, templateData)
}

function render(templateFilenamePrefix, outputFilename, templateData) {
	var renderedOutput = renderOutput(templateFilenamePrefix, templateData)
	writeFile(outputFilename, renderedOutput)
}

module.exports = {
	writeFile: writeFile,
	renderOutput: renderOutput,
	render: render
}
