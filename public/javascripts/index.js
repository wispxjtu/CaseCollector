/**
 * Created by wisp on 2016/8/6.
 */
function deleteCase(id, cb) {
    $.ajax({
        url: '/cases/' + id,
        /* jshint ignore:start */
        //data: {'personId': userID},
        dataType: 'json',
        method: 'DELETE',
        success: function(/*data, status, jqXHR*/) {
            console.log(`Delete ${id} succeeded`);
            if (cb && typeof cb === 'function') cb();
        },
        error:function(jqXHR/*, textStatus, errorThrown*/) {
            if (jqXHR.responseJSON && jqXHR.responseJSON.message){
                showError(jqXHR.responseJSON.message);
            }
            else {
                showError(jqXHR.status + jqXHR.statusText, "");
            }
        },
        complete: function(){
            // console.log();
        }
    });
}
$( document ).ready(function() {
    function loadData(){
        var months = $("#querySelect option:selected" ).val();
        console.log(months);
        var d = new Date();
        d.setMonth(d.getMonth()-months);
        d.setHours(d.getHours()-24);
        table.ajax.url(`cases?start_time=${d.toISOString()}`);
        table.ajax.reload();
    }
    var months = $("#querySelect option:selected" ).val();
    var d = new Date();
    d.setMonth(d.getMonth()-months);
    d.setHours(d.getHours()-24);
    var init_url = `cases?start_time=${d.toISOString()}`;
    var table = $('#caseListTable').DataTable( {
        "ajax": {
            "url": init_url,
            "dataSrc": function(json){
                var data = json.data;
                for ( var i=0, ien= data.length ; i<ien ; i++ ) {
                    //data[i]["index"] = i + 1;
                    data[i]["hasRadDocs"] = (data[i]['radDocs'] && data[i]['radDocs'].length&&data[i]['radDocs'].length>0)? "有":"无";
                    data[i]["name"] = `<a href=\'/cases/${data[i]._id}\'>${data[i].name}</a>`;
                    data[i]["action"] = `<a class=\'delCaseBtn btn btn-link\' style=\'padding:0;\' data-id=\'${data[i]._id}\' data-toggle=\'confirmation\'>Del</a>`;
                    if(data[i]["isConsistent"] === 2){
                        data[i]["isConsistent"] = "未知";
                    }
                    else if (data[i]["isConsistent"] === 1){
                        data[i]["isConsistent"] = "是";
                    }
                    else {
                        data[i]["isConsistent"] = "否";
                    }
                }
                return data;
            }
        },
        "columns": [
            //{ "data": "index"},
            { "data": "name" },
            { "data": "age" },
            { "data": "gender" },
            { "data": "radioNo" },
            { "data": "hasRadDocs" },
            { "data": "isConsistent" },
            { "data": "rating" },
            { "data": "action" },
            { "data": "comment"},
            { "data": "radDocs" },
            { "data": "patientNo" },
            { "data": "cardNo" },
            { "data": "radDiagnose" },
            { "data": "create_at" }
        ]
    } );
    table.on('draw', function(){
        $('[data-toggle=confirmation]').confirmation({
            onConfirm: function () {
                deleteCase($(this).attr('id'), loadData);
            },
            //singleton: true,
            popout: true
        });
    });
    //loadData();
    // hide column
    table.columns().every(function(index){
        if (index > 8)
            table.column(index).visible(false);
    });


    $('#querySelect').change(loadData);
});