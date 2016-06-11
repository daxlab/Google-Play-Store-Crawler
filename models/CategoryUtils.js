var cheerio = require('cheerio');
var debug = require('debug')('apps:scrap');
var request = require('request');
var bodyParser = require('body-parser');
var mongo = require('mongodb');

var cssSelector = '.child-submenu-link';
var PLAY_STORE_URL = 'https://play.google.com/store/apps/category/EDUCATION';
var scrapeUrl = PLAY_STORE_URL;
request(scrapeUrl, function (err, response, html) {
    if (err) {
        debug('Error in request ', scrapeUrl);
    }
    else {
        debug('Scraping ', scrapeUrl);
        var page = cheerio.load(html);
        page(cssSelector).filter(function () {
            var data = page(this);
            var packages = (data['0']['attribs']['href']);
            console.log(packages);

        });
    }
});