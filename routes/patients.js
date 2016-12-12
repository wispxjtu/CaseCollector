/**
 * Created by wisp on 2016/7/17.
 */
'use strict'
var express = require('express');
var router = express.Router();
var patientInfoHelper = require('../patientInfo.js');

router.get('/:patientId', function(req, res, next) {
    patientInfoHelper.getById(req.params['patientId']).then(function(patientInfo){
        if (!patientInfo){
            res.writeHead(404, {'Content-Type': 'application/json;charset=UTF-8'});
            res.end(JSON.stringify({message: "Error happened when get this patient infomation."}), 'utf8');
        }
        else if (!patientInfo.name){
            res.writeHead(404, {'Content-Type': 'application/json;charset=UTF-8'});
            res.end(JSON.stringify({message: "Record not found."}), 'utf8');
        }
        else if (!patientInfo.ipdLink && !patientInfo.timeLineLink){
            res.writeHead(200, {'Content-Type': 'application/json;charset=UTF-8'});
            res.end(JSON.stringify({message: "cannot get 时间轴链接, 无法继续获取病理信息."}), 'utf8');
        }
        else {
            var res_data = JSON.stringify(patientInfo);
            res.writeHead(200, {'Content-Type': 'application/json;charset=UTF-8'});
            res.end(res_data, 'utf8');
        }
    }).catch((err)=> next(err));
});



module.exports = router;