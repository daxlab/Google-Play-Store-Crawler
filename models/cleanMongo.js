/**
 * Created by daxlab on 1/5/16.
 */

'use strict';

if (process.env.NODE_ENV == 'production') {
    console.log('Starting app in production mode.');
    global.config = require('../config/production');
}
else {
    console.log('Starting app in development mode.');
    global.config = require('../config/development');
}

// var mongo = require('./MongoConnector');
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = "mongodb://";

// add auth params if auth enabled
if (global.config.mongo.auth.enabled === true) {
    url += global.config.mongo.auth.username + ":" + global.config.mongo.auth.password + "@";
}

// add all the replica sets
global.config.mongo.hosts.map(function (db, i) {
    url += db + ((i === global.config.mongo.hosts.length - 1) ? '/' : ',');
});

// specify db name
url += global.config.mongo.dbname;

// set replica read prefs and other options
var options = {
    server: {
        poolSize: global.config.mongo.poolSize,
        readPreference: 'primary'
    }
};

var moment = require('moment');
var redis = require('redis').createClient();
var fs = require('fs'),
    JSONStream = require('JSONStream'),
    es = require('event-stream');

var getStream = function () {
    var jsonData = 'apps.json',
        stream = fs.createReadStream(jsonData, {encoding: 'utf8'}),
        parser = JSONStream.parse('*');
    return stream.pipe(parser);
};

MongoClient.connect(url, options, function (err, db) {
    if (err) {
        console.log("Error connecting to db: ", err);
        return;
    }
    else {
        console.log("Connected to mongo");
        getStream()
            .pipe(es.mapSync(function (appData) {
                var key = appData.packageName;
                appData.lastUpdated = moment(new Date(appData.lastUpdated)).unix();
                if (key.length > 3) {
                    redis.get(key, function (err, data) {
                        if (!data) {
                            db.collection('appdata').insert(appData, function (err) {
                                if (err) {
                                    console.log('Error in inserting mongo ', key);
                                }
                                else {
                                    redis.set(key, true, function (e) {
                                        if (e) {
                                            console.log('Error in inserting redis ', key);
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            }));

    }
});
