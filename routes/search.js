/**
 * Created by wisp on 2016/8/20.
 */
"use strict";
var express = require('express');
var router = express.Router();
let paitentInfo = require('../patientInfo');
let Jobs = require('../model/jobs');
var logger = require("../logger");

var optionTranslate = {0: "", 1: "包含", 2: "不包含", 3: "等于", 4: "不等于", 7: "大于或等于", 8: "小于或等于"};

var districtList = [
    {value: "-1", name: "请选择"},
    {value: "2281", name: "10病区血液科2"},
    {value: "2282", name: "11病区"},
    {value: "2283", name: "12病区"},
    {value: "2284", name: "13病区"},
    {value: "2285", name: "14病区"},
    {value: "2286", name: "15病区"},
    {value: "2288", name: "17病区"},
    {value: "2289", name: "18病区"},
    {value: "2290", name: "19病区"},
    {value: "2292", name: "20病区"},
    {value: "1124", name: "24病区"},
    {value: "2294", name: "27病区"},
    {value: "2295", name: "28病区"},
    {value: "2296", name: "29病区"},
    {value: "2291", name: "2病区"},
    {value: "2298", name: "30病区"},
    {value: "2299", name: "31病区"},
    {value: "2300", name: "32病区"},
    {value: "2315", name: "33病区"},
    {value: "2301", name: "34病区"},
    {value: "2302", name: "35病区"},
    {value: "2303", name: "36病区"},
    {value: "2304", name: "37病区"},
    {value: "2305", name: "38病房"},
    {value: "2319", name: "38病区+"},
    {value: "2297", name: "3病区"},
    {value: "2308", name: "40病区"},
    {value: "2307", name: "4病区"},
    {value: "2320", name: "50病区"},
    {value: "2323", name: "51病区"},
    {value: "2324", name: "52病区"},
    {value: "2325", name: "53病区"},
    {value: "179", name: "5病区"},
    {value: "2309", name: "5病区"},
    {value: "2312", name: "7病区"},
    {value: "4721", name: "80病区"},
    {value: "4722", name: "81病区"},
    {value: "4723", name: "82病区"},
    {value: "4724", name: "83病区"},
    {value: "4725", name: "84病区"},
    {value: "4726", name: "85病区"},
    {value: "4727", name: "86病区"},
    {value: "4728", name: "87病区"},
    {value: "4730", name: "88病区"},
    {value: "4731", name: "89病区"},
    {value: "2313", name: "8病区"},
    {value: "2314", name: "9病区"},
    {value: "2514", name: "A病区"},
    {value: "2985", name: "A区（东院）"},
    {value: "2509", name: "B病区"},
    {value: "1004", name: "B超室"},
    {value: "2986", name: "B区（东院）"},
    {value: "2512", name: "B区ICU"},
    {value: "2518", name: "C病区"},
    {value: "2987", name: "C区（东院）"},
    {value: "2510", name: "D病区"},
    {value: "2988", name: "D区（东院）"},
    {value: "2989", name: "E区（东院）"},
    {value: "2990", name: "F区（东院）"},
    {value: "2991", name: "G区（东院）"},
    {value: "2992", name: "H区（东院）"},
    {value: "4729", name: "ICUB(HHP)"},
    {value: "2993", name: "ICU区（东院）"},
    {value: "2994", name: "J区（东院）"},
    {value: "2995", name: "K区（东院）"},
    {value: "9001", name: "测试病区"},
    {value: "9002", name: "测试病区2"},
    {value: "2280", name: "肝炎病区"},
    {value: "998", name: "高等23病区"},
    {value: "2340", name: "高等综合"},
    {value: "2293", name: "华顺25病区"},
    {value: "2460", name: "华顺26病区"},
    {value: "2461", name: "华顺留观"},
    {value: "2390", name: "急救病房"},
    {value: "40", name: "急诊"},
    {value: "2311", name: "静安分院"},
    {value: "2326", name: "抗生素实验室"},
    {value: "2310", name: "六病区"},
    {value: "5555", name: "麻醉病区"},
    {value: "4923", name: "麻醉病区HHP"},
    {value: "2984", name: "美华23病区"},
    {value: "2980", name: "美华24病区"},
    {value: "2981", name: "美华留观"},
    {value: "2982", name: "美华门诊"},
    {value: "5557", name: "上房麻醉"},
    {value: "2306", name: "神经外科急救病房"},
    {value: "2287", name: "十六病区"},
    {value: "2500", name: "协和21病区"},
    {value: "2508", name: "协和22病区"}
];

var departmentList = [
    {value: "-1", name: "请选择"},
    {value: "471", name: ""},
    {value: "1036", name: "-"},
    {value: "4963", name: "80病区"},
    {value: "4722", name: "81病区"},
    {value: "4964", name: "82病区"},
    {value: "4965", name: "83病区"},
    {value: "4725", name: "84病区"},
    {value: "4726", name: "85病区"},
    {value: "4727", name: "86病区"},
    {value: "4728", name: "87病区"},
    {value: "4966", name: "88病区"},
    {value: "4967", name: "89病区"},
    {value: "4729", name: "ICU区HHP"},
    {value: "99998", name: "测试病区"},
    {value: "401", name: "传染科"},
    {value: "470", name: "放射介入"},
    {value: "490", name: "分部出院"},
    {value: "489", name: "分部入院"},
    {value: "451", name: "分部神内"},
    {value: "449", name: "分部医院"},
    {value: "419", name: "风湿职业"},
    {value: "436", name: "腹透室"},
    {value: "458", name: "肝炎病区"},
    {value: "462", name: "感染科"},
    {value: "445", name: "高等病房"},
    {value: "456", name: "高等病房2"},
    {value: "40", name: "高干病房"},
    {value: "408", name: "骨科"},
    {value: "411", name: "颌面外科"},
    {value: "414", name: "呼吸科"},
    {value: "452", name: "急诊ICU"},
    {value: "454", name: "急诊病房"},
    {value: "424", name: "康复科"},
    {value: "4721", name: "康复科HHP"},
    {value: "423", name: "抗生素"},
    {value: "437", name: "老年科病房"},
    {value: "457", name: "联合病区"},
    {value: "4923", name: "麻醉病区HHP"},
    {value: "406", name: "泌尿科"},
    {value: "4847", name: "脑外科HHP"},
    {value: "418", name: "内分泌科"},
    {value: "413", name: "皮肤科"},
    {value: "404", name: "普外科"},
    {value: "4698", name: "普外科HHP"},
    {value: "5443", name: "普外科HHP"},
    {value: "5503", name: "日间化疗HHP"},
    {value: "469", name: "乳腺外科"},
    {value: "417", name: "神经内科"},
    {value: "402", name: "神经外科"},
    {value: "4723", name: "神经外科HHP"},
    {value: "4724", name: "神经外科HHP"},
    {value: "4730", name: "神经外科HHP"},
    {value: "4731", name: "神经外科HHP"},
    {value: "4844", name: "神经外科HHP"},
    {value: "420", name: "肾病科"},
    {value: "407", name: "手外科"},
    {value: "447", name: "外宾病房"},
    {value: "410", name: "五官科"},
    {value: "427", name: "消化科"},
    {value: "416", name: "心内科"},
    {value: "405", name: "胸外科"},
    {value: "415", name: "血液科"},
    {value: "412", name: "眼科"},
    {value: "444", name: "眼科"},
    {value: "4720", name: "胰腺外科HHP"},
    {value: "1028", name: "移植"},
    {value: "409", name: "运动医学"},
    {value: "4845", name: "运动医学HHP"},
    {value: "4846", name: "整形外科HHP"},
    {value: "448", name: "中心ICU"},
    {value: "421", name: "中医科(1)"},
    {value: "461", name: "肿瘤科"},
    {value: "4843", name: "肿瘤治疗中心HHP"},
    {value: "39", name: "综合病房"}
];

var conditions = [
    {propName: "InPatientNumber", displayName: "住院号", options: [3, 4, 1, 2], type: 'text'},
    {propName: "PatientName", displayName: "病人姓名", options: [3, 4, 1, 2], type: 'text'},
    {propName: "AdmissionTime1", displayName: "入院日期前", options: [7], type: 'date'},
    {propName: "AdmissionTime2", displayName: "入院日期后", options: [8], type: 'date'},
    {propName: "DischargeTime", displayName: "出院日期", options: [8], type: 'date'},
    {propName: "Sex", displayName: "性别", options: [3, 4], type: 'text', resultOptions: [{value: -1,name: "请选择"},{value: 1,name: "男"},{value: 2,name: "女"},{value: 3,name: "未知"}]},
    {propName: "HospitalServiceCode", displayName: "科室名称", options: [3, 4], type: 'text', resultOptions: departmentList},
    {propName: "LocationUnitCode", displayName: "所在病区", options: [3, 4], type: 'text', resultOptions: districtList},
    {propName: "Status", displayName: "在院状态", options: [3, 4], type: 'text'},
    {propName: "Surgicaldoctort", displayName: "手术医生", options: [3, 4, 1, 2], type: 'text'},
    {propName: "IPDTreatDoctorName", displayName: "经治医生", options: [3, 4, 1, 2], type: 'text'},
    {propName: "Diagnosis", displayName: "住院诊断", options: [1, 3], type: 'text'},
];

router.get('/', function(req, res, next) {
    res.render('search', {conditions: conditions, optionTranslate: optionTranslate});
    res.end();
});

function searchInPage(searchString, i, patients, callback){
    patients = patients || [];
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
        if (patientsInThisPage.length < 200) {
            logger.info(`Get ${patients.length} patients, start handle`);
            callback(patients);
        }
        else {
            searchInPage(searchString, i + 1, patients, callback);
        }
    });
}


router.post('/prepare', function (req, res, next) {
    var searchString = "";
    let reqData = req.body;

    reqData.params.forEach(function(prop){
        if (prop.propName.startsWith('AdmissionTime'))
            prop.propName = 'AdmissionTime';
        //if (!prop.propName.startsWith('AdmissionTime2'))
        searchString += `${prop.propName},${prop.second},${prop.third}|`
    });

    searchInPage(searchString, 0, null, function (patients) {
        let jobId = Jobs.create('cache', patients);
        Jobs.run(jobId);
        res.end(JSON.stringify(Jobs.get(jobId)), 'utf8');
    });
});

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
                    // let jobId = Jobs.create('cache', patients);
                    // Jobs.run(jobId);
                    // res.end(JSON.stringify(patients), 'utf8');
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
    // paitentInfo.search({
    //     value: searchString,
    //     type: 2,
    //     page: 1,
    //     patientName: "",
    //     LocationUnitCode: 'Localtion',
    //     admissionTime: ""
    // }, function(data){
    //     if (reqData.additionalParam && reqData.additionalParam.keyword){
    //         paitentInfo.getMorePatientInfo(data).then(function(values){
    //             let filterData = values.filter(function(value){
    //                 return value.radDocs.join().indexOf(reqData.additionalParam.keyword) >= 0;
    //             });
    //             res.end(JSON.stringify(filterData), 'utf8');
    //         }, function (err) {
    //             next(new Error(err));
    //         })
    //     }
    //     else {
    //         res.end(JSON.stringify(data), 'utf8');
    //     }
    // });
});

module.exports = router;