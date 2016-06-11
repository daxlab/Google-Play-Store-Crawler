/**
 * Created by daxlab on 19/3/16.
 */

var redis = require('redis');
var redisClient = redis.createClient(global.config.redis.port, global.config.redis.host);
var debug = require('debug')('models:redis');

redisClient.select(global.config.redis.database, function (err, res) {
    if (err) {
        debug("Redis: Error in redis db selection!");
    }
    else {
        debug("Redis: Selected redis db: " + global.config.redis.database);
    }
});

redisClient.health = function (callback) {
    var start = (new Date()).getTime();
    redisClient.ping(function (err, pong) {
        var end = (new Date()).getTime();
        if (err || pong !== 'PONG') {
            debug("redis is down: ", err, pong);
            callback(err, {status: false, time: end - start});
        }
        else {
            callback(err, {status: true, time: end - start});
        }
    });
};

module.exports = redisClient;