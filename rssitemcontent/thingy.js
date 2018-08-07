var fs = require('fs')
var base = 16

var files = fs.readdirSync('../fixfeedlyscraper/')
// fs.writeFileSync('../ffs.json', JSON.stringify(files))

for (var i = 0; i < Math.pow(base, 3); i++) {
	var prefix = ('000' + i.toString(base)).slice(-3)
	if (fs.readdirSync(prefix).length === 0) {
		console.log(prefix)
	}
}


// files.forEach(function(file) {
// 	var from = '../fixfeedlyscraper/' + file
// 	var to = file.slice(0, 3) + '/' + file
// 	if (file.slice(0, 3) === 'con') {
// 		to = file
// 	}
// 	fs.renameSync(from, to)
// })

//for (var i = 0; i < Math.pow(base, 3); i++) {
//	var prefix = ('000' + i.toString(base)).slice(-3)
//	// fs.mkdirSync(prefix)
//}
