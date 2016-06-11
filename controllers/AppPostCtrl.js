/**
 * Created by daxlab on 20/3/16.
 */

var Promise = require('bluebird');
var debug = require('debug')('apps:postapps');
var postAppUtil = Promise.promisifyAll(require('../models/AppPostUtils'));

module.exports = function (req, res, next) {

    debug('Incoming apps json ', req.body);
    postAppUtil.saveAppDataAsync(req.body)
        .catch(function (err) {
            debug('Error in savedata AppPostCtrl ', err);
            var msg = {
                status: 'not ok'
            };
            res.status(500);
            res.json(msg);
        })
        .then(function () {
            var msg = {
                status: 'ok'
            };
            res.status(200);
            res.json(msg);
        });
};