var https = require('https')
var concat = require('simple-concat')
var isDebug = !!process.env.DEBUG

module.exports = function httpGet(url) {
	return new Promise(function (resolve, reject) {
		if (isDebug) {
			console.log('GET ' + url)
		}
		setTimeout(function () { // Rate limiting, haha
			https.get(url, handleResponse.bind(null, resolve, reject))
		}, isDebug ? 0 : 900) // 800 might work, 700 doesn't
	})
}

function handleResponse(resolve, reject, response) {
	var statusCode = response.statusCode
	var location = response.headers.location

	if (statusCode == 200) {
		concat(response, function (err, buffer) {
			if (err) { reject(err) }
			else { resolve(buffer.toString()) }
		})
	} else if (statusCode >= 300 && statusCode < 400 && location === 'https://www.gocomics.com/') {
		reject(new Error('Comic no longer exists'))
	} else {
		reject(new Error(statusCode + ' error'))
	}
}
