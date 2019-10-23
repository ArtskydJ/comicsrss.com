function mergeComicStrips(oldComicStrips, newComicStrips) {
	const previousComicStrip = oldComicStrips[0]
	const addTheseComicStrips = []
	for (var i = 0; i < newComicStrips.length; i++) {
		const comicStrip = newComicStrips[i]
		if (comicStrip.date === previousComicStrip.date) {
			break
		}
		addTheseComicStrips.push(comicStrip)
	}
	return addTheseComicStrips.concat(oldComicStrips).slice(0, 25)
}

module.exports = mergeComicStrips
