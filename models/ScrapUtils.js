var request = require('request');
var cheerio = require('cheerio');
var debug = require('debug')('apps:scraputil');
module.exports.details = function (packageId, cb) {
    var PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=';
    var scrapeUrl = PLAY_STORE_URL;
    scrapeUrl = scrapeUrl + packageId;
    request(scrapeUrl, function (err, response, html) {
        if (response.statusCode == 404) {
            debug('Error in requesting scrapeUrl ', scrapeUrl, err, ' ', response.statusCode);
            var e = new Error();
            e.message = 'Not Found';
            e.error = 'Error in requesting scrapeUrl ' + scrapeUrl;
            cb(e, null);
        }
        else {
            debug('Scraping ', scrapeUrl);
            var page = cheerio.load(html);
            var appData = {
                name: '',
                category: '',
                packageName: '',
                downloads: '',
                description: '',
                overallRating: '',
                overallRatingCount: '',
                rating5: '',
                rating4: '',
                rating3: '',
                rating2: '',
                rating1: '',
                price: '',
                icon: '',
                author: '',
                authorUrl: '',
                appSize: '',
                supportedDevices: '',
                version: '',
                similarApps: [],
                lastUpdated: '',
                whatsNew: '',
                contentRating: '',
                reviews: []
            };
            var wrapper = page('.details-wrapper ');
            appData.name = wrapper.find(".document-title[itemprop=name]").text().trim();
            appData.description = wrapper.find("[itemprop=description]").text().trim();
            appData.icon = wrapper.find(".cover-image").attr("src");
            appData.author = wrapper.find("[itemprop=author] [itemprop=name]").text().trim();
            appData.authorUrl = wrapper.find(".meta-info .dev-link").attr("href");
            appData.appSize = wrapper.find("[itemprop=fileSize]").text().trim();
            appData.supportedDevices = wrapper.find("[itemprop=operatingSystems]").text().trim();
            appData.version = wrapper.find("[itemprop=softwareVersion]").text().trim();
            appData.category = wrapper.find("[itemprop=genre]").text().trim();
            appData.downloads = wrapper.find("[itemprop=numDownloads]").text().replace(/,/g, '').trim();
            appData.lastUpdated = wrapper.find("[itemprop=datePublished]").text().trim();
            appData.contentRating = wrapper.find("[itemprop=contentRating]").text().trim();
            appData.price = wrapper.find(".details-actions button.price").text().trim();

            /* Clean app price here only */
            var price = appData.price;
            if (price.indexOf('Install') > -1) {
                price = '0.0';
            }
            else {
                price = price.replace(' Buy', '');
            }
            appData.price = price;

            page('.score').filter(function () {
                var data = page(this);
                appData.overallRating = data.text();
            });
            page('.reviews-stats').filter(function () {
                var data = page(this);
                appData.overallRatingCount = data.children().last().text();
                appData.overallRatingCount = appData.overallRatingCount.replace(/,/g, '');
            });
            page('.rating-bar-container.five').filter(function () {
                var data = page(this);
                appData.rating5 = data.children().last().text();
                appData.rating5 = appData.rating5.replace(/,/g, '');
            });
            page('.rating-bar-container.four').filter(function () {
                var data = page(this);
                appData.rating4 = data.children().last().text();
                appData.rating4 = appData.rating4.replace(/,/g, '');
            });
            page('.rating-bar-container.three').filter(function () {
                var data = page(this);
                appData.rating3 = data.children().last().text();
                appData.rating3 = appData.rating3.replace(/,/g, '');
            });
            page('.rating-bar-container.two').filter(function () {
                var data = page(this);
                appData.rating2 = data.children().last().text();
                appData.rating2 = appData.rating2.replace(/,/g, '');
            });
            page('.rating-bar-container.one').filter(function () {
                var data = page(this);
                appData.rating1 = data.children().last().text();
                appData.rating1 = appData.rating1.replace(/,/g, '');
            });
            page('.details-wrapper.apps').filter(function () {
                var data = page(this);
                appData.packageName = data.data('docid');
            });
            page('span.preview-overlay-container').each(function (index, key) {
                appData.similarApps.push(page(this).attr('data-docid'));
            });
            page('.recent-change').filter(function () {
                var data = page(this);
                appData.whatsNew = data.text();
            });
            page('.review-body.with-review-wrapper').each(function (index, key) {
                appData.reviews.push(page(this).text().trim());
            });
            debug(appData);
            cb(null, appData);
        }
    });
};