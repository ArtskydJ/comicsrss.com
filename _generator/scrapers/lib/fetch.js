module.exports = async url => {
	if (global.VERBOSE) {
		console.log('fetching ' + url)
	}
	const res = await fetch(url)
	if (!res.ok) {
		throw new Error(res.status + ' ' + res.statusText + ' (' + url + ')')
	}
	return res.text()
}
