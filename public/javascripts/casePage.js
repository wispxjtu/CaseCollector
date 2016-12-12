/**
 * Created by wisp on 2016/7/9.
 */
"use strict";
var mode = mode || null;
$( document ).ready(function() {
    // init rating star
    $("#ratingField").rating({min:0, max:5, step:0.5, language: 'zh', size:'xs', showClear: false});

    function init(info){
        $('#patientNoField').val(info.patientNo);
        $('#cardNoField').val(info.cardNo);
        $('#nameField').val(info.name);
        $('#ageField').val(info.age);
        $('#genderField').val(info.gender);
        $('#districtField').val(info.district);
        $('#roomNoField').val(info.roomNo);
        $('#departmentField').val(info.department);
        $('#enterDateField').val(info.enterDate);
        $('#exitDateField').val(info.exitDate);
        $('#currentStateField').val(info.currentState);
        $('#consistentField').val(parseInt(info.isConsistent));
        // if (info.isConsistent)
        //     $('#consistentField').prop( "checked", true );
        // else
        //     $('#consistentField').prop( "checked", false );
        var rating = info.rating || 0;
        $('#ratingField').rating('update', parseFloat(rating));


        if ($('#commentField').val() === ''){
            $('#commentField').val(info.comment);
        }
        if ($('#radioNoField').val() === ''){
            $('#radioNoField').val(info.radioNo);
        }
        if ($('#inputField').val() === ''){
            $('#inputField').val(info.patientNo);
        }
        if ($('#radDiagnoseField').val() === ''){
            $('#radDiagnoseField').val(info.radDiagnose);
        }
        if ($('#radDocField').val() === ''){
            var radDocText = '';
            if (info.radDocs && info.radDocs.length > 0){
                info.radDocs.forEach(function(doc, index){
                    radDocText += (index+1 + ") " + doc);
                })
            }
            $('#radDocField').val(radDocText);
        }
        enableOnlyManualFields();
    }
    function disableAllFields(){
        $("input", "#caseForm").prop('disabled', true);
        $("textarea", "#caseForm").prop('disabled', true);
    }
    function enableAllFields(){
        $("input", "#caseForm").prop('disabled', false);
        $("textarea", "#caseForm").prop('disabled', false);
    }
    function enableOnlyManualFields(){
        disableAllFields();
        enableManualInputField();
    }
    function enableManualInputField(){
        $("#radioNoField").prop('disabled', false);
        $("#commentField").prop('disabled', false);
        $("#consistentField").prop('disabled', false);
        $("#ratingField").prop('disabled', false);
        if ($("#radDocField").val() === "")
            $("#radDocField").prop('disabled', false);
    }

    if (mode === 'update'){
        var data = caseInfo || {};
        init(data);
    }

    $("#editInfo").click(function(){
        enableAllFields();
        //$("#numberBlock").show();
    });
    $("#moreInfoBtn").click(function(){
        $("#extendArea").show();
        $(this).hide();
    });

    $('#resolveInfo').click(function(){
        var patientNumber =$('#inputField').val();
        var $btn = $(this);
        caseInfo = null;
        $.ajax({
            url: '/patients/' + patientNumber,
            /* jshint ignore:start */
            //data: {'personId': userID},
            /* jshint ignore:end */
            dataType: 'json',
            success: function(data, status, jqXHR) {
                if (!data){
                    showError("Cannot found the patient! Please check the input id!")
                }
                else {
                    console.log(data);
                    caseInfo = data;
                    init(caseInfo);
                }
            },
            error:function(jqXHR, textStatus, errorThrown) {
                if (jqXHR.responseJSON && jqXHR.responseJSON.message){
                    showError(jqXHR.responseJSON.message);
                }
                else if (jqXHR.status == 404) {
                    showError("Cannot found the patient! Please check the input id!");
                }
                else {
                    showError(jqXHR.status + jqXHR.statusText, "");
                }
                enableAllFields();
            },
            complete: function(){
                $btn.button('reset');
            }
        });
        hideError();
        $btn.button('loading');
        disableAllFields();
    });
    $('#cancelCaseBtn').click(function() {
        window.location = "/";
    });
    if (mode === 'update') {
        $('#createCaseBtn').html('Update');
    }
});
function createCase(){
    var data = {};
    if (caseInfo){
        data.radLink = caseInfo.radLink;
        data.medicalLink = caseInfo.medicalLink;
        data.radDocs = caseInfo.radDocs;
        data.ipdLink = caseInfo.ipdLink;
        data.timeLineLink = caseInfo.timeLineLink;
        if (mode === 'update') data._id = caseInfo._id;
    }
    if (data.radDocs && data.radDocs.length > 0){
        //do nothing
    }
    else {
        data.radDocs = [];
        if ($("#radDocField").val() !== ""){
            data.radDocs.push($("#radDocField").val());
        }
    }

    data.patientNo = $("#patientNoField").val();
    data.cardNo = $("#cardNoField").val();
    data.name = $('#nameField').val();
    data.age = $('#ageField').val();
    data.gender = $('#genderField').val();
    data.district = $('#districtField').val();
    data.roomNo = $('#roomNoField').val();
    data.department = $('#departmentField').val();
    data.enterDate = $('#enterDateField').val();
    data.exitDate = $('#exitDateField').val();
    data.currentState = $('#currentStateField').val();
    data.comment = $('#commentField').val();
    data.radioNo = $('#radioNoField').val();
    data.radDiagnose = $('#radDiagnoseField').val();
    data.rating = $('#ratingField').val();
    data.isConsistent = parseInt($('#consistentField').val());


    if (!data.name || !data.age || !data.radioNo || !data.gender){
        showError("Must fill name/age/gender/放射科号");
        return false;
    }
    var method = (mode === 'update')?'PUT':'POST';
    var payload = JSON.stringify(data);
    $.ajax({
        url: "/cases",
        method: method,
        dataType : "json",
        contentType: "application/json; charset=utf-8",
        data: payload,
        success: function(data, status, jqXHR){
            window.location = "/";
        },
        error: function(jqXHR, textStatus, errorThrown){
            if (mode === 'create')
                showError("Create case failed!")
            else
                showError("Update case failed!")
        },
        complete: function(){
            console.log("createCase complete");
        }
    });
}



