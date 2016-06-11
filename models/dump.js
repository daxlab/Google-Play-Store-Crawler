/**
 * Created by daxlab on 12/4/16.
 */

var debug = require('debug')('dump');
if (process.env.NODE_ENV == 'production') {
    debug('Starting app in production mode.');
    global.config = require('../config/production');
}
else {
    debug('Starting app in development mode.');
    global.config = require('../config/development')
}
module.exports = function () {
    var mongo = require('./MongoConnector');
    var gearmanode = require('gearmanode');
    var worker = gearmanode.worker();
    var client = gearmanode.client();
    var scrap = require('./ScrapUtils');
    worker.addFunction('scrap', function (job) {
        // job.sendWorkData(job.payload);
        var packageId = job.payload.toString();
        debug('packageId ', packageId);
        scrap.details(packageId, function (err, appData) {
            if (err) {
                debug('error in scraping ', err, packageId);
                var job2 = client.submitJob('scrap', packageId);
                job.workComplete(job.payload.toString());
            }
            else {
                debug('Scrap success !', packageId, ' inserting in mongo');
                mongo.collection.AppData.insert(appData, function (err, result) {
                    if (err) {
                        debug('Error in inserting mongo');
                    }
                    else {
                        debug('mongo insert success !');
                        job.workComplete(job.payload.toString());
                    }
                });
            }
        });
    });
};