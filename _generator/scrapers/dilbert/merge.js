function mergeComicStrips(oldComicStrips, newComicStrips) {
	var previousComicStrip = oldComicStrips[0]
	var addTheseComicStrips = []
	for (var i = 0; i < newComicStrips.length; i++) {
		var comicStrip = newComicStrips[i]
		if (comicStrip.date === previousComicStrip.date) {
			break
		}
		addTheseComicStrips.push(comicStrip)
	}
	return addTheseComicStrips.concat(oldComicStrips).slice(0, 25)
}

module.exports = mergeComicStrips
