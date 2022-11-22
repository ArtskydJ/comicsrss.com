#!/usr/bin/env node

const defaultScrapers = [
	// When two scrapers have the same comic, the higher scraper in this list will take priority
	'dilbert',
	'gocomics',
	'arcamax',
	'comicskingdom',
]
const expirationDays = 90
const expirationCount = 25

function migration([ id, seriesObject ]) {
	// seriesObject.strips = seriesObject.strips.filter(s => s.date !== null && s.date.slice(7) !== '2020-09') // bye bye all this month
	return [ id, seriesObject ]
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
		console.log('--help               Show this help text.')
		console.log('--debug              When enabled, this will cause the scrapers and generator to work on fewer files, so everything runs more quickly, but the site is only partially generated. Defaults to processing all files.')
		console.log('--verbose            When enabled, more information will be logged to the console. --debug implies --verbose.')
		console.log('--scrape             When enabled, it will scrape the websites, which updates the cached comic information.')
		console.log('--scrape=<scraper>   Only scrape the specified site.')
		console.log('--generate           Generate the static site from the cached comic information. --scrape or --generate must be enabled.')
		console.log('--migrate            Transform the cached comic objects from an old format to a new format.')
		console.log('--migrate=<scraper>  Only transform the specified temp file.')
		console.log('')
		console.log('The leading hyphens are optional.')
		console.log('Example: node bin debug scrape')
		process.exit(help ? 0 : 1)
	}

	let scraperNames = defaultScrapers

	if (migrate) {
		if (typeof migrate === 'string') {
			scraperNames = [ migrate ]
		}
		for (const scraperName of scraperNames) {
			const seriesObjects = readSeriesObjectsFile(scraperName)
			writeSeriesObjectsFile(scraperName, objMap(seriesObjects, migration))
			console.log(`Updated ${scraperName} tmp file`)
		}

		process.exit(0)
	}

	if (typeof scrape === 'string') {
		scraperNames = [ scrape ]
	}
	let scrapeErrors = []
	if (scrape) {
		const scrapeResults = await Promise.allSettled(scraperNames.map(runScraper))
		scrapeErrors = scrapeResults
			.filter(({ status }) => status === 'rejected')
			.map(({ reason }) => reason)


	}
	if (generate) {
		const siteGenerator = require('./site-generator/index.js')
		const supporters = require('./tmp/supporters.json')
		const seriesObjectsArr = mergeSeriesObjects(scraperNames)

		siteGenerator(seriesObjectsArr, supporters)
	}


	if (global.VERBOSE) {
		console.log(`Finished in ${(new Date() - startTime) / 1000} seconds`)
		console.log(`Scrape errors: ${scrapeErrors.length}`)
	}

	scrapeErrors.forEach(e => console.log(e))

	const exitCode = scrapeErrors.length === scraperNames.length ? 1 : 0 // this will exit non-zero if some scrapers worked
	process.exit(exitCode)
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
			.slice(0, expirationCount)
		return strips ? { ...newSeriesObject, strips } : null
	})

	writeSeriesObjectsFile(scraperName, verifiedSeriesObjects)
}


function mergeSeriesObjects(scraperNames) {
	const s = seriesObject => seriesObject.title.toLowerCase()
	const sortSeriesObjects = (a, b) => s(a) > s(b) ? 1 : (s(b) > s(a) ? -1 : 0)
	const normalizeBasename = basename => basename.toLowerCase().replace(/\W+/g, '')

	const seriesObjectsFileArr = scraperNames.map(scraperName => {
		const seriesObjectFile = readSeriesObjectsFile(scraperName)

		return objMap(seriesObjectFile, ([ basename, seriesObject ]) => [
			normalizeBasename(basename),
			{ ...seriesObject, basename, scraper: scraperName },
		])
	})

	// If gocomics and arcamax have the same comic (e.g. "agnes", or "1-and-done" aka "1anddone") then this clobbers one
	// seriesObjectsFileArr is reversed so earlier scraperNames take priority over later
	const flatSeriesCollection = Object.assign({}, ...seriesObjectsFileArr.reverse())
	// -> { "1anddone": {...}, "dilbert": {...}, etc }
	const seriesObjectsArr = Object.values(flatSeriesCollection).sort(sortSeriesObjects)

	return seriesObjectsArr
}

function objMap(obj, fn) {
	return Object.fromEntries(Object.entries(obj).map(([ key, val ]) => fn([ key, val ])))
}
function objMapValue(obj, fn) {
	return Object.fromEntries(Object.entries(obj).map(([ key, val ]) => [ key, fn(val) ]))
}
