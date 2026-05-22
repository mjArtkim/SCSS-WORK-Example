$(document).ready(function() {
    $('input[name=dayType]').on('click', function () {
        if ($('input[name=dayType]:checked').val() == 'all') {
            $('#day').click();
            $('.dateTerms').attr('style', 'visibility:hidden');
        } else {
            $('.dateTerms').attr('style', 'visibility:visible');
        }
    });

    $('input[name=day]').on('click', function () {
        let date = new Date();
        let year = date.getFullYear();
        let month = ('0' + (date.getMonth() + 1)).slice(-2);
        let day = ('0' + date.getDate()).slice(-2);
        let today = year + '-' + month + '-' + day;
        let diff = Number.parseInt($(this).val());
        switch (diff) {
            case 1:
                break;
            case 7:
                date.setDate(date.getDate() - 7);
                break;
            case 30:
            case 90:
            case 180:
                let diffMonth = diff / 30;
                date.setMonth(date.getMonth() - diffMonth);
                break;
            case 365:
                date.setFullYear(date.getFullYear() - 1);
                break;
        }
        let strYear = date.getFullYear()
        let strMonth = ('0' + (date.getMonth() + 1)).slice(-2);
        let strDay = ('0' + date.getDate()).slice(-2);
        let strDate = strYear + '-' + strMonth + '-' + strDay;
        $('#str_date').val(strDate);
        $('#end_date').val(today);
    })

    let date = new Date();
    let year = date.getFullYear();
    let month = ('0' + (date.getMonth() + 1)).slice(-2);
    let day = ('0' + date.getDate()).slice(-2);
    let today = year + '-' + month + '-' + day;
    $('#str_date, #end_date').val(today);
});

function enterKey(e) {
    if (e.keyCode == 13) {
        fn_searchList();
    }
}

function fn_searchList(){
    $("#PAGE_INDEX").val(1);
    getHistoryList();
}

function fn_searchReset() {
    $('#dayAll').click();
    $('.goodsColumn select').find('option:eq(0)').prop('selected', true);
    $('#searchKeyword').val('');
    $('.chkRound').prop('checked', true);
}

function reDrawTable(data){
    var total = data.total;
    var totalPrice = data.totalPrice;
    var params = {
        divId : "PAGE_NAVI",
        pageIndex : "PAGE_INDEX",
        totalCount : total,
        recordCount : $("#pageRow").val(),
        eventName : "getHistoryList"
    };
    gfn_renderPaging(params);

    let table = $('#searchList').DataTable();
    table.clear().rows.add(data.list).draw();
    $('.total2 #totalCount').html(numberWithCommas(total));
    if(totalPrice != null){
        $('.total2 #totalPrice').html(numberWithCommas(totalPrice));
    }
}

function popLayerClose(){
    $('[id^=popLayer]').addClass('popClose');
    $('select.popInfo option').eq(0).prop('selected',true)
    $('input.popInfo, textarea.popInfo').val('');
}

function imgupChk() {
    var agreeAllCheckbox = document.getElementById("statusAll");
    var e = document.querySelectorAll('.goodsList input[type="checkbox"]:not(#statusAll)');
    for(var i = 0, len = e.length; i < len; ++i) {
        if(!e[i].checked) {
            agreeAllCheckbox.checked = false; return;
        }
    } agreeAllCheckbox.checked = true;
}

function toggleImgupChk(source) {
    var e = document.querySelectorAll('.goodsList input[type="checkbox"]:not(#statusAll)');
    for(var i = 0, len = e.length; i < len; ++i) {
        e[i].checked = source.checked;
    }
}

function confirmModal(option){
    // 현재 포커스 제거 (input 연타 방지)
    document.activeElement?.blur();
    let title = option.title ? option.title : '제목';
    let content = option.content ? `<p class="modalSubTit v2 mt10">${option.content}</p>` : '';
    let confirmText = option.confirmText ? option.confirmText : '확인';
    let cancelText = option.cancelText ? option.cancelText : '취소';
    let cancelBtn = option.cancelUse ?
        `<button type="button" class="btnType btnSize44 btnLineG3" id="popCancelBtn">${cancelText}</button>` : '';
    let modalHtml = `
    <div id="alertLayer" class="popOverlay">
        <div class="popWrap">
            <div class="popInner">
                <div class="popCnt modal v2 type3">
                    <div class="tac">
                        <p class="modalTit">${title}</p>
                        ${content}
                    </div>
                    <div class="btnWrap">
                        ${cancelBtn}
                        <button type="button" class="btnType btnSize44 btnColorP2" id="popConfirmBtn">${confirmText}</button>
                    </div>
                </div>
            </div>
        </div>
    </div>`
    $('body').append(modalHtml);
    $('#popConfirmBtn').click((option.confirm ? option.confirm : alertLayerClose));
    $('#popCancelBtn').click((option.cancel ? option.cancel : alertLayerClose));
}

function alertLayerClose(){
    $('[id^=alertLayer]').remove();
}

function removeAllLocalStorageData(){
    $.ajax({
        url : "/store/admin/ajax/logout",
        data : {},
        type : 'POST',
        contentType : 'application/json',
        success : function(data) {
            // let varUA = navigator.userAgent.toLowerCase();
            // if ( varUA.indexOf('app') > -1) {
            //     Android.delMemberSeq();
            // }
        },
        error : function(jqXHR, textStatus, errorThrown) {
            confirmModal({title : textStatus});
        }
    })
}

function popupReset(popupId){
    $(`#${popupId} input[type=text]`).val('')
    $(`#${popupId} input[type=range]`).val(10)
    $(`#${popupId} input[type=file]`).val('')
    $(`#${popupId} input[type=checkbox]`).prop('checked', false)
    $(`#${popupId} textarea`).val('')
    $(`#${popupId} select`).prop('selectedIndex', 0);
}

// 3자리 콤마
function numberWithCommas(x) {
    return x.toString().replace(/^0+(?!$)/, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function numberWithCommasAddDot(x, decimal = null) {
    if (x === '' || x === null || x === undefined) return '';

    x = x.toString();

    // 소수점만 입력된 경우 유지
    if (x === '.') return '0.';

    // 숫자 + 소수점 형태가 아니면 그대로 반환
    if (!/^\d*\.?\d*$/.test(x)) return x;

    let parts = x.split('.');

    // 정수부 콤마
    parts[0] = parts[0].replace(/^0+(?=\d)/, '')
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    // 소수점 자리수 제한
    if (decimal !== null && parts[1] !== undefined) {
        parts[1] = parts[1].slice(0, decimal);
    }

    return parts.join('.');
}

function fn_cardNum(num){
    let cardNum = num.replace(/(.{4})(?=.)/g, '$1-');
    return cardNum;
}

function fn_contactNum(contact){
    return contact.replace(/^(\d{0,3})(\d{0,4})(\d{0,4})$/g, "$1-$2-$3").replace(/\-{1,2}$/g, "");
}
