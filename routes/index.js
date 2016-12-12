var express = require('express');
var router = express.Router();
var cases = require("../model/collections").getCollection('cases');
var passport = require('passport');
var querystring = require('querystring');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', {});
    res.end();
});

router.get('/login', function (req, res) {
    res.render('login');
    res.end();
});

router.post('/login', function (req, res){
    "use strict";
    //querystring.parse
    var ret = passport.authenticate('local', { successRedirect: req.query.redirect,
        failureRedirect: '/login',
        failureFlash: true });
    ret(req, res);
});


module.exports = router;
