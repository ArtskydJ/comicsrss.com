const https = require('https')

module.exports = function httpGet(url) {
	return new Promise((resolve, reject) => {
		https.get(url, response => {
			const statusCode = response.statusCode

			if (statusCode !== 200) {
				reject(new Error(statusCode + ' error'))
			}

			const chunks = []
			response.on('data', chunk => chunks.push(chunk))
			response.once('end', () => resolve(Buffer.concat(chunks).toString()))
			response.once('error', reject)
		})
	})
}
