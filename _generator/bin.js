#!/usr/bin/env node

const defaultScrapers = [
	'dilbert',
	'gocomics',
	'arcamax', // TODO enable arcamax
	// 'comicskingdom'
]
const expirationDays = 90

function migration([ id, seriesObject ]) {
	const strips = seriesObject.strips.map(strip => {
		const imageUrl = strip.imageUrl[0] === '/' ? 'https://www.arcamax.com' + strip.imageUrl : strip.imageUrl
		return { ...strip, imageUrl }
	})
	return [ id, { ...seriesObject, strips }]
	//return [ id, seriesObject ]
}


const fs = require('fs')
const path = require('path')
const jsonStableStringify = require('json-stable-stringify')

main(parseCliOptions(process.argv.slice(2)))

async function main(options) {
	const startTime = new Date()
	const { debug, verbose, help, scrape, generate, migrate } = options
	global.DEBUG = debug || false
	global.VERBOSE = verbose || global.DEBUG

	if (help || (! scrape && ! generate && ! migrate)) {
		if (! help) console.error('ERROR: You must enable scrape and/or generate.\r\n')
		console.log('node bin OPTIONS')
		console.log('--help             Show this help text.')
		console.log('--debug            When enabled, this will cause the scrapers and generator to work on fewer files, so everything runs more quickly, but the site is only partially generated. Defaults to processing all files.')
		console.log('--verbose          When enabled, more information will be logged to the console. --debug implies --verbose.')
		console.log('--scrape           When enabled, it will scrape the websites, which updates the cached comic information.')
		console.log('--scrape=<scraper> Only scrape the specified site.')
		console.log('--generate         Generate the static site from the cached comic information. --scrape or --generate must be enabled.')
		console.log('--migrate          Transform the cached comic objects from an old format to a new format.')
		console.log('')
		console.log('The leading hyphens are optional.')
		console.log('Example: node bin debug scrape')
		process.exit(help ? 0 : 1)
	}

	let scraperNames = defaultScrapers
	if (typeof scrape === 'string') {
		scraperNames = [ scrape ]
	}

	if (migrate) {
		for (const scraperName of scraperNames) {
			const seriesObjects = readSeriesObjectsFile(scraperName)
			writeSeriesObjectsFile(scraperName, objMap(seriesObjects, migration))
			console.log(`Updated ${scraperName} tmp file`)
		}

		process.exit(0)
	}

	if (scrape) {
		await Promise.all(scraperNames.map(runScraper))
	}
	if (generate) {
		runGenerator(scraperNames)
	}


	if (global.VERBOSE) {
		console.log(`Finished in ${(new Date() - startTime) / 1000} seconds`)
	}
	process.exit(0)
}


function parseCliOptions(args) {
	return Object.fromEntries(args
		.map(arg => arg.replace(/^--/, '').toLowerCase().split('=', 2))
		.map(([ key, value = true ]) => [ key, value ]))
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
	return path.resolve(__dirname, 'tmp', `${scraperName}-series-objects.json`)
}

async function runScraper(scraperName) {
	if (global.VERBOSE) console.log('Scraping ' + scraperName)
	const cachedSeriesObjects = readSeriesObjectsFile(scraperName)
	const scraper = require(`./scrapers/${scraperName}.js`)
	const newSeriesObjects = await scraper(cachedSeriesObjects)
	if (Array.isArray(newSeriesObjects)) {
		throw new Error('Did not expect resulting seriesObjects variable to be an array.')
	}
	const expirationDate = new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * expirationDays)

	const verifiedSeriesObjects = objMapValue(newSeriesObjects, newSeriesObject => {
		const strips = newSeriesObject.strips
			.map(({ url, date, imageUrl }) => ({ url, date, imageUrl }))
			.filter((strip, i) => (i === 0 || new Date(strip.date) > expirationDate)) // keeps recent strips
			.slice(0, 25)
		return { ...newSeriesObject, strips }
	})

	writeSeriesObjectsFile(scraperName, verifiedSeriesObjects)
}


function runGenerator(scraperNames) {
	const siteGenerator = require('./site-generator/index.js')
	const supporters = require('./tmp/supporters.json')
	const s = seriesObject => seriesObject.title.toLowerCase()
	const sortSeriesObjects = (a, b) => s(a) > s(b) ? 1 : (s(b) > s(a) ? -1 : 0)
	const normalizeBasename = basename => basename.replace(/\W+/g, '')
	const normalizeSeriesObject = ([ basename, seriesObject ]) => [ normalizeBasename(basename), { ...seriesObject, basename }]

	const flatSeriesCollection = Object.assign({}, ...(scraperNames.map(readSeriesObjectsFile).reverse()))
	const mergedNormalizedSeriesObjects = objMap(flatSeriesCollection, normalizeSeriesObject)
	const seriesObjectsArr = Object.values(mergedNormalizedSeriesObjects).sort(sortSeriesObjects)

	siteGenerator(seriesObjectsArr, supporters)
}

function objMap(obj, fn) {
	return Object.fromEntries(Object.entries(obj).map(([ key, val ]) => fn([ key, val ])))
}
function objMapValue(obj, fn) {
	return Object.fromEntries(Object.entries(obj).map(([ key, val ]) => [ key, fn(val) ]))
}
