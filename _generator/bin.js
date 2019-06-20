#!/usr/bin/env node

global.DEBUG = false
var help = false
var scrape = false
var generate = false
var exitCode = 0

process.argv.slice(2).forEach(function (argument) {
	if (argument === '--help') help = true
	else if (argument === '--debug') DEBUG = true
	else if (argument === '--scrape') scrape = true
	else if (argument === '--generate') generate = true
	else {
		console.error(`ERROR: unexpected argument "${argument}"\r\n`)
		exitCode = 1
		help = true
	}
})

if (!help && !scrape && !generate) {
	console.error('ERROR: You must enable the --scrape flag and/or the --generate flag.\r\n')
	exitCode = 1
	help = true
}

if (help) {
	console.log(`
Comics RSS usage:
node bin.js --help
node bin.js [--debug] { --scrape | --generate | --scrape --generate }
--help      Show this help text
--debug     When enabled, this will cause the scrapers and generator to work on
            fewer files, so everything runs more quickly, but the site is only
            partially generated. Defaults to processing all files.
--scrape    Whether or not to scrape the websites. Scraping updates the cached
            comic information. Defaults to false.
--generate  Generate the static site from the cached comic information.
`.trim())
	return process.exit(exitCode)
}

var fs = require('fs')
var scrapers = fs.readdirSync('./scrapers')
var comicObjectsIO = require('./comic-objects-io.js')

if (scrape) {
	scrapers.forEach(function (scraper) {
		var comicObjects = comicObjectsIO.read(scraper)
		require(`./scrapers/${scraper}/index.js`, function (comicObjects) {
			comicObjectsIO.write(comicObjects)
		}) // This will write the tmp comic objects files
	})
}

// I NEED TO IMPLEMENT ASYNC HANDLING OF SCRAPERS...
// p-map-series might do the trick

if (generate) {
	var siteGenerator = require('./site-generator/index.js')
	var supporters = require('./tmp/supporters.json')

	var comicObjects = []
	scrapers.forEach(function (scraper) {
		var moreComicObjects = comicObjectsIO.read(scraper).filter(Boolean)
		comicObjects = comicObjects.concat(moreComicObjects)
	})
	if (DEBUG) {
		comicObjects = comicObjects.slice(0, 3)
	}

	siteGenerator(comicObjects, supporters)
}
