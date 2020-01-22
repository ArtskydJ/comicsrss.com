// index.js
// modify as needed
const httpGet = require('./http-get.js')
const mergeStrips = require('./merge.js')

module.exports = function main(cachedSeriesObjects) {
  return httpGet('https://www.gocomics.com/haircut-practice').then(function (html) {
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

// data-shareable-model="FeatureItem"
// data-shareable-id="2939151"
// data-transcript=""
// data-id="2939151"
// data-feature-id="1669"
// data-feature-name="Haircut Practice"
// data-feature-code="hair"
// data-feature-type="comic"
// data-feature-format="digital"
// data-date="2020-01-21"
// data-formatted-date="January 21, 2020"
// data-url="https://www.gocomics.com/haircut-practice/2020/01/21"
// data-creator="Adam Koford"
// data-title="Haircut Practice for January 21, 2020 | GoComics.com"
// data-tags=""
// data-description="For January 21, 2020"
// data-image="https://assets.amuniversal.com/5066c8e0172e0138deae005056a9545d"
// itemtype="http://schema.org/CreativeWork"
// accountableperson="Andrews McMeel Universal"
// creator="Adam Koford"

    return {
      'haircut-practice': {
        title: 'Haircut Practice',
        author: 'Adam Koford',
        url: 'https://www.gocomics.com/haircut-practice',
        imageUrl: 'https://avatar.amuniversal.com/feature_avatars/recommendation_images/features/hair/large_hair_rec_202001101432.jpg',
        strips: mergeStrips(cachedSeriesObjects['haircut-practice'].strips, newStrips)
      }
    }
  })
}