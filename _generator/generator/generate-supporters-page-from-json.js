var fs = require('fs')
var path = require('path')

var supportersTemplateHtmlPath = path.resolve(__dirname, 'template', 'supporters-template.html')
var supportersTemplateHtml = fs.readFileSync(supportersTemplateHtmlPath, 'utf-8')

module.exports = function generateSupportersPage(supporters) {
	var supportersHtml = `
	<div class="supporters">
		<div class="gold-supporters">${generateSupportersHtml(supporters.gold, 'Gold', '2790040')}</div>
		<div class="silver-supporters">${generateSupportersHtml(supporters.silver, 'Silver', '2790035')}</div>
		<div class="bronze-supporters">${generateSupportersHtml(supporters.bronze, 'Bronze', '2275262')}</div>
	</div>
	`.trim()
	var todaysDate = new Date().toDateString()
	return supportersTemplateHtml
		.replace('<!-- SUPPORTERS -->', supportersHtml)
		.replace('<!-- DATE GENERATED -->', todaysDate)
}

function generateSupportersHtml(supporters, level, rid) {
	return	`<h2>${level} Supporters</h2>` +
	supporters.map(function (supporter) {
		return '<div class="supporter">'+
			(supporter.url ? `<a href="${supporter.url}">` : '') +
			`<span class="supporter-name">${supporter.displayName}</span>` +
			(supporter.url ? `</a>` : '') +
			(supporter.description ? `<span class="supporter-name">${supporter.description}</span>` : '') +
			'</div>'
		.trim()
	}) + 
	`<a href="https://www.patreon.com/join/josephdykstra/checkout?rid=${rid}">
		${supporters.length ? 'Also become a '+level+' supporter' : 'Be the first '+level+' supporter'}
	</a>`
}
