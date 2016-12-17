"use strict";
let elasticsearch = require("elasticsearch");
let config = require("../config");
let logger = require("../logger");

let client = new elasticsearch.Client(config.elasticsearch);

let helperIndexName = "helper";
let mapping = {
    CaseCache : {
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
            timeLineLink: {type: "text"}/*,
            radLink: {type: "array"},
            radDocs: {type: "array"},
            visualDocs: {type:"array"}*/
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
                body: {
                    settings: {},
                    mapping: mapping
                }
            });
        }
        else {
            // check mapping
        }
    }).catch((err)=>{
        console.error(err);
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
            return client.index({
                index: helperIndexName,
                type: type,
                id: data["id"] || null,
                body: data
            });
        },
        find: function(query) {
            // let q, body;
            let searchBody = {
                index: helperIndexName,
                type: type
            };
            if (!query){
                // do nothing
            }
            else if (typeof query === "string") {
                searchBody.q = query;
            }
            else {
                searchBody = query;
                searchBody.index = helperIndexName;
                searchBody.type = type;
            }
            if (searchBody.size == 0){
                searchBody.scroll = "5m";
                searchBody.size = 100;
                let allHits = [];
                return client.search(searchBody).then(function recur(response) {
                    allHits = allHits.concat(response.hits.hits);
                    logger.debug(`Scroll search, total:${response.hits.total}, this request get hits ${response.hits.hits.length}, already get ${allHits.length}`);
                    if (response.hits.total > allHits.length){
                        return client.scroll({
                            scrollId: response._scroll_id,
                            scroll: '30s'
                        }).then(recur);
                    }
                    else {
                        return allHits;
                    }
                });
            }
            else {
                return client.search(searchBody).then((response) => {
                    return response.hits.hits;
                });
            }
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

getCollection('CaseCache').insert({
    name: "Test",
    age: 100,
    patientNo: 93221233
}).then(()=>{
    return getCollection('CaseCache').find({q: "name:Test", size: 0})
}).then((data)=>{
    console.log(data)
}).catch((err) => {
    console.error(err);
});



module.exports.getCollection = getCollection;
