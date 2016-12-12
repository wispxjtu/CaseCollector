"use strict";
let cache = require("../model/collections").getCollection('caseCache');
let logger = require('../logger.js');

cache.createIndex({patientNo: 1, name: 1}, {unique: true});
var disableCache = false;


function insert(patient) {
    logger.verbose("insert to cache " + patient.name);
    return new Promise(function (resolve, reject) {
        get({
            patientNo: patient.patientNo,
            name: patient.name
        }).then(function (cacheObj) {
            if (cacheObj) {
                cache.replace(cacheObj["_id"], patient, function (err, result) {
                    if (err)
                        reject(err);
                    else
                        resolve(result);
                });
            }
            else {
                cache.insert(patient, function (err, result) {
                    if (err)
                        reject(err);
                    else
                        resolve(result);
                });
            }
        }, function (err) {
            reject(err);
        });
    })
}

function get(query) {
    return new Promise(function(resolve,reject){
        cache.findOne(query, function (err, doc) {
            if (err)
                reject(err);
            else {
                resolve(doc);
            }
        });
    });
}

module.exports = {
    insert: insert,
    get: get
};
