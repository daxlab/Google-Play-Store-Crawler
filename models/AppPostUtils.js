/**
 * Created by daxlab on 19/3/16.
 */

var Promise = require('bluebird');
var mongo = Promise.promisifyAll(require('./MongoConnector'));
var debug = require('debug')('mongo:appdata');
var utils = {};
utils.saveAppData = function (appData, cb) {
    debug('In save data ', appData);
    mongo.collection.UsersData.insert(appData, function (err) {
        if (err) {
            debug('Error in inserting app data into mongo. ', err);
            cb(err);
        }
        else {
            cb(null);
        }
    });
};

module.exports = utils;