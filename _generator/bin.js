#!/usr/bin/env node

var pMapSeries = require('p-map-series')
var fs = require('fs')
var path = require('path')


var cliOpts = parseCliOptions(process.argv.slice(2))
global.DEBUG = cliOpts.debug || false
var help = cliOpts.help
var scrape = cliOpts.scrape
var generate = cliOpts.generate


if (! scrape && ! generate) {
	if (! help) console.error('ERROR: You must enable scrape and/or generate.\r\n')
	console.log('Comics RSS usage:')
	console.log('node bin [ debug ] { scrape | generate | scrape generate }')
	console.log('debug     When enabled, this will cause the scrapers and generator to work on')
	console.log('          fewer files, so everything runs more quickly, but the site is only')
	console.log('          partially generated. Defaults to processing all files.')
	console.log('scrape    Whether or not to scrape the websites. Scraping updates the cached')
	console.log('          comic information. Defaults to false.')
	console.log('generate  Generate the static site from the cached comic information.')
	console.log('Example: node bin debug scrape')
	process.exit(help ? 0 : 1)
}

const SCRAPER_NAMES = fs.readdirSync(path.resolve(__dirname, 'scrapers'))

var promise = Promise.resolve()
if (scrape)   promise = promise.then(() => pMapSeries(SCRAPER_NAMES, runScraper))
if (generate) promise = promise.then(runGenerator)

promise.then(()=>{
	if (global.DEBUG) console.log('Completed')
	process.exit(0)
})
.catch(function (err) {
	console.error(err)
	process.exit(1)
})


function parseCliOptions(args) {
	return args.reduce((memo, arg) => {
		memo[arg.replace(/^--/, '')] = true
		return memo
	}, {})
}

function readComicObjectFile(scraperName) {
	var json = fs.readFileSync(getComicObjectsPath(scraperName), 'utf-8')
	return JSON.parse(json)
}

function writeComicObjectFile(scraperName, contents) {
	var json = JSON.stringify(contents, null, '\t')
	fs.writeFileSync(getComicObjectsPath(scraperName), json, 'utf-8')
}

function getComicObjectsPath(scraperName) {
	return path.resolve(__dirname, 'tmp', `_${scraperName}-comic-objects.json`)
}

function runScraper(scraperName) {
	if (global.DEBUG) console.log('Scraping ' + scraperName)
	var thisScraper = require(`./scrapers/${scraperName}/index.js`)
	var inComicObjects = readComicObjectFile(scraperName)
	return thisScraper(inComicObjects).then(outComicObjects => {
		if (!Array.isArray(outComicObjects)) {
			throw new Error('Expected resulting comicObjects variable to be an array.')
		}
		writeComicObjectFile(scraperName, outComicObjects)
	})
}

function runGenerator() {
	var siteGenerator = require('./site-generator/index.js')
	var supporters = require('./tmp/supporters.json')

	var comicObjects = SCRAPER_NAMES.reduce(function (memo, scraperName) {
		var moreComicObjects = readComicObjectFile(scraperName).filter(Boolean)
		return memo.concat(moreComicObjects)
	}, [])

	if (global.DEBUG) {
		comicObjects = comicObjects.slice(0, 10)
	}

	siteGenerator(comicObjects, supporters)
}
