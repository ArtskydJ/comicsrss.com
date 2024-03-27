const fs = require('fs')
const path = require('path')

module.exports = function writeFile(filename, contents) {
	const filePath = path.resolve(__dirname, '..', '..', filename)
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
