#!/usr/bin/env node

const pMapSeries = require('p-map-series')
const fs = require('fs')
const path = require('path')
const jsonStableStringify = require('json-stable-stringify')


const startTime = new Date()
const expirationDays = 90
const expirationDate = new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * expirationDays)
const cliOpts = parseCliOptions(process.argv.slice(2))
global.DEBUG = cliOpts.debug || false
global.VERBOSE = cliOpts.verbose || global.DEBUG
const help = cliOpts.help
const scrape = cliOpts.scrape
const generate = cliOpts.generate

if (cliOpts.transform) {
	var transform = function (scraperName) {
		// var seriesObjects = readSeriesObjectsFile(scraperName)
		// var seriesObjects2 = Object.keys(seriesObjects).reduce(function (memo, id) {
		// 	memo[id] = seriesObjects[id]

		// 	return memo
		// }, {})
		// writeSeriesObjectsFile(scraperName, seriesObjects)
		// console.log(`Updated ${scraperName} tmp file`)
	}

	transform('dilbert')
	transform('gocomics')

	process.exit(0)
}


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

var promise = Promise.resolve()
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

function readSeriesObjectsFile(scraperName) {
	const filePath = getSeriesObjectsPath(scraperName)
	const json = fs.readFileSync(filePath, 'utf-8')
	return JSON.parse(json)
}

function writeSeriesObjectsFile(scraperName, contents) {
	const filePath = getSeriesObjectsPath(scraperName)
	const json = jsonStableStringify(contents, { space: '\t' })
	fs.writeFileSync(filePath, json, 'utf-8')
}

function getSeriesObjectsPath(scraperName) {
	return path.resolve(__dirname, 'tmp', `_${scraperName}-comic-objects.json`)
}

function runScraper(scraperName) {
	if (global.VERBOSE) console.log('Scraping ' + scraperName)
	const thisScraper = require(`./scrapers/${scraperName}/index.js`)
	const cachedSeriesObjects = readSeriesObjectsFile(scraperName)
	return thisScraper(cachedSeriesObjects).then(newSeriesObjects => {
		if (Array.isArray(newSeriesObjects)) {
			throw new Error('Did not expect resulting seriesObjects variable to be an array.')
		}

		const verifiedSeriesObjects = Object.keys(newSeriesObjects)
			.reduce(function (memo, id) {
				const { title, author, url, imageUrl, isPolitical, language, strips } = newSeriesObjects[id]
				memo[id] = {
					title,
					author,
					url,
					imageUrl,
					isPolitical,
					language,
					strips: strips
						.map(strip => {
							const { url, date, imageUrl } = strip
							return {
								url,
								date,
								imageUrl
							}
						})
						.filter((strip, i) => (i === 0 || new Date(strip.date) > expirationDate)) // keeps recent strips
						.slice(0, 25)
				}
				return memo
			}, {})

		writeSeriesObjectsFile(scraperName, verifiedSeriesObjects)
	})
}

function runGenerator() {
	const siteGenerator = require('./site-generator/index.js')
	const supporters = require('./tmp/supporters.json')

	var seriesObjects = SCRAPER_NAMES.reduce(function (memo, scraperName) {
		const moreSeriesObjects = readSeriesObjectsFile(scraperName)
		return Object.assign(memo, moreSeriesObjects)
	}, {})

	siteGenerator(seriesObjects, supporters)

	if (global.VERBOSE) {
		const seconds = (new Date() - startTime) / 1000
		console.log(`Finished in ${seconds} seconds`)
	}
}
