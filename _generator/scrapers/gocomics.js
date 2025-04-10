const fetch2 = require('./lib/fetch.js')
const { query_html } = require('./lib/query-html.js')

const rate_limit = global.DEBUG ? 0 : 900 // 800 might work, 700 doesn't

async function get_recent_strip_dates(slug) {
	const str_to_day = iso => iso.slice(0, 10)
	const fmt = date => str_to_day(date.toISOString())

	const start_date = new Date()
	start_date.setDate(start_date.getDate() - 15) // 15 days ago

	const end_date = new Date()

	const api_url = `https://www.gocomics.com/api/service/v2/assets/feature-runs/${ slug }?dateAfter=${ fmt(start_date) }&dateBefore=${ fmt(end_date) }`
	const list_of_recent_strip_dates = JSON.parse(await fetch2(api_url)).dates.map(str_to_day)

	return list_of_recent_strip_dates
}

function pretty_date(date) {
	const [ year, month, day ] = date.split('-')
	const pretty_month = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ][Number(month) - 1]
	return `${ pretty_month } ${ day.replace(/^0/, '') }, ${ year }`
}

async function parse_list_html(base, path, is_political) {
	const html = await fetch2(base + path)

	const tagless_scripts = html.split('<script>').slice(1).map(html_part => html_part.split('</script>')[0])
	const item_list_script = tagless_scripts.find(script => script.includes('featureLanguage'))
	const array_that_gets_pushed = JSON.parse(item_list_script.match(/\.push\((.+)\)/)[1]) // [ 1, '32:[ ... ]' ]
	const improve_this_var_name = JSON.parse(array_that_gets_pushed[1].replace(/^\d+:/, '')) // [ [ '$', 'script', null, { dangerouslySetInnerHTML: { ... }, ... } ], [ '$', 'section', null, { className: '...', children: [ ... ]} ] ]
	const { /* categories, */ groupedFeatures } = improve_this_var_name[1][3].children[0][3]

	const item_list = groupedFeatures.flatMap(group => group.items)

	const series_object_entries = item_list
		.filter(item => !global.DEBUG || item.slug === 'calvinandhobbes')
		.map(item => {
			const is_spanish = item.categories.some(cat => cat.categorySlug === 'comicos-en-espanol')

			return [item.slug, {
				title: item.name,
				url: `${ base }/${ item.slug }`,
				language: is_spanish ? 'spa' : 'eng',
				author: item.creators.join(' and '),
				imageUrl: item.badgeImage.url,
				isPolitical: is_political,
			}]
		})

	return series_object_entries
}

module.exports = async function main(cached_series_objects) {
	const base = 'https://www.gocomics.com'
	const series_object_entries = [
		...(await parse_list_html(base, '/political-cartoons/political-a-to-z', true)),
		...(await parse_list_html(base, '/comics/a-to-z', false)),
	]

	if (global.VERBOSE) {
		console.log(`gocomics: found ${ series_object_entries.length } entries`)
	}

	for (const [ slug, series_object ] of series_object_entries) {
		await new Promise(resolve => setTimeout(resolve, rate_limit))

		if (global.VERBOSE) {
			console.log('gocomics: ' + slug)
		}
		const list_of_recent_strip_dates = await get_recent_strip_dates(slug)

		const most_recent_cached_strip_date = cached_series_objects[slug]?.strips[0]?.date || '0000-00-00'

		const new_strip_dates = list_of_recent_strip_dates.filter(date => date > most_recent_cached_strip_date).reverse()

		if (global.VERBOSE) {
			console.log(`gocomics: ${ slug }: ${ new_strip_dates.length } new strips: ${ new_strip_dates.join(', ') }`)
		}

		let new_strips = []
		for (const date of new_strip_dates) {
			await new Promise(resolve => setTimeout(resolve, rate_limit))

			const page_url = `${ base }/${ slug }/${ date.replace(/-/g, '/') }`
			const html = await fetch2(page_url)
			const $ = query_html(html)

			const json_scripts = $('script[type="application/ld+json"]')
				.map(script_element => JSON.parse(script_element.children[0].data))
			const match_date = pretty_date(date)
			const image_json = json_scripts.find(json => json['@type'] === 'ImageObject' && typeof json.name === 'string' && json.name.endsWith(match_date))

			if (!image_json) {
				throw new Error(`gocomics: ${ slug }: ${ date }: image_json not found`)
			}

			new_strips.push({
				imageUrl: image_json.contentUrl, // or image_json.url... they seem to be the same
				date,
				url: page_url,
			})
		}

		series_object.strips = [
			...new_strips,
			...(cached_series_objects[slug]?.strips || []),
		]
	}

	return Object.fromEntries(series_object_entries)
}
