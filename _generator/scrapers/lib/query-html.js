const cssSelect = require('css-select')
const { parseDOM } = require('htmlparser2')

function element_to_text(ele) {
    return ele.children[0].data
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
