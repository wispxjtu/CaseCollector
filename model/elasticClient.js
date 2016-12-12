"use strict";
let elasticsearch = require("elasticsearch");
let config = require("../config");
let logger = require("../logger");

let client = new elasticsearch.Client(config.elasticsearch);



let helperIndexName = "helper";
let mapping = {
    caseCache : {
        properties : {
            patientNo : { type : "long" },
            cardNo: {type: "text"},
            name: {type: "text"},
            age: {type: "integer"},
            gender: {type: "keyword"},
            enterDate: {type: "date"},
            exitDate: {type: "date"},
            department: {type: "keyword"},
            district: {type: "keyword"},
            roomNo: {type: "keyword"},
            手术医生: {type: "keyword"},
            经治医生: {type: "keyword"},
            医保类型: {type: "keyword"},
            currentState: {type: "keyword"},
            medicalLink: {type: "text"},
            ipdLink: {type: "text"},
            timeLineLink: {type: "text"},
            radLink: {type: "array"},
            radDocs: {type: "array"},
            visualDocs: {type:"array"}

        }
    }
};
function checkExist(type) {
    client.indices.exists({
        index: helperIndexName
    }).then((exist)=>{
        if (!exist){
            logger.info(`${helperIndexName} index do not exist, try to create it.`);
            client.indices.create({
                index: helperIndexName,
                mappings : mapping
            })
        }
        else {
            // check mapping
        }
    });
}


function getCollection(type){
    checkExist(type);
    return {
        replace: function (id, data, callback) {
            client.removeById(id, ()=> {
                this.insert(data,callback);
            })
        },
        insert: function (data) {
            client.index({
                index: helperIndexName,
                type: type,
                id: data["id"] || null,
                body: data
            });
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
