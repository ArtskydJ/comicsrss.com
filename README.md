# comicsrss.com

Source code for the site generator and rss feed generator for [comicsrss.com](https://www.comicsrss.com)



## Support Me

If you'd like to help keep this site going, you can send me a few bucks using [Patreon](https://www.patreon.com/bePatron?u=6855838). I'd really appreciate it!



## Technical Details

I have received [many requests](https://github.com/ArtskydJ/comicsrss.com/issues/86) to add more comic strips to the site. However, my time is limited. So if you want to help out, you can make a scraper!

To be able to add comics to Comics RSS, it is helpful to understand the basics of what is going on.

Comics RSS has two types of parts: scrapers, and the site generator. Each scraper parses a different comic website, and writes a temporary file to the disk. The site generator reads the temporary JSON files, generates and writes static HTML and RSS files to the disk.



### How scrapers work

The scrapers make https requests to a website (for example, `gocomics.com`), parse the responses, and write temporary JSON files to the disk.

On a site like gocomics.com, a scraper has to first make a request to get the list of comics. (For example, `gocomics.com/comics/a-to-z`)

Then, for each comic it finds, it needs to look up the latest day's comic strip. If it has not seen that day's comic strip, then it remembers that comic strip, and looks up the previous day's comic strip. When it finds a day's comic strip that it has seen before, it will look at the next comic, until it finishes the website.

Finally, it writes the lists of comics with their list of strips to a JSON file on the hard drive.



### How the site generator works

The site generator finds the temporary files made by the scrapers. Each temporary file is a JSON array of objects. These arrays are concatenated into one big list of comics, each with their list of daily comic strips. The generator uses templates to generate an `index.html file`, `preview/{comic}.html` files, `rss/{comic}.rss` files, and some other files.

When these updated/new files are committed and pushed to this repository, they will be hosted on gh-pages, which is how you view the site today.



### Install for yourself

I have a linux server with a cron job that runs `node _generator/bin.js scrape generate` each hour.

To do the same, run the following on a linux machine:

```sh
curl https://www.comicsrss.com/install.sh | sh
```

Note that this will put all the files in `/root/comicsrss.com`.

It will ask you for your email. This is to send you an email when the script fails.
You can see that for yourself [here](https://github.com/ArtskydJ/comicsrss.com/blob/gh-pages/install.sh).



## Scraper API

### Example

To add a scraper for a website that hosts one comic strip, and shows multiple strips one one page.

1. Clone this repository
2. Create a folder in `_generator/scrapers`
3. Copy the `_generator/scrapers/dilbert/http-get.js` file, and paste it into your new folder
4. Copy the `_generator/scrapers/dilbert/merge.js` file, and paste it into your new folder
5. Create an `index.js` file in your new folder with the following

```js
// index.js
// modify as needed
const httpGet = require('./http-get.js')
const mergeComicStrips = require('./merge.js')

module.exports = function main(comicObjects) {
	return httpGet('https://example.com').then(function (html) {
		// parse the html, and turn it into an array of comic strips
		var newComicStrips = html
			.match(/<div class="comics">([\w\W]+)<footer>/)[1] // grab the middle
			.split(/<\/div><div class="comic">/) // split up the comic strips
			.map(function (comicStripHtml) { // parse!
				// do some string parsing, or regex matching
				var url = comicStripHtml.match(/<a href="([^"]+)">Permalink/)[1]
				var [_, comicImageUrl, date] = comicStripHtml.match(/<img src="([^"]+)" title="Comic for (\d\d\d\d-\d\d-\d\d)"/)
				// matches[1] = img src, matches[2] = date
				var titleAuthorDate = `My Comic Strip by Author Name for ${date}`

				return {
					titleAuthorDate,
					url,
					date,
					comicImageUrl
				}
			})

		// You are responsible to merge into `comicObjects`

		return [{
			titleAndAuthor: "My Comic Strip by Author Name",
			basename: "my-comic-strip",
			author: "Author Name",
			comicUrl: "https://example.com/",
			headerImageUrl: "https://example.com/my_comic_strip-large.jpg",
			comicStrips: mergeComicStrips(comicObjects[0].comicStrips, newComicStrips)
		}]
	})
}
```
123456789123456789

### More examples

#### Dilbert
You can look at the code for `_generator/scrapers/dilbert`. It is quite similar to the example above. Dilbert was quite easy because with one https request, I can parse 3 comic strips. (If you load the website, you'll see that it has javascript infinite-scrolling.) I haven't bothered adding the feature to navigate the back-catalog.


#### Go Comics

You can also look at the code for `_generator/scrapers/gocomics`. It is much more complicated since it hosts multiple comic strips. It is also more complicated since it is written to navigate the back-catalog of comic strips as needed. Each gocomics.com comic strip page only shows one comic strip at a time.

My scraper could stop working due to gocomics.com changing their website. If I don't fix it for 3 days, then I would permanently miss a few days of comic strips if my scraper only looked at the latest comic strip.



### `index.js` file

Each folder inside `_generator/scrapers` must have an `index.js` file in it.

The `index.js` file's export must be `function main(comicObjects) { ... }`.

A corresponding temp file is parsed to an array of `comicObject`s, and the array is passed to `main(comicObjects)`



### `comicObjects` array

An array of `comicObject` objects, with the following properties:



### `comicObject.basename` string

The basename is used as a unique identifier in some cases.

It will be used as a [slug](https://en.wikipedia.org/wiki/Clean_URL#Slug) in the preview page and rss page.

- `https://www.comicsrss.com/preview/my-comic-strip`
- `https://www.comicsrss.com/rss/my-comic-strip.rss`



### `comicObject.titleAndAuthor` string

Must have the word "by" somewhere in the middle.

For example, `"Calvin and Hobbes by Bill Watterson"`



### `comicObject.author` string

Holds the comic strip author's name.

For example, `"Bill Watterson"`



### `comicObject.comicUrl` string

TODO document this



### `comicObject.headerImageUrl` string

TODO document this



### `comicObject.comicStrips` array

An array of `comicStrip` objects, with the following properties:



### `comicStrip.titleAuthorDate` string

TODO document this



### `comicStrip.url` string

TODO document this



### `comicStrip.date` string

TODO document this



### `comicStrip.comicImageUrl` string

TODO document this



## License

[MIT](https://choosealicense.com/licenses/mit/)
