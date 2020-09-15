# comicsrss.com

[![ComicsRSS](https://circleci.com/gh/ArtskydJ/comicsrss.com.svg?style=svg)](https://app.circleci.com/pipelines/github/ArtskydJ/comicsrss.com)

Source code for the site generator and rss feed generator for [comicsrss.com](https://www.comicsrss.com).

Also, all of the site's content is in this repository, as it is hosted by GitHub Pages.



## Support Me

If you'd like to help keep this site going, you can send me a few bucks using [Patreon](https://www.patreon.com/bePatron?u=6855838). I'd really appreciate it!


<!-- Try to cut down on all these unnecessary details...
Why do I need to explain the inner workings of the entire thing before giving them the API to try it out?

Probably trim these sections down sometime later... -->

## Technical Details

I have received [many requests](https://github.com/ArtskydJ/comicsrss.com/issues/86) to add more comic series to the site. However, my time is limited. So if you want to help out, you can make a scraper!

To be able to add comic series to Comics RSS, it is helpful to understand the basics of what is going on.

Comics RSS has two types of parts: scrapers, and the site generator. Each scraper parses a different comic website, and writes a temporary file to the disk. The site generator reads the temporary JSON files, generates and writes static HTML and RSS files to the disk.



### How scrapers work

The scrapers make https requests to a website (for example, `gocomics.com`), parse the responses, and write temporary JSON files to the disk.

On a site like gocomics.com, a scraper has to first make a request to get the list of comic series. (For example, `gocomics.com/comics/a-to-z`)

Then, for each comic series it finds, it needs to look up the latest day's comic strip. If it has not seen that day's comic strip, then it saves that comic strip, and looks up the previous day's comic strip. When it finds a comic strip that it has seen before, it will continue to the next comic series, until it finishes the website.

Finally, it writes the lists of comic series with their list of strips to a temporary JSON file on the hard drive.



### How the site generator works

The site generator finds the temporary JSON files made by the scrapers. Each file has an array of `seriesObject`s. These arrays are concatenated into one big list of comic series, each with their list of comic strips. The generator uses templates to generate an `index.html` file, and `rss/{comic}.rss` files.

When these updated/new files are committed and pushed to this repository, they get hosted on gh-pages, which is how you view the site today.



### Install for yourself

1. Fork the repository
2. [Create a GitHub Deploy Key](https://circleci.com/docs/2.0/gh-bb-integration/#creating-a-github-deploy-key), add it to GitHub, and CircleCI
3. Change `.circleci/config.yml` from my username, email, and key fingerprint to your username, email, and key fingerprint
4. I think that's it? Make a PR if you attempt the above steps and I missed something!

<!--
I have a linux server with a cron job that runs `sh _generator/generate-and-push.sh` each hour.

To do the same, run this on linux or macOS:

```sh
curl https://www.comicsrss.com/install.sh | sh
```

Note that this will put all the files in `/root/comicsrss.com`.

It will ask you for your email. This is to send you an email when the script fails.
You can see that for yourself [here](https://github.com/ArtskydJ/comicsrss.com/blob/gh-pages/install.sh).
-->


## Scraper API

The scraper API changed recently, and I haven't updated the documentation. However, it is simpler than before. Unfortunately, there are fewer docs than before.

See the code for [arcamax](https://github.com/ArtskydJ/comicsrss.com/tree/gh-pages/_generator/scrapers/arcamax.js) to see that it's not very difficult to make a scraper for a large website, with just a little bit of string manipulation.

<!--
### Example

To add a scraper for a website that hosts one comic strip, and shows multiple strips one one page.

1. Clone this repository
2. Create a folder in `_generator/scrapers`
3. Copy the `_generator/scrapers/dilbert/http-get.js` file, and paste it into your new folder
4. Copy the `_generator/scrapers/dilbert/merge.js` file, and paste it into your new folder
5. Create an `index.js` file in your new folder. Copy the javascript below

```js
// index.js
// modify as needed
const httpGet = require('./http-get.js')
const mergeStrips = require('./merge.js')

module.exports = function main(cachedSeriesObjects) {
  return httpGet('https://example.com').then(function (html) {
    // parse the html, and turn it into an array of comic strips
    const newStrips = html
      .match(/<div class="comics">([\w\W]+)<footer>/)[1] // grab the middle
      .split(/<\/div><div class="comic">/) // split up the comic strips
      .map(function (comicStripHtml) { // parse!
        // do some string parsing, or regex matching
        return {
          url: comicStripHtml.match(/<a href="([^"]+)">Permalink/)[1],
          date: comicStripHtml.match(/<img src="([^"]+)"/)[1],
          imageUrl: comicStripHtml.match(/<img .+ title="Comic for (\d\d\d\d-\d\d-\d\d)"/)[1]
        }
      })

    return {
      'mycomicstrip': {
        title: 'My Comic Strip',
        author: 'Author Name',
        url: 'https://example.com/',
        imageUrl: 'https://example.com/my_comic_strip-large.jpg',
        strips: mergeStrips(cachedSeriesObjects['mycomicstrip'].strips, newStrips)
      }
    }
  })
}
```



### More examples

#### Dilbert
You can find the code [here](https://github.com/ArtskydJ/comicsrss.com/tree/gh-pages/_generator/scrapers/dilbert). It is quite similar to the example above. Dilbert was quite easy because with one https request, I can parse 3 comic strips. (If you load the website, you'll see that it has javascript infinite-scrolling.) I haven't bothered adding the feature to navigate the back-catalog.


#### Go Comics

You can also find the code [here](https://github.com/ArtskydJ/comicsrss.com/tree/gh-pages/_generator/scrapers/gocomics). It is much more complicated since it hosts multiple comic strips. It is also more complicated since it is written to navigate the back-catalog of comic strips as needed. Each gocomics.com comic strip page only shows one comic strip at a time.

My scraper could stop working if gocomics.com changes their website. If I don't fix it for 3 days, and if my scraper only looked at the latest comic strip, then I would permanently miss a few days of comic strips. That is why it is important to be able to navigate the back-catalog.



### `index.js` file

Each folder inside `_generator/scrapers` must have an `index.js` file in it.

The `index.js` file's must do something like this:

```js
module.export = function main(cachedSeriesObjects) { // this might be up-to-date, or it might not be.
  // request and parse comic website, and add any new comic strips to the cachedSeriesObjects object (or a copy, it doesn't matter)
  return promise // this promise resolves with the updated seriesObjects
}
```

A corresponding temp file is parsed to an array of `seriesObject`s, and the array is passed to `main(seriesObjects)`



### `cachedSeriesObjects` object

This is an object that holds a bunch of `seriesObject`s based on an ID. The ID will be used as a [slug](https://en.wikipedia.org/wiki/Clean_URL#Slug) in the rss page. Example: `calvinandhobbes`

```jsonc
{
  "calvinandhobbes": { /* seriesObject */ },
  "dilbert": { /* seriesObject */ },
  /* more... */
}
```

### `seriesObject` object

Properties of `seriesObject`:

- `title` string - The title of the series. Example: `Calvin and Hobbes`
- `author` string - The comic series author's name. Example: `Bill Watterson`
- `url` string - A URL for the whole series. This should be a web page that represents the whole comic series. Example: `https://www.gocomics.com/calvinandhobbes/about`
- `imageUrl` string - A URL for an image that represents the whole comic series.
- `strips` array - An array of `strip` objects. See below



### `strip` object

- `url` string - Permalink to the specific comic strip. 
- `date` string - The date that the comic strip was published. (Not the date it was scraped.) Formatted as `yyyy-mm-dd`
- `imageUrl` string - The URL of the image of the actual comic strip. Example: `https://assets.amuniversal.com/00e343804e6d013797bd005056a9545d`
-->


## License

[MIT](https://choosealicense.com/licenses/mit/)
