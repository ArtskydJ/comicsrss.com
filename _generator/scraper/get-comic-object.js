var httpGet = require('./http-get.js')
var url = require('url')

module.exports = function getComicObject(overviewPageUrl, previousComicObject) {
	var comicStrips = []
	var previousComicStrips = []
	var previousUrl = null
	if (previousComicObject) {
		previousComicStrips = previousComicObject.comicStrips
		previousUrl = previousComicStrips[0].url
	}

	return getOverviewPage(overviewPageUrl)
		.then(getPage)
		.then(getPage)
		.then(getPage)
		.then(getPage)
		.then(getPage)
		.then(function () {
			if (!comicStrips.length) {
				return previousComicObject
			}
			comicStrips = comicStrips.concat(previousComicStrips)

			return {
				titleAndAuthor: comicStrips[0].titleAuthorDate.split(' for ')[0],
				basename: comicStrips[0].comicUrl.split('/')[3].trim(),
				author: comicStrips[0].author,
				comicUrl: comicStrips[0].comicUrl,
				headerImageUrl: comicStrips[0].headerImageUrl,
				comicStrips: comicStrips.map(function (comicStrip) {
					return {
						titleAuthorDate: comicStrip.titleAuthorDate,
						url: comicStrip.url,
						date: comicStrip.date,
						comicImageUrl: comicStrip.comicImageUrl
					}
				}).slice(0, 25)
			}
		})

	function getOverviewPage(overviewPageUrl) {
		return httpGet(overviewPageUrl)
		.then(getRelUrlFromOverviewPath)
		.then(function (relUrl) {
			return url.resolve(overviewPageUrl, relUrl)
		})
	}

	function getPage(pageUrl) {
		if (!pageUrl) return null
		if (previousUrl === pageUrl) {
			return null
		}

		return httpGet(pageUrl)
		.then(function (html) {
			var parsed = parseComicPage(pageUrl, html)
			if (previousUrl === parsed.url) {
				return null
			}
			comicStrips.push(parsed)
			if (!parsed.isFirstComic) return url.resolve(pageUrl, parsed.olderRelUrl)
		})
	}
}


function getRelUrlFromOverviewPath(html) {
	var comicsTabRelUrl = html.match(/<a class="nav-link" data-link="comics" href="([^">]+)">Comics<\/a>/)
	if (comicsTabRelUrl === null || !comicsTabRelUrl[1]) throw new Error('Unable to parse comicsTabRelUrl')
	return comicsTabRelUrl[1]
}

function parseComicPage(pageUrl, html) {
	var comicImageUrlMatches = html.match(/<meta property="og:image" content="([^">]+)"/)
	var titleAuthorDateMatches = html.match(/<meta property="og:title" content="([^">|]+)/)
	var dateMatches = html.match(/<meta property="article:published_time" content="([^">]+)"/)
	var authorMatches = html.match(/<meta property="article:author" content="([^">]+)"/)
	var urlMatches = html.match(/<input .*?name="link.+?" value="([^"]+)"/)
	var isFirstComic = /<a.+class=["'][^"']*fa-caret-left[^"']*disabled/.test(html)
	var olderRelUrlMatches = html.match(/<a.+href=["'](.*?)["'] class=["'][^"']*fa-caret-left/)
	var newerRelUrlMatches = html.match(/<a.+href=["'](.*?)["'] class=["'][^"']*fa-caret-right/)
	var headerImageUrlMatches = html.match(/src="(http:\/\/avatar\.amuniversal\.com\/.+?)"/) || []

	if (comicImageUrlMatches === null || !comicImageUrlMatches[1]) throw new Error('Unable to parse comicImageUrl in ' + pageUrl)
	if (titleAuthorDateMatches === null || !titleAuthorDateMatches[1]) throw new Error('Unable to parse title, author, date in ' + pageUrl)
	if (dateMatches === null || !dateMatches[1]) throw new Error('Unable to parse date in ' + pageUrl)
	if (authorMatches === null || !authorMatches[1]) throw new Error('Unable to parse author in ' + pageUrl)
	if (urlMatches === null || !urlMatches[1]) throw new Error('Unable to parse url in ' + pageUrl)
	if (olderRelUrlMatches === null || (!olderRelUrlMatches[1] && !isFirstComic)) throw new Error('Unable to parse olderRelUrl in ' + pageUrl)
	if (newerRelUrlMatches === null) throw new Error('Unable to parse newerRelUrl in ' + pageUrl)

	return {
		comicUrl: pageUrl,
		comicImageUrl: comicImageUrlMatches[1],
		titleAuthorDate: titleAuthorDateMatches[1],
		date: dateMatches[1],
		author: authorMatches[1],
		url: urlMatches[1],
		isFirstComic: isFirstComic,
		olderRelUrl: olderRelUrlMatches[1],
		// newerRelUrl: newerRelUrlMatches[1],
		headerImageUrl: headerImageUrlMatches[1]
	}
}
