const cssSelect = require('css-select')
const { parseDOM } = require('htmlparser2')

function element_to_text(ele) {
	return ele.children.map(child => child.data || (child.children ? element_to_text(child) : '')).join('')
}

function query_html(html) {
	const dom = parseDOM(html)
	return function $(selector, subdom) {
		return cssSelect.selectAll(selector, subdom || dom)
	}
}

module.exports = {
	element_to_text,
	query_html,
}
