#!/usr/bin/env node

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
const migrate = cliOpts.migrate

let scraperNames
main()

async function main() {
	if (help || (! scrape && ! generate)) {
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

	scraperNames = fs.readdirSync(path.resolve(__dirname, 'scrapers'))
		.filter(scraperName => ! scraperName.startsWith('wip-'))
		.filter(scraperName => scraperName !== 'arcamax') // TODO enable arcamax
		.filter(scraperName => ! scraperName.endsWith('.js'))
	if (typeof scrape === 'string') {
		scraperNames = [ scrape ]
	}

	if (migrate) {
		// CHANGE THE CODE BELOW TO CREATE A MIGRATION
		const transform = function([ id, seriesObject ]) {
			return id, seriesObject
		}
		// CHANGE THE CODE ABOVE TO CREATE A MIGRATION

		scraperNames.forEach(function migrate(scraperName) {
			const seriesObjects = readSeriesObjectsFile(scraperName)
			const seriesObjects2 = Object.fromEntries(Object.entries(seriesObjects).map(transform))
			writeSeriesObjectsFile(scraperName, seriesObjects2)
			console.log(`Updated ${scraperName} tmp file`)
		})

		process.exit(0)
	}

	if (scrape) {
		await Promise.all(scraperNames.map(runScraper))
	}
	if (generate) {
		runGenerator()
	}

	if (global.VERBOSE) console.log('Completed')
	process.exit(0)
}


function parseCliOptions(args) {
	return args.reduce((memo, arg) => {
		const [ key, value ] = arg.replace(/^--/, '').toLowerCase().split('=', 2)
		memo[ key ] = value || true
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
	return path.resolve(__dirname, 'tmp', `${scraperName}-series-objects.json`)
}

async function runScraper(scraperName) {
	if (global.VERBOSE) console.log('Scraping ' + scraperName)
	const cachedSeriesObjects = readSeriesObjectsFile(scraperName)
	const masterScraper = require('./scrapers/master-scraper.js')
	const newSeriesObjects = await masterScraper(scraperName, cachedSeriesObjects)
	if (Array.isArray(newSeriesObjects)) {
		throw new Error('Did not expect resulting seriesObjects variable to be an array.')
	}

	const verifiedSeriesObjects = objMapValue(newSeriesObjects, newSeriesObject => {
		const strips = newSeriesObject.strips
			.map(({ url, date, imageUrl }) => ({ url, date, imageUrl }))
			.filter((strip, i) => (i === 0 || new Date(strip.date) > expirationDate)) // keeps recent strips
			.slice(0, 25)
		return Object.assign({}, newSeriesObject, { strips })
	})

	writeSeriesObjectsFile(scraperName, verifiedSeriesObjects)
}


function runGenerator() {
	const siteGenerator = require('./site-generator/index.js')
	const supporters = require('./tmp/supporters.json')

	const seriesObjects = scraperNames.reduce((memo, scraperName) => {
		const moreSeriesObjects = readSeriesObjectsFile(scraperName)
		return Object.assign(memo, moreSeriesObjects)
	}, {})

	siteGenerator(seriesObjects, supporters)

	if (global.VERBOSE) {
		const seconds = (new Date() - startTime) / 1000
		console.log(`Finished in ${seconds} seconds`)
	}
}

function objMapValue(obj, fn) {
	return Object.fromEntries(Object.entries(obj).map(([ key, val ]) => [ key, fn(val) ]))
}
