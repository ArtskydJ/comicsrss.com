var https = require('https')

module.exports = function httpGet(url) {
	return new Promise(function (resolve, reject) {
		https.get(url, function handleResponse(response) {
			var statusCode = response.statusCode

			if (statusCode != 200) {
				reject(new Error(statusCode + ' error'))
			}

			var chunks = []
			response.on('data', chunk => {
				chunks.push(chunk)
			})
			response.once('end', () => {
				resolve(Buffer.concat(chunks).toString())
			})
			response.once('error', reject)
		})
	})
}

