/*
WIP

add these to package.json deps
"css-select": "^2.1.0",
"htmlparser2": "^4.1.0",
*/

const cssSelect = require('css-select')
const { parseDOM } = require('htmlparser2')

function text(ele) {
    return ele.children[0].data
}

function queryHtml(html, selectors) {
    const dom = parseDOM(html)
    return Object.keys(selectors).reduce(function r(result, name) {
        result[name] = cssSelect.selectAll(selectors[name], dom).map(text)
        return result
    }, {})
}

function queryHtml2(html) {
    const dom = parseDOM(html)
    return function qhs(selector) {
        return cssSelect.selectAll(selector, dom).map(text)
    }
}

const html = '<!DOCTYPE html><html><head><title>Joseph</title></head><body><h1>Boom</h1><ul><li>One</li><li class="wow">Two</li></ul></body></html>'

console.log(queryHtml(html, {
    title: 'title',
    item: 'li',
    wow: '.wow',
}))
const $ = queryHtml2(html)
console.log({
    title: $('title'),
    item: $('li'),
    wow: $('.wow'),
})




/*
const assert = require('assert')

const [ dom ] = parseDOM('<div id=foo><p>foo</p></div>')

// can be queried by function
// in `is`
assert(cssSelect.is(dom, elem => elem.attribs.id === 'foo'))

// probably more cases should be added here


// selectAll
// should query array elements directly when they have no parents
const divs = [ dom ]
assert.deepEqual(cssSelect.selectAll('div', divs), divs)

// should query array elements directly when they have parents
const ps = cssSelect.selectAll('p', [ dom ])
assert.deepEqual(cssSelect.selectAll('p', ps), ps)


// should strip quotes
let matches = cssSelect.selectAll(':matches(\'p, div\')', [ dom ])
assert.equal(matches.length, 2)
matches = cssSelect.selectAll(':matches("p, div")', [ dom ])
assert.equal(matches.length, 2)



// parent selector (<)
// should select the right element
matches = cssSelect.selectAll('p < div', [ dom ])
assert.equal(matches.length, 1)
assert.equal(matches[0], dom)

// should not select nodes without children
matches = cssSelect.selectAll('p < div', [ dom ])
assert.deepEqual(matches, cssSelect.selectAll('* < *', [ dom ]))



// selectOne
// should select elements in traversal order
let match = cssSelect.selectOne('p', [ dom ])
assert.equal(match, dom.children[0])
match = cssSelect.selectOne(':contains(foo)', [ dom ])
assert.equal(match, dom)


// should recognize contexts
const div = cssSelect.selectAll('div', [ dom ])
const p = cssSelect.selectAll('p', [ dom ])

assert.equal(
    cssSelect.selectOne('div', div, { context: div }),
    div[0]
)
assert.equal(cssSelect.selectOne('div', div, { context: p }), null)
assert.deepEqual(
    cssSelect.selectAll('p', div, { context: div }),
    p
)
*/
