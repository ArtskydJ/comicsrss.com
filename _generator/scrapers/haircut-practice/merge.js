module.exports = function mergeStrips(cachedStrips, newStrips) {
	const mostRecentStrip = cachedStrips[0]
	const addTheseStrips = []
	for (var i = 0; i < newStrips.length; i++) {
		const strip = newStrips[i]
		if (strip.date === mostRecentStrip.date) {
			break
		}
		addTheseStrips.push(strip)
	}
	return addTheseStrips.concat(cachedStrips)
}
