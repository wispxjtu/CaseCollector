/**
 * Created by wisp on 2016/12/3.
 */
"use strict";
var express = require('express');
var router = express.Router();
let paitentInfo = require('../patientInfo');

router.post('/', function(req, res, next) {
    var searchString = "";
    let reqData = req.body;

    reqData.params.forEach(function(prop){
        if (prop.propName.startsWith('AdmissionTime'))
            prop.propName = 'AdmissionTime';
        //if (!prop.propName.startsWith('AdmissionTime2'))
        searchString += `${prop.propName},${prop.second},${prop.third}|`
    });
    var patients = [];

    function searchInPage(i){
        var searchParam = {
            value: searchString,
            type: 2,
            patientName: "",
            LocationUnitCode: 'Localtion',
            admissionTime: ""
        };
        if (i > 0){
            searchParam.pageindex = i;
        }
        paitentInfo.search(searchParam).then(function(patientsInThisPage){
            patients = patients.concat(patientsInThisPage);
            if (patientsInThisPage.length >= 200) {
                searchInPage(i+1);
            }
            else {
                if (reqData.additionalParam && reqData.additionalParam.keyword){
                    paitentInfo.getMorePatientInfo(patients).then(function(values){
                        let filterData = values.filter(function(value){
                            return value.radDocs.join().indexOf(reqData.additionalParam.keyword) >= 0;
                        });
                        res.end(JSON.stringify(filterData), 'utf8');
                    }, function (err) {
                        next(new Error(err));
                    })
                }
                else {
                    res.end(JSON.stringify(patients), 'utf8');
                }
            }
        });
    }
    searchInPage(0);
});

module.exports = router;