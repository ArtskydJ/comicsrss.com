var http = require('http')

module.exports = function httpGet(url) {
	return new Promise(function (resolve, reject) {
		setTimeout(function () { // Rate limiting, haha
			http.get(url, handleResponse.bind(null, resolve, reject))
		}, 900) // 800 might work, 700 doesn't
	})
}

function handleResponse(resolve, reject, response) {
	var statusCode = response.statusCode
	var location = response.headers.location

	if (statusCode == 200) {
		concat(response, resolve, reject)
	} else if (statusCode >= 300 && statusCode < 400 && location === 'http://www.gocomics.com/') {
		reject(new Error('Comic no longer exists'))
	} else {
		reject(new Error(statusCode + ' error'))
	}
}

function concat(stream, resolve, reject) {
	var chunks = []
	stream.on('data', chunk => {
		chunks.push(chunk)
	})
	stream.once('end', () => {
		resolve(Buffer.concat(chunks).toString())
	})
	stream.once('error', reject)
}
