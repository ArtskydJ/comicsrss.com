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

if (scrape) {
	console.log('scrape code is not yet implemented :(')
	process.exit(1)
}

if (generate) {

	var readComicObjects = require('./comic-objects-io.js').read
	var siteGenerator = require('./site-generator/index.js')
	var supporters = require('./tmp/supporters.json')

	var comicObjects = readComicObjects('gocomics')
	var moreComicObjects = [
		readComicObjects('dilbert')
	]
	comicObjects = comicObjects.concat(moreComicObjects).filter(Boolean)

	if (DEBUG) {
		comicObjects = comicObjects.slice(0, 3)
	}

	siteGenerator(comicObjects, supporters)
}
