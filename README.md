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

WIP



## License

[MIT](https://choosealicense.com/licenses/mit/)
