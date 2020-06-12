const https = require('https')

module.exports = function fetch(url) {
	return new Promise((resolve, reject) => {
		if (global.VERBOSE) {
			console.log('GET ' + url)
		}
		https.get(url, res => {
			if (res.statusCode !== 200) {
				return reject(new Error(res.statusCode + ' error'))
			}

			const chunks = []
			res.on('data', chunk => chunks.push(chunk))
			res.once('end', () => resolve(Buffer.concat(chunks).toString()))
			res.once('error', reject)
		})
	})
}
