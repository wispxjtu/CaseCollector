/**
 * Created by wisp on 2016/7/10.
 */
"use strict";
function showError(message, strongMessage){
    strongMessage = strongMessage || "";
    $("#errorbar").html("<strong>" + strongMessage + "</strong>" + message).show();
    //$("#errorbar").show();
    window.scrollTo(0,0)
}
function hideError(){
    $("#errorbar").hide();
}
$( document ).ajaxError(function(event, jqXHR, ajaxSettings, error) {
    if (jqXHR.status === 401){
        showError('需要重新登录', '请刷新页面, ');
    }
    else {
        //showError('')
    }
});
