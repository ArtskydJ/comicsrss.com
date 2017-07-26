var http = require('http')
var concat = require('simple-concat')

module.exports = function httpGet(url) {
	return new Promise(function (resolve, reject) {
		setTimeout(function () { // Rate limiting, haha
			http.get(url, handleResponse.bind(null, resolve, reject))
		}, 1000) // 800 might work, 700 doesn't
	})
}

function handleResponse(resolve, reject, response) {
	var statusCode = response.statusCode
	var location = response.headers.location

	if (statusCode == 200) {
		resolveWithBufferedResponse(resolve, reject, response)
	} else if (statusCode >= 300 && statusCode < 400 && location === 'http://www.gocomics.com/') {
		reject(new Error('Comic no longer exists'))
	} else {
		reject(new Error(statusCode + ' error'))
	}
}

function resolveWithBufferedResponse(resolve, reject, response) {
	concat(response, function (err, buf) {
		if (err) reject(err)
		else resolve(buf.toString())
	})
}
