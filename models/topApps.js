/**
 * Created by daxlab on 1/5/16.
 */


var fs = require('fs'),
    JSONStream = require('JSONStream'),
    es = require('event-stream');

var getStream = function () {
    var jsonData = 'apps.json',
        stream = fs.createReadStream(jsonData, {encoding: 'utf8'}),
        parser = JSONStream.parse('*');
    return stream.pipe(parser);
};


getStream()
    .pipe(es.mapSync(function (appData) {
        // var key = appData.packageName;
        if (appData.overallRatingCount > 100000) {
            fs.appendFileSync('topApps.json', JSON.stringify(appData) + ',\n');
        }
    }));
