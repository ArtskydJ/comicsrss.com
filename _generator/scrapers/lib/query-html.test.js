const assert = require('assert')
const { query_html, element_to_text } = require('./query-html.js')

const html = `
<!DOCTYPE html>
<html>
<head><title>Joseph</title></head>
<body>
	<h1 hmm="&quot;one&amp;two&quot;">Boom</h1>
	<ul>
		<li>One</li>
		<li class="wow">Two</li>
	</ul>
</body>
</html>
`
const $ = query_html(html)

assert($('title').map(element_to_text).join(`,`) === `Joseph`)
assert($('li').map(element_to_text).join(`,`) === `One,Two`)
assert($('.wow').map(element_to_text).join(`,`) === `Two`)
assert($('h1,li').map(element_to_text).join(`,`) === `Boom,One,Two`)

assert($('title,h1').length === 2)
const elements_to_query_next = $('body')
assert($('title,h1', elements_to_query_next).length === 1)

assert(JSON.stringify($('h1')[0].attribs) === `{"hmm":"\\"one&two\\""}`)

$('li').forEach(element => {
	assert(element.parent.name === `ul`)
	assert(element.name === `li`)
	assert(element.children.length === 1)
})

console.log(`tests passed`)
