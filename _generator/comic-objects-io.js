var fs = require('fs')
var path = require('path')

function read(name) {
	var json = fs.readFileSync(getFilePath(name), 'utf-8')
	return JSON.parse(json)
}

function write(name, contents) {
	var json = JSON.stringify(contents, null, '\t')
	fs.writeFileSync(getFilePath(name), json, 'utf-8')
}

function getFilePath(name) {
	var fileName = {
		dilbert: '_dilbert-comic-object.json',
		gocomics: '_comic-objects.json'
	}[name]

	// var filePath = `../tmp/_${name}-comic-objects.json`
	var filePath = path.resolve(__dirname, 'tmp', fileName)
	return filePath
}

module.exports = { read, write }
