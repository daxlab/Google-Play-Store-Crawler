var path = require('path');

var mode = app.get('env');
if (!mode || !mode.length) {
    console.log('No environment variable set. Ensure NODE_ENV is passed while starting the app.');
    console.log('Terminating the app.. ');
    process.exit();
}

console.log("Starting app in '" + mode + "' mode.");

// config/development if NODE_ENV=development
// config/production would be required if NODE_ENV=production
var cfg = require(path.join(__dirname, mode));

// associate mode with config object so anyone can check the current mode.
cfg.mode = mode;

module.exports = cfg;
