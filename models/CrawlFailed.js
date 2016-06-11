/**
 * Created by james_alcatraz on 10/4/16.
 * for crawling failed apps in mongo
 */

if (process.env.NODE_ENV == 'production') {
    console.log('Starting app in production mode.');
    global.config = require('../config/production');
}
else {
    console.log('Starting app in development mode.');
    global.config = require('../config/development');
}

var scrap = require('../models/ScrapUtils');
var mongo = require('./MongoConnector');
var redis = require("redis");
var client = redis.createClient();
var multi = client.multi();
var CATEGORY = process.env.CATEGORY;
var APPS_QUEUE = CATEGORY + ':apps_queue';
var APP_PREFIX = 'app:';
var IS_IN_MONGO = "mong:";
var empty = false;
var debug = require('debug');

/**
 * Function to insert into Mongo.
 * @param appId
 * @param appData
 */
var insertInMongo = function (appId, appData) {
    mongo.collection.AppData.insert(appData, function (err, result) {
        if (err) {
            console.log("Mongo insert failed: " + err.toString());
        } else {
            client.set(IS_IN_MONGO + appId, true, function (err, reply) {
                if (err) {
                    console.log("Redis set failed: " + err.toString());
                } else {
                    pushToQueue(appData.similarApps);
                    crawlFailed();
                }
            });
        }
    });
}


/**
 * function to push similar
 * push should be opposite to pop for BFS
 * @param similarApps
 */

var pushToQueue = function (similarApps) {
    similarApps.forEach(function (appId) {

        client.get(IS_IN_MONGO + appId, function (err, data) {
            if (!data) {
                console.log("----------------------------------" + appId);
                client.lpush(APPS_QUEUE, appId);
            }
            else {
                console.log("-_---_-_-_-____-----_----");
            }
        });
    });
};

/**
 * recursive BFS function for crawling apps
 */
var crawlFailed = function () {
    client.llen(APPS_QUEUE, function (err, value) {
        if (value == 0) {
            empty = true;
            return;
        }
        console.log(value);
    });
    client.rpop(APPS_QUEUE, function (err, appId) {
        if (err) {
            debug("Cannot pop: " + err.toString());
            empty = true;
        }
        else if (!empty) {
            client.get(IS_IN_MONGO + appId, function (err, data) {
                if (err) {
                    console.log("Cannot get from redis: " + err.toString());
                }
                if (!data) {
                    scrap.details(appId, function (err, appData) {
                        if (!err && appData) {
                            console.log(appData);
                            //Insert into mongodb and set redis true
                            insertInMongo(appId, appData);
                        } else if (!appData) {
                            crawlFailed();
                        }

                    });
                } else {
                    console.log("EXISTS!!!!!!");
                    crawlFailed();
                }
            });
        }
    })

};

module.exports = crawlFailed;

