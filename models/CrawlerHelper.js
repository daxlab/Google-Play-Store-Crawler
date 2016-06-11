var cheerio = require('cheerio');
var debug = require('debug')('apps:scrap');
var request = require('request');
var scrap = require('../models/ScrapUtils');
var redis = require("redis");
var crawlApps = require('./CrawlApps');

var client = redis.createClient();

var cssSelector = '.preview-overlay-container';
var CATEGORY = process.env.CATEGORY;
var PLAY_STORE_URL = 'https://play.google.com/store/apps/category/' + CATEGORY + '?hl=en';//Change to fetch another category
var APPS_QUEUE = CATEGORY + ':apps_queue';
var scrapeUrl = PLAY_STORE_URL;
request(scrapeUrl, function (err, response, html) {
    if (err) {
        debug('Error in request ', scrapeUrl);
    }
    else {

        debug('Scraping ', scrapeUrl);
        var page = cheerio.load(html);
        var multi = client.multi();
        page(cssSelector).filter(function () {
            var data = page(this);
            var appId = (data['0']['attribs']['data-docid']);
            multi.lpush([APPS_QUEUE, appId]);
        });
        multi.exec(function (err, results) {
            if (err) {
                debug("Error while inserting in redis: " + err.toString());
            } else {
                crawlApps();
            }
        });
    }
});
