module.exports = async url => {
	const res = await fetch(url)
	if (!res.ok) {
		throw new Error(res.statusText)
	}
	return res.text()
}
