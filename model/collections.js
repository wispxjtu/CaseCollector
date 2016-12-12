/**
 * Created by wisp on 2016/7/24.
 */
"use strict";
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient
    , assert = require('assert');
var url = 'mongodb://192.168.2.13:27017/helper';
var logger = require("../logger");

logger.info("MongoDB module initialize");

let dBconnection = null;
function getDb(url) {
    return new Promise(function(resolve, reject){
        if (dBconnection){
            resolve(dBconnection);
        }
        else {
            MongoClient.connect(url, function(err, db) {
                if (err != null) {
                    reject(err);
                }
                else {
                    dBconnection = db;
                    resolve(dBconnection);
                }
            });
        }
    });
}


function getCollection(name){
    var tableName = name;
    return {
        replace: function (id, data, callback) {
            this.removeById(id, ()=> {
                this.insert(data,callback);
            })
        },
        insert: function (data, callback) {
            getDb(url).then(function(db) {
                // Insert some documents
                data.create_at = new Date();
                data.update_at = data.create_at;
                db.collection(tableName).insertOne(data, function(err, result) {
                    if (callback != null) callback(err, result);
                });
            }, function (err) {
                callback(err);
            });
        },
        find: function(query) {
            var options, callback;
            if (arguments.length == 2) {
                options = {};
                callback = arguments[1];
            }
            else if (arguments.length == 3) {
                options = arguments[1];
                callback = arguments[2];
            }
            var limit = options.limit?options.limit:0;
            var skip = options.skip?options.skip:0;
            getDb(url).then(function(db) {
                //if (err != null) {if(callback != null) callback(err, null); return;}
                // Find some documents
                db.collection(tableName).find(query, options).limit(limit).skip(skip).toArray(function(err, docs) {
                    logger.debug(`Found ${docs.length} records`);
                    if (callback != null) callback(err, docs);
                    //db.close();
                });
            }, function (err) {
                callback(err);
            });
        },
        findOne: function(query, callback) {
            getDb(url).then(function(db) {
                // Find some documents
                db.collection(tableName).find(query).limit(1).next(function(err, doc) {
                    logger.debug(`findOne return ${JSON.stringify(doc)}.`);
                    if (callback != null) callback(err, doc);
                });
            }, function (err) {
                callback(err);
            });
        },
        findById: function(id, callback) {
            var id_object = new mongodb.ObjectID(id);
            this.findOne({_id:id_object}, callback);
        },
        removeById: function(id, callback) {
            var id_object = new mongodb.ObjectID(id);
            getDb(url).then(function(db) {
                // Insert some documents
                db.collection(tableName).deleteOne({_id: id_object}, function(err, result) {
                    if (callback != null) callback(err, result);
                });
            }, function (err) {
                callback(err);
            });
        },
        updateById: function(id, data, callback){
            var id_object = new mongodb.ObjectID(id);
            delete data._id;
            getDb(url).then(function(db) {
                db.collection(tableName).updateOne({_id: id_object}, {$set: data, $currentDate: { "update_at": true }}, function(err, result) {
                    if (callback != null) callback(err, result);
                });
            }, function (err) {
                callback(err);
            });
        },

        createIndex: function(keys, options) {
            options = options || {};
            getDb(url).then(function(db) {
                db.collection(tableName).createIndex(keys, options, function (err) {
                    if (err != null) {throw err;}
                });
            }, function (err) {
                throw(err);
            });
        }
    };
}


module.exports = {
    getCollection: getCollection
};