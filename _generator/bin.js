#!/usr/bin/env node

const pMapSeries = require('p-map-series')
const fs = require('fs')
const path = require('path')


const startTime = new Date()
const cliOpts = parseCliOptions(process.argv.slice(2))
global.DEBUG = cliOpts.debug || false
global.VERBOSE = cliOpts.verbose || global.DEBUG
const help = cliOpts.help
const scrape = cliOpts.scrape
const generate = cliOpts.generate


if (! scrape && ! generate) {
	if (! help) console.error('ERROR: You must enable scrape and/or generate.\r\n')
	console.log('Comics RSS usage:')
	console.log('node bin [ debug | verbose ] { scrape | generate | scrape generate }')
	console.log('debug     When enabled, this will cause the scrapers and generator to work on')
	console.log('          fewer files, so everything runs more quickly, but the site is only')
	console.log('          partially generated. Defaults to processing all files.')
	console.log('verbose   When enabled, more information will be logged to the console.')
	console.log('scrape    Whether or not to scrape the websites. Scraping updates the cached')
	console.log('          comic information. Defaults to false.')
	console.log('generate  Generate the static site from the cached comic information.')
	console.log('Example: node bin debug scrape')
	process.exit(help ? 0 : 1)
}

const SCRAPER_NAMES = fs.readdirSync(path.resolve(__dirname, 'scrapers'))

let promise = Promise.resolve()
if (scrape)   promise = promise.then(() => pMapSeries(SCRAPER_NAMES, runScraper))
if (generate) promise = promise.then(runGenerator)

promise.then(()=>{
	if (global.VERBOSE) console.log('Completed')
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
	const json = fs.readFileSync(getComicObjectsPath(scraperName), 'utf-8')
	return JSON.parse(json)
}

function writeComicObjectFile(scraperName, contents) {
	const json = JSON.stringify(contents, null, '\t')
	fs.writeFileSync(getComicObjectsPath(scraperName), json, 'utf-8')
}

function getComicObjectsPath(scraperName) {
	return path.resolve(__dirname, 'tmp', `_${scraperName}-comic-objects.json`)
}

function runScraper(scraperName) {
	if (global.VERBOSE) console.log('Scraping ' + scraperName)
	const thisScraper = require(`./scrapers/${scraperName}/index.js`)
	const inComicObjects = readComicObjectFile(scraperName)
	return thisScraper(inComicObjects).then(outComicObjects => {
		if (!Array.isArray(outComicObjects)) {
			throw new Error('Expected resulting comicObjects variable to be an array.')
		}
		writeComicObjectFile(scraperName, outComicObjects)
	})
}

function runGenerator() {
	const siteGenerator = require('./site-generator/index.js')
	const supporters = require('./tmp/supporters.json')

	let comicObjects = SCRAPER_NAMES.reduce(function (memo, scraperName) {
		const moreComicObjects = readComicObjectFile(scraperName).filter(Boolean)
		return memo.concat(moreComicObjects)
	}, [])

	if (global.DEBUG) {
		comicObjects = comicObjects.slice(0, 10)
	}

	siteGenerator(comicObjects, supporters)

	if (global.VERBOSE) {
		const seconds = (new Date() - startTime) / 1000
		console.log(`Finished in ${seconds} seconds`)
	}
}
