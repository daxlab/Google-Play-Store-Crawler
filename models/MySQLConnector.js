/**
 * Created by daxlab on 19/3/16.
 */

var mysql = require('mysql');
var debug = require('debug')('boot:models:mysqlC');

var poolCluster = mysql.createPool(global.config.mysql.cluster[0]);
debug('connected to mysql');

var queryDB = function (query, cb) {
    poolCluster.getConnection(function (err, connection) {
        if (err) {
            cb(err, null);
        }
        else {
            connection.query(query, function (err, rows) {
                connection.release();
                cb(err, rows);
            });
        }
    });
};

health = function (callback) {
    var start = (new Date()).getTime();
    poolCluster.getConnection(function (err, connection) {
        if (err) {
            callback(err, {status: false, time: -1});
        }
        else {
            connection.ping(function (perr) {
                var end = (new Date()).getTime();
                if (perr) {
                    debug("mysql is down: ", perr);
                    callback(err, {status: false, time: end - start});
                }
                else {
                    callback(err, {status: true, time: end - start});
                }
            });
        }
    });
};

exports.poolCluster = poolCluster;
exports.queryDB = queryDB;
exports.health = health;