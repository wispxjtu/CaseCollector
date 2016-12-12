/**
 * Created by wisp on 2016/12/3.
 */
'use strict';
let paitentInfo = require('../patientInfo');
let logger = require('../logger.js');

function parsePatient(job) {
    if (job.index < job.items.length){
        let patient = job.items[job.index];
        job.index ++;
        paitentInfo.getInfo(patient).then(function (value) {
            job.success++;
            logger.info(`complete ${job.success}/${job.items.length}. cost: ${new Date().getTime() - job.start_time.getTime()}`);
            parsePatient(job);
        }, function (err) {
            logger.warn(err);
            job.fail++;
            parsePatient(job);
        });
    }
    else {
        job.status = "complete";
        job.end_time = new Date();
        logger.info(`Job complete, success: ${job.success}, fail: ${job.fail}, total:${job.items.length}, cost: ${new Date().getTime() - job.start_time.getTime()}.`);
    }
}


var jobId = 100001;
var jobs = {};
var o = {
    create: function(action, patients) {
        let thisJobId = jobId;
        jobs[jobId.toString()] = {
            status: "created",
            items: patients,
            action: action,
            success: 0,
            fail: 0,
            index: 0
        };
        jobId = jobId + 1;
        return thisJobId;
    },

    get: function (jobId) {
        return jobs[jobId.toString()];
    },
    run: function (jobId) {
        let job = this.get(jobId);
        if (job){
            if (job.action === "cache" && job.items){
                job.start_time = new Date();
                job.status = "running";
                logger.info(`start to run job with ${job.items.length} items.`);
                parsePatient(job);
            }
        }
        else {
            next(new Error("Failed to run job"));
        }
    }
};


module.exports = o;