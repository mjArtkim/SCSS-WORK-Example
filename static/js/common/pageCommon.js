function gfn_isNull(str) {
    if (str == null) return true;
    if (str == "NaN") return true;
    if (new String(str).valueOf() == "undefined") return true;
    var chkStr = new String(str);
    if( chkStr.valueOf() == "undefined" ) return true;
    if (chkStr == null) return true;
    if (chkStr.toString().length == 0 ) return true;
    return false;
}

function ComSubmit(opt_formId) {
    this.formId = gfn_isNull(opt_formId) == true ? "commonForm" : opt_formId;
    this.url = "";

    if(this.formId == "commonForm"){
        $("#commonForm")[0].reset();
        $("#commonForm").empty();
    }

    this.setUrl = function setUrl(url){
        this.url = url;
    };

    this.addParam = function addParam(key, value){
        $("#"+this.formId).append($("<input type='hidden' name='"+key+"' id='"+key+"' value='"+value+"' >"));
    };

    this.submit = function submit(){
        var frm = $("#"+this.formId)[0];
        frm.action = this.url;
        frm.method = "post";
        frm.submit();
    };
}

var gfv_ajaxCallback = "";
function ComAjax(opt_formId){
    this.url = "";
    this.formId = gfn_isNull(opt_formId) == true ? "commonForm" : opt_formId;
    this.param = "";

    if(this.formId == "commonForm"){
        $("#commonForm")[0].reset();
        $("#commonForm").empty();
    }

    this.setUrl = function setUrl(url){
        this.url = url;
    };

    this.setCallback = function setCallback(callBack){
        fv_ajaxCallback = callBack;
    };

    this.addParam = function addParam(key,value){
        this.param = this.param + "&" + key + "=" + value;
    };

    this.ajax = function ajax(){
        if(this.formId != "commonForm"){
            this.param += "&" + $("#" + this.formId).serialize();
        }
        $.ajax({
            url : this.url,
            type : "POST",
            data : this.param,
            async : false,
            success : function(data, status) {
                if(typeof(fv_ajaxCallback) == "function"){
                    fv_ajaxCallback(data);
                }
                else {
                    eval(fv_ajaxCallback + "(data);");
                }
            }
        });
    };
}

/*
divId : 페이징 태그가 그려질 div
pageIndx : 현재 페이지 위치가 저장될 input 태그 id
recordCount : 페이지당 레코드 수
totalCount : 전체 조회 건수
eventName : 페이징 하단의 숫자 등의 버튼이 클릭되었을 때 호출될 함수 이름
*/
let gfv_pageIndex = null;
let gfv_eventName = null;
function gfn_renderPaging(params){
    let divId = params.divId; //페이징이 그려질 div id
    gfv_pageIndex = params.pageIndex; //현재 위치가 저장될 input 태그
    let totalCount = params.totalCount; //전체 조회 건수
    let currentIndex = $("#"+params.pageIndex).val(); //현재 위치
    if($("#"+params.pageIndex).length == 0 || gfn_isNull(currentIndex) == true){
        currentIndex = 1;
    }


    let recordCount = params.recordCount; //페이지당 레코드 수
    if(gfn_isNull(recordCount) == true){
        recordCount = 20;
    }
    let totalIndexCount = Math.ceil(totalCount / recordCount); // 전체 인덱스 수
    if(totalIndexCount == 0) totalIndexCount = 1;
    gfv_eventName = params.eventName;

    $("#"+divId).empty();
    let preStr = "";
    let postStr = "";
    let str = "";

    let first = 1;
    let last = totalIndexCount;
    let prev = parseInt(currentIndex)-1;
    let next = parseInt(currentIndex)+1;

    let firstIndex = (parseInt(currentIndex)-2) < first ? first : (parseInt(currentIndex)-2);
    let lastIndex = (parseInt(currentIndex)+2) > last ? last : (parseInt(currentIndex)+2);

    for(let i = (lastIndex-firstIndex+1) ; i<5 ;i++){
        if(firstIndex == first && lastIndex == last) break;
        if(firstIndex > first) firstIndex--;
        if(lastIndex < last) lastIndex++;
    }

    let preDisabled = currentIndex == first ? ' p-disabled' : '';
    let postDisabled = currentIndex == last ? ' p-disabled' : '';

    preStr += '<button type="button" class="p-paginator-first'+preDisabled+'" onclick="_movePage('+first+')" ><span class="p-paginator-icon pi pi-angle-double-left"></span></button>';
    preStr += '<button type="button" class="p-paginator-prev'+preDisabled+'" onclick="_movePage('+prev+')" ><span class="p-paginator-icon pi pi-angle-left"></span></button>';


    postStr += '<button type="button" class="p-paginator-prev'+postDisabled+'" onclick="_movePage('+next+')" ><span class="p-paginator-icon pi pi-angle-right"></span></button>';
    postStr += '<button type="button" class="p-paginator-prev'+postDisabled+'" onclick="_movePage('+last+')" ><span class="p-paginator-icon pi pi-angle-double-right"></span></button>';

    str += '<span class="p-paginator-pages">';
    for(let i=firstIndex; i<=lastIndex; i++){
        if(i != currentIndex){
            str += '<button type="button" class="p-paginator-page" onclick="_movePage('+i+')">'+i+'</button>';
        }
        else{
            str += '<button type="button" class="p-paginator-page p-highlight" onclick="_movePage('+i+')">'+i+'</button>';
        }
    }
    str += '</span>';
    $("#"+divId).append(preStr+str+postStr);
}

function _movePage(value){
    $("#"+gfv_pageIndex).val(value);
    if(typeof(gfv_eventName) == "function"){
        gfv_eventName(value);
    }
    else {
        eval(gfv_eventName + "(value);");
    }
}
