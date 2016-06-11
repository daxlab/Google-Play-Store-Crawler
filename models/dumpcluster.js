/**
 * Created by daxlab on 12/4/16.
 */

var cluster = require('cluster');
var numCPUs = require('os').cpus().length;
var dump = require('./dump');

if (cluster.isMaster) {
    // Fork workers.
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', function (worker, code, signal) {
        console.log('worker ' + worker.process.pid + ' died');
        dump();
    });
} else {
    // Workers can share any TCP connection
    // In this case its a HTTP server
    dump();
}