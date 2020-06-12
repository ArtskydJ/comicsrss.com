const https = require('https')

module.exports = function httpGet(url) {
	return new Promise((resolve, reject) => {
		if (global.VERBOSE) {
			console.log('GET ' + url)
		}
		setTimeout(() => { // Rate limiting, haha
			https.get(url, handleResponse.bind(null, resolve, reject))
		}, global.DEBUG ? 0 : 900) // 800 might work, 700 doesn't
	})
}

function handleResponse(resolve, reject, response) {
	const statusCode = response.statusCode
	const location = response.headers.location

	if (statusCode === 200) {
		const chunks = []
		response.on('data', chunk => chunks.push(chunk))
		response.once('end', () => resolve(Buffer.concat(chunks).toString()))
		response.once('error', reject)
	} else if (statusCode >= 300 && statusCode < 400 && location === 'https://www.gocomics.com/') {
		reject(new Error('Comic no longer exists'))
	} else {
		reject(new Error(statusCode + ' error'))
	}
}
