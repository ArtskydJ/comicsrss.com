// module.exports = function httpGet(url) {
// 	const fs = require('fs').promises
// 	const filepath = (url === 'https://www.arcamax.com/comics.html')
// 		? __dirname + '/wip/https_www_arcamax_com_comics.html'
// 		: __dirname + '/wip/https_www_arcamax_com_thefunnies_garfield.html'
// 	return fs.readFile(filepath, { encoding: 'utf-8' })
// }


const https = require('https')

module.exports = function httpGet(url) {
	return new Promise(function (resolve, reject) {
		https.get(url, function handleResponse(response) {
			const statusCode = response.statusCode

			if (statusCode != 200) {
				reject(new Error(statusCode + ' error'))
			}

			const chunks = []
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
