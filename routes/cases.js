/**
 * Created by wisp on 2016/7/9.
 */
'use strict';
var express = require('express');
var router = express.Router();
var cases = require("../model/collections").getCollection('cases');
var mongodb = require('mongodb');

/* GET home page. */
router.get('/new', function(req, res, next) {
    res.render('case', {title:'Create new case', caseInfo: {}, mode: 'create'});
    res.end();
});
router.get('/', function(req, res, next) {
    let filter ={owner: req.user.username};
    let query = req.query.query;
    if (query){
        filter['$or'] = [{name: query}, {radioNo:query}, {patientNo:query}, {card:query}, {comment:new RegExp(query)}, {radDocs:new RegExp(query)}, {radDiagnose:new RegExp(query)}];
    }
    if (req.query.start_time){
        //var start_time = new Date(req.query.start_time);
        filter.create_at = {$gte: new Date(req.query.start_time)};
    }
    cases.find(filter, function(err, docs){
        var o = {data: docs};
        res.write(JSON.stringify(o), 'utf8');
        res.end();
    });
});
router.get('/:caseId', function(req, res, next){
    cases.findById(req.params['caseId'], function(err, doc){
        if (err) {
            next(err);
        }
        else {
            if (req.isAjax){
                res.end(JSON.stringify(doc), 'utf8');
            }
            else {
                res.render('case', {title: 'Edit', caseId: req.params['caseId'], caseInfo: doc, mode: 'update'});
            }
        }
    });
});
router.put("/", function(req, res, next){
    var req_case = req.body;
    req_case.owner = req.user.username;
    cases.updateById(req_case['_id'], req_case, function (err, result){
        if (err) {
            next(err);
        }
        else {
            res.writeHead(200, {'Content-Type': 'application/json;charset=UTF-8'});
            res.end(JSON.stringify(result.result), 'utf8');
        }
    })
});

router.post("/", function(req, res, next){
    var req_case = req.body;
    req_case.owner = req.user.username;
    cases.insert(req_case, function (err, result){
        if (err) {
            next(err);
        }
        else {
            res.writeHead(201, {'Content-Type': 'application/json;charset=UTF-8'});
            res.end(JSON.stringify(result.ops[0]), 'utf8');
        }
    });
});
router.delete("/:caseId", function(req, res, next){
    cases.removeById(req.params['caseId'], function(err, result){
        if (err) {
            next(err);
        }
        else {
            res.end(JSON.stringify({}), 'utf8');
        }
    });
});
module.exports = router;