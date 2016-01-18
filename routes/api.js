'use strict';

var express = require('express');
var router = express.Router();
var restfulAPI = require('../utils/restful');

//example of a restuful api
restfulAPI(
  router,
  'example',
  {
    sort: {name: 1}
  }
);

module.exports = router;
