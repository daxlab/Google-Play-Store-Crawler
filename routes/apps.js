/**
 * Created by daxlab on 19/3/16.
 */

var express = require('express');
var router = express.Router();
var ScrapController = require('./../controllers/ScrapCtrl');
var AppPostController = require('./../controllers/AppPostCtrl');

/* GET app info from play store */
router.get('/scrap', ScrapController);
/* POST user apps */
router.post('/postapps', AppPostController);

module.exports = router;