var http = require('http')
var concat = require('simple-concat')

module.exports = function httpGet(url) {
	return new Promise(function (resolve, reject) {
		http.get(url, function (response) {
			concat(response, function (err, buf) {
				if (err) reject(err)
				else resolve(buf.toString())
			})
		})
	})
}
