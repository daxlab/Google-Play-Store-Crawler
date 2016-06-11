/**
 * Created by daxlab on 12/4/16.
 */

// var json = require('./../app.json');
var gearmanode = require('gearmanode');
var client = gearmanode.client();

var start = process.env.START;
var end = process.env.END;
// for (i = start; i <= end; i++) {
//     // var job = client.submitJob('scrap', json[i].packageName);
//     console.log(json[i].packageName, ' ', i);
// }

var fs = require('fs'),
    JSONStream = require('JSONStream'),
    es = require('event-stream');

var getStream = function () {
    var jsonData = 'app.json',
        stream = fs.createReadStream(jsonData, {encoding: 'utf8'}),
        parser = JSONStream.parse('*');
    return stream.pipe(parser);
};

var i = 0;
getStream()
    .pipe(es.mapSync(function (data) {
        if (i >= start && i <= end) {
            var job = client.submitJob('scrap', data.packageName);
        }
        i++;
    }));
