/**
 * Created by wisp on 2016/7/10.
 */
"use strict";
var field_map = [
    {field: "patientNo" ,prop: "住院号", value: ""},
    {field: "cardNo" ,prop: "就诊卡号", value: ""},
    {field: "patientName" ,prop: "病人姓名", value: ""},
    {field: "gender" ,prop: "性别", value: ""},
    {field: "office" ,prop: "科室名称", value: ""},
    {field: "enterDate" ,prop: "入院时间", value: ""},
    {field: "exitDate" ,prop: "出院时间", value: ""},
    {field: "district" ,prop: "所在病区", value: ""},
    {field: "bedNo" ,prop: "床位号码", value: ""},
    {field: "doctor" ,prop: "经治医生", value: ""},
    {field: "opDoctor" ,prop: "手术医生", value: ""},
    {field: "currentState" ,prop: "在院状态", value: ""},
    {field: "insuranceType" ,prop: "医保类型", value: ""}
];
field_map.every(function (item) {
    field_map[item.field] = item.prop;
    field_map[item.prop] = item.field;
});
if (typeof module !== 'undefined' && module.exports){
    module.exports = field_map;
}
