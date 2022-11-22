module.exports = async url => {
	const res = await fetch(url)
	return res.text()
}
