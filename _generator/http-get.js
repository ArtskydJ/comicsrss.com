var http = require('http')
var concat = require('simple-concat')

module.exports = function httpGet(url) {
	return new Promise(function (resolve, reject) {
		setTimeout(function () { // Rate limiting, haha
			http.get(url, function (response) {
				if (response.statusCode >= 400) {
					return reject(new Error(response.statusCode + ' error'))
				} else if (response.statusCode >= 300) {
					return reject(new Error('comic no longer exists'))
				}
				concat(response, function (err, buf) {
					if (err) return reject(err)
					resolve(buf.toString())
				})
			})
		}, 800)
	})
}
