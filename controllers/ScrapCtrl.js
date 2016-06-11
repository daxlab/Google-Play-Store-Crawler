/**
 * Created by daxlab on 19/3/16.
 */


var Promise = require('bluebird');
var debug = require('debug')('apps:scrapctrl');
var bodyParser = require('body-parser');
var scrap = Promise.promisifyAll(require('../models/ScrapUtils'));

module.exports = function (req, res, next) {

    debug('Incoming request ', req.query);
    scrap.detailsAsync(req.query.package)
        .then(function (appData) {
            res.status(200).json(appData);
        })
        .catch(function (err) {
            debug('Error in scraping package ', req.query.package, err);
            // res.status(404).json(err);
            res.status(404);
            res.render('error', {
                message: err.message,
                error: err.error
            });
        });
};
