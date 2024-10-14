# 🌟 Welcome to ComicsRSS!

[![ComicsRSS](https://circleci.com/gh/ArtskydJ/comicsrss.com.svg?style=svg)](https://app.circleci.com/pipelines/github/ArtskydJ/comicsrss.com)

**ComicsRSS** is the source code for the site generator and RSS feed generator for [**comicsrss.com**](https://www.comicsrss.com). All of the site's content is hosted here on GitHub Pages!

---



## ❤️ Support Me

Love the project? Help keep it going by sending a few bucks my way on [**Patreon**](https://www.patreon.com/bePatron?u=6855838)! Your support means the world to me! 🙏

---

## 🛠️ Technical Overview

I've received [many requests](https://github.com/ArtskydJ/comicsrss.com/issues/86) to add more comic series to the site. While my time is limited, you can help by creating a **scraper**!

### How It Works

- **🧩 Scrapers:** Each scraper fetches and parses a different comic website, writing temporary files to disk.
- **🚀 Site Generator:** Reads these JSON files and generates static HTML/RSS files.


### 🛠️ How Scrapers Work

1. **Requests:** Scrapers make HTTPS requests to websites (e.g., [GoComics](https://www.gocomics.com)).
2. **Parsing:** Responses are parsed, and temporary JSON files are created.
3. **Fetching:** For multi-comic sites, scrapers retrieve lists of comic series and their latest strips.
4. **Storing:** The results are saved as JSON files.


### 🏗️ How the Site Generator Works

The site generator compiles the JSON files into a comprehensive list of comic series and generates:
- **📄 `index.html`**
- **📡 `rss/{comic}.rss`**

Once these files are updated, they are pushed to this repository and hosted live on GitHub Pages!

---


## 🚀 Run It Locally

Get started with your own local setup by following these steps:

1. **Fork and Clone the Repository**
2. **Run the following commands:**

    ```sh
    # Navigate to the project directory
    cd comicsrss.com
    
    # Install dependencies
    npm install

    # Move to the generator
    cd _generator

    # View available options
    # node bin --help

    # Regenerate the site with cached data
    node bin --generate

    # To run the scrapers (may take a while)
    node bin --scrape --generate
    ```

3. **View Locally:**

   ```sh
   cd ..
    npx serve
   ```

   Then open [http://localhost:3000](http://localhost:3000) in your browser to see your site!

---



## 🌐 Run Your Own Auto-Updating Scraper with CircleCI

1. **Fork the repository**
2. **[Create a GitHub Deploy Key](https://circleci.com/docs/2.0/gh-bb-integration/#creating-a-github-deploy-key)** and add it to both GitHub and CircleCI.
3. **Edit** `.circleci/config.yml` with your details.
4. **Enable the repository in CircleCI.**

If you encounter any issues, feel free to open a PR!

---

## 🔍 Scraper API

### To Create a Scraper:

- **Single-Series Website:** Copy the code from [dilbert.js](https://github.com/ArtskydJ/comicsrss.com/tree/gh-pages/_generator/scrapers/dilbert.js) and modify as needed.
- **Multi-Series Website:** Start from [arcamax.js](https://github.com/ArtskydJ/comicsrss.com/tree/gh-pages/_generator/scrapers/arcamax.js).

If you're unsure which to use, feel free to open a GitHub issue for guidance!

---

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


## 📜 License

This project is licensed under the [**MIT License**](https://choosealicense.com/licenses/mit/). Feel free to use and contribute!

 Thank you for checking out **ComicsRSS**! Happy scraping! 🎉
