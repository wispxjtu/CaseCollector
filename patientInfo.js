"use strict";
let request = require("request");
let requestPromise = require("request-promise");
let cheerio = require('cheerio');
let logger = require('./logger.js');
let caseCache = require('./model/caseCache');
let config = require('./config');

let rp = requestPromise.defaults(config.hospitalSite);

function validCache(patient) {
    if (patient && patient.update_at && patient.enterDate && patient.visualDocs){
        // valid if enter date before 20 days ago
        // or just have updated in 20 hours
        let enterDate = new Date(patient.enterDate);
        let enterDateLowBound = new Date().setDate(new Date().getDate() - 20);
        let expireTime = new Date().setHours(new Date().getHours() - 20);

        if (enterDate < enterDateLowBound || patient.update_at > expireTime){
            return true;
        }
    }
    return false;
}

function getInfo(patient) {
    return getMedicalLink(patient)
        .then(getRadLink)
        .then(getRadDoc);
}

function translateChineseProp(patientInfo){
    let ret = {};
    for(let p in patientInfo){
        if (!patientInfo.hasOwnProperty(p))
            continue;
        if (p === "病人姓名"){
            ret.name = patientInfo[p];
        } else if (p === "年龄"){
            ret.age = patientInfo[p];
        } else if (p === "性别"){
            ret.gender = patientInfo[p];
        } else if (p === "所在病区"){
            ret.district = patientInfo[p];
        } else if (p === "床位号码"){
            ret.roomNo = patientInfo[p];
        } else if (p === "科室名称"){
            ret.department = patientInfo[p];
        } else if (p === "入院时间"){
            ret.enterDate = patientInfo[p];
        } else if (p === "出院时间"){
            ret.exitDate = patientInfo[p];
        } else if (p === "在院状态"){
            ret.currentState = patientInfo[p];
        } else if (p === "住院号"){
            ret.patientNo = patientInfo[p];
        } else if (p === "就诊卡号"){
            ret.cardNo = patientInfo[p];
        } else {
            ret[p] = patientInfo[p];
        }
    }
    return ret;
}

function search(searchParam) {
    logger.info("beging search: " + JSON.stringify(searchParam));
    let props = [];
    return rp.post('/Home/Index', {
        form: searchParam,
    }).then((bodyText)=>{
        logger.info("End search: " + JSON.stringify(searchParam));
        let patients = [];
        let $ = cheerio.load(bodyText);
        let titles = $('.grid_tit', '#HomeTableSeachForm_Table_Result');
        titles.each(function(index, node){
            props.push(node.children[0].data.trim());
        });
        let rows = $('tr.page_content', '#HomeTableSeachForm_Table_Result');
        rows.each(function(index, row){
            let columns = $(this).find('td');

            let values = [];
            let ipdLink = "";
            let timeLineLink = "";
            columns.each(function(index, column){
                if (index == 0){
                    values.push(column.children[0].children[0].data);
                    ipdLink = column.children[0].attribs['href'];
                    timeLineLink = column.children[1].attribs['href'];
                }
                else {
                    if (column.children.length > 0)
                        values.push(column.children[0].data);
                    else
                        values.push('');
                }
            });
            let patient = {
                ipdLink: ipdLink,
                timeLineLink: timeLineLink,
                radDocs: [],
                visualDocs: []
            };
            for(let i = 0; i < props.length; i++){
                patient[props[i]] = values[i];
            }
            patient = translateChineseProp(patient);
            patients.push(patient);
        });
        logger.debug(`Search return ${patients.length} patients`);
        return patients;
    });
}


function getMorePatientInfo(patients){
    let promiseArr = patients.map(function(patient){
        return getInfo(patient);
    });

    return Promise.all(promiseArr);
}

function getPatientInfo(searchParam) {
    let props = [];
    let values = [];
    let ipdLink = "";
    let timeLineLink = "";

    logger.debug(searchParam);
    return rp.post("/Home/Index", {
        form: searchParam
    }).then((bodyText)=>{
        let $ = cheerio.load(bodyText);
        let titles = $('.grid_tit', '#HomeTableSeachForm_Table_Result');
        titles.each(function(index, node){
            props.push(node.children[0].data.trim());
        });
        let rows = $('td', 'tr.page_content');

        if(rows.length == 0)
            return null;

        rows.each(function(index, row){
            if (index == 0){
                values.push(row.children[0].children[0].data);
                ipdLink = row.children[0].attribs['href'];
                timeLineLink = row.children[1].attribs['href'];
            }
            else {
                if (row.children.length > 0)
                    values.push(row.children[0].data);
                else
                    values.push('');
            }
        });

        let patientInfo = {
            ipdLink: ipdLink,
            timeLineLink: timeLineLink,
            radDocs: [],
            visualDocs:[]
        };
        for(let i = 0; i < props.length; i++){
            patientInfo[props[i]] = values[i];
        }
        patientInfo = translateChineseProp(patientInfo);
        return getInfo(patientInfo);
    })
}

function requestData(url, parser) {
    if (!url){
        return Promise.reject(`${url} input parameter is illegal`);
    }
    else {
        return rp.get(url).then((body) => {
            return parser(body);
        });
    }
}

function getMedicalLink(patient){
    if (!patient['ipdLink']){
        logger.error(`This user do not have ipd link ${patient.name}`);
        return Promise.reject(`This user do not have ipd link ${patient.name}`);
    }
    else {
        return requestData(patient['ipdLink'], body=>{
            let $ = cheerio.load(body);
            let rows = $('li','.mainnav');
            rows.each(function(index, row){
                let href = row.children[1].attribs['href'];
                if (href && href.toString().indexOf('/Medical') >= 0){
                    patient['medicalLink'] = href.toString();
                }
            });
            return patient;
        });
    }
}

function getRadLink(patient){
    if (!patient['medicalLink']){
        logger.error(`This user do not have medicalLink link ${patient.name}`);
        return Promise.reject(`This user do not have medicalLink link ${patient.name}`);
    }
    else {
        return requestData(patient['medicalLink'], body=>{
            let $ = cheerio.load(body);
            let rows = $('a','.raditemlistbody');
            patient['radLink'] = [];
            rows.each(function(index, row){
                let href = row.attribs['href'];
                if (href && href.toString().indexOf('/Rad/GetRadDocFile/') >= 0){
                    patient['radLink'].push(href.toString());
                }
            });
            return patient;
        });
    }
}

function getRadDoc(patient){
    if (!patient['radLink'] || patient['radLink'].length == 0){
        logger.info(`This user do not have rad link ${patient.name}`);
        return Promise.resolve(patient);
    }
    else {
        return requestData(patient['radLink'][0], body=>{
            let $ = cheerio.load(body);
            let visualRows = $('.panel-body', '.panel-primary');
            visualRows.each(function(index, row){
                patient['visualDocs'].push(row.children[0].data.trim().replace("\r\n", " "));
            });

            let radDocs = $('.panel-body', '.panel-warning');
            radDocs.each(function(index, row){
                patient['radDocs'].push(row.children[0].data.trim().replace("\r\n", " "));
            });
            return patient;
        });
    }
}

function getById(id) {
    let d = new Date();
    let end_time = `${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()} 23:59`;
    return getPatientInfo({
        pageindex: '0',
        value: 'n',
        type: '2',
        patientName: '',
        visitNumber: id,
        LocationUnitCode: 'Localtion',
        admissionTime: {start: "2014/1/1 0:00", end: end_time}
    });
}

module.exports = {
    getById: getById,
    getInfo: getInfo,
    search: search,
    getMorePatientInfo: getMorePatientInfo
};
