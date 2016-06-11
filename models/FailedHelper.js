/**
 * Created by james_alcatraz on 10/4/16.
 */


if (process.env.NODE_ENV == 'production') {
    console.log('Starting app in production mode.');
    global.config = require('../config/production');
}
else {
    console.log('Starting app in development mode.');
    global.config = require('../config/development');
}
var crawlFailed = require('./CrawlFailed');
var async = require('async');
var redis = require('redis');
var client = redis.createClient();
var CATEGORY = process.env.CATEGORY;
var APPS_QUEUE = CATEGORY + ":apps_queue"
var cursor = '0';
var count = '100000';
function scanFailed() {

    client.scan(cursor, 'MATCH', 'app:*', 'COUNT', count, function (err, res) {
        if (err) {
            console.log("Cannot get keys:" + err.toString());
        } else {
            cursor = res[0];
            var keys = res[1];
            console.log(keys.length);
            var index = 0;
            keys.forEach(function (key) {
                var appId = key.substring(4, key.length);
                client.get("mong:" + appId, function (err, value) {
                    if (!value) {
                        console.log(appId + " PUSHED ");
                        index++;
                        console.log(index);
                        client.lpush(APPS_QUEUE, appId);

                    }
                    else {
                        console.log(appId + " IS IN MONGO----------------------------------------")
                    }
                })
            });
            if (cursor == '0') {

                return console.log('Iteration complete');
            }

            return scanFailed();
        }

    });
}

scanFailed();
