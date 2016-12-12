/**
 * Created by wisp on 2016/8/20.
 */
$( document ).ready(function() {
    function zeroPad(num, places) {
        var zero = places - num.toString().length + 1;
        return Array(+(zero > 0 && zero)).join("0") + num;
    }

    var start = new Date();
    start.setMonth(start.getMonth()-1);
    var start_time = `${start.getFullYear()}-${zeroPad(start.getMonth()+1, 2)}-${zeroPad(start.getDate(), 2)}`;
    var end = new Date();
    var end_time = `${end.getFullYear()}-${zeroPad(end.getMonth()+1, 2)}-${zeroPad(end.getDate(), 2)}`;

    $(".third", "#AdmissionTime1").val(start_time);
    $(".third", "#AdmissionTime2").val(end_time);
    $(".third", "#DischargeTime").val(end_time);

    $("#prepareBtn").click(function () {

        var params = [];
        $(".condition").each(function(index, row){
            var condition = {};
            condition.propName = $(this).attr("id");
            condition.second = $($(this).find(".second")[0]).val();
            condition.third = $($(this).find(".third")[0]).val();
            params.push(condition);
        });
        var keyword = $("#keyword").val();
        var postData = {
            params: params,
            additionalParam: {
                keyword: keyword
            }
        };

        var $btn = $(this);
        $.ajax({
            url: '/search/prepare',
            method: 'POST',
            dataType : "json",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(postData),
            success: function(data, status, jqXHR) {
                console.log(data);
            },
            error:function(jqXHR, textStatus, errorThrown) {
                if (jqXHR.responseJSON && jqXHR.responseJSON.message){
                    showError(jqXHR.responseJSON.message);
                }
                else {
                    showError(jqXHR.status + jqXHR.statusText, "");
                }
            },
            complete: function(){
                $btn.button('reset');
            }
        });
        hideError();
        $(this).button('loading');
    });

    $("#searchBtn").click(function () {

        var params = [];
        $(".condition").each(function(index, row){
            var condition = {};
            condition.propName = $(this).attr("id");
            condition.second = $($(this).find(".second")[0]).val();
            condition.third = $($(this).find(".third")[0]).val();
            params.push(condition);
        });
        var keyword = $("#keyword").val();
        var postData = {
            params: params,
            additionalParam: {
                keyword: keyword
            }
        };

        var $btn = $(this);
        $.ajax({
            url: '/search',
            method: 'POST',
            dataType : "json",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(postData),
            timeout: 20*60*1000,
            success: function(data, status, jqXHR) {
                $("#tableField").show();
                $('#searchResultTable').DataTable({
                    data: data,
                    columns: [
                        //{ "data": "index"},
                        {"data": "patientNo"},
                        {"data": "name"},
                        {"data": "age"},
                        {"data": "gender"},
                        {"data": "radDocs"},
                        {"data": "visualDocs"},
                        {"data": "enterDate"}
                    ],
                    destroy: true
                });
            },
            error:function(jqXHR, textStatus, errorThrown) {
                if (jqXHR.responseJSON && jqXHR.responseJSON.message){
                    showError(jqXHR.responseJSON.message);
                }
                else {
                    showError(jqXHR.status + jqXHR.statusText, "");
                }
            },
            complete: function(){
                $btn.button('reset');
            }
        });
        hideError();
        $(this).button('loading');
    });


});