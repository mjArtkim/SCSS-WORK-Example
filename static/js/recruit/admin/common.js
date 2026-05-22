$(document).ready(function() {

    $('#str_date, #end_date').datepicker({
        dateFormat: "yy-mm-dd",
        prevText: '이전 달',
        nextText: '다음 달',
        monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
        monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
        dayNames: ['일', '월', '화', '수', '목', '금', '토'],
        dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
        dayNamesMin: ['일', '월', '화', '수', '목', '금', '토'],
        showMonthAfterYear: true,
        yearSuffix: '년',
        gotoCurrent: true, // True if today link goes back to current selection instead
        changeMonth: true, // True if month can be selected directly, false if only prev/next
        changeYear: true, // True if year can be selected directly, false if only prev/next
        yearRange: 'c-10:c+10', // Range of years to display in drop-down, // either relative to today's year (-nn:+nn), relative to currently displayed year // (c-nn:c+nn), absolute (nnnn:nnnn), or a combination of the above (nnnn:-n)
    })

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

function fn_searchList() {
    $("#PAGE_INDEX").val(1);
    getHistoryList();
}

function fn_searchReset() {
    $('#dayAll').click();
    $('.goodsColumn select').find('option:eq(0)').prop('selected', true);
    $('#searchKeyword').val('');
    $('.chkRound').prop('checked', true);
}

function reDrawTable(data) {
    var total = data.total;
    var totalPrice = data.totalPrice ? data.totalPrice : data.total;
    var params = {
        divId: "PAGE_NAVI",
        pageIndex: "PAGE_INDEX",
        totalCount: total,
        recordCount: $("#pageRow").val(),
        eventName: "getHistoryList"
    };
    gfn_renderPaging(params);

    let table = $('#searchList').DataTable();
    if (data.list) table.clear().rows.add(data.list).draw();
    else if (data.data) table.clear().rows.add(data.data).draw();

    if (totalPrice != null) {
        $('.total2 #totalPrice').html(numberWithCommas(totalPrice));
    } else {
        $('.total2 #totalCount').html(numberWithCommas(total));
    }
}

function popLayerClose() {
    $('[id^=popLayer]').addClass('popClose');
    $('select.popInfo option').eq(0).prop('selected', true)
    $('input.popInfo, textarea.popInfo').val('');
}

function imgupChk() {
    var agreeAllCheckbox = document.getElementById("statusAll");
    var e = document.querySelectorAll('.goodsList input[type="checkbox"]:not(#statusAll)');
    for (var i = 0, len = e.length; i < len; ++i) {
        if (!e[i].checked) {
            agreeAllCheckbox.checked = false;
            return;
        }
    }
    agreeAllCheckbox.checked = true;
}

function toggleImgupChk(source) {
    var e = document.querySelectorAll('.goodsList input[type="checkbox"]:not(#statusAll)');
    for (var i = 0, len = e.length; i < len; ++i) {
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

function alertLayerClose() {
    $('[id^=alertLayer]').remove();
}

function removeAllLocalStorageData() {
    $.ajax({
        url: "/recruit/admin/ajax/logout",
        data: {},
        type: 'POST',
        contentType: 'application/json',
        success: function (data) {
        },
        error: function (jqXHR, textStatus, errorThrown) {
            confirmModal({title: textStatus});
        }
    })
}

function numberWithCommas(x) {
    if (!x) return x;
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".salary").forEach(el => {
        el.innerText = numberWithCommas(el.innerText);
    });
});