function movePage (url){
    if (!url) return;
    location.href = url;
}

function goToDetail (basePath, seq) {
    if (!basePath || !seq) return;
    location.href = `${basePath}?seq=${seq}`;
}

function goToType  (path, type) {
    if (!path || !type) return;
    movePage(`${path}?type=${type}`);
}

function goBack  () {
    history.back();
}

function moveRoute (pageName, params = {}) {
    if (window.DolbomApp && typeof window.DolbomApp.resolveRouteUrl === "function") {
        const targetUrl = window.DolbomApp.resolveRouteUrl(pageName, params);

        if (targetUrl) {
            this.movePage(targetUrl);
            return;
        }
    }

    if (!pageName) return;
    location.hash = pageName;
}

function clickShareBtn (){
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        openAlert("공유하기","URL이 클립보드에 복사되었습니다.","확인", false,"");
    }).catch(err => {
        console.error("복사 실패:", err);
    });
}

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
function validateEmail(email) {
    if (!emailRegex.test(email)) {
        return {isValid: false, msg: "올바른 이메일 형식이 아닙니다."};
    }
    return {isValid: true, msg: ""};
}
function displayEmailError(isValid, msg) {
    const errorSpan = document.querySelector('.error-msg');
    const emailInput = document.querySelector('.input-email');

    if (!isValid) {
        errorSpan.textContent = msg;
        errorSpan.style.display = 'block';
        emailInput.style.borderColor = 'red';
    } else {
        errorSpan.style.display = 'none';
        emailInput.style.borderColor = '';
    }
}

const openModal = (title, content) => {
    const modalHtml = `
        <div class="dolbom-modal" data-modal="terms" aria-hidden="false">
            <div class="dolbom-modal__backdrop" onclick="this.parentElement.remove()"></div>
            <section class="dolbom-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="dolbom-modal-title">
                <header class="dolbom-modal__header">
                    <h3 class="dolbom-modal__title" id="dolbom-modal-title">${title}</h3>
                    <button class="dolbom-modal__close" type="button" aria-label="창 닫기" onclick="this.closest('.dolbom-modal').remove()">
                            <div class="material-symbols-rounded">
                            <span
                              class="icon-svg"
                              data-icon-name="close_small"
                              aria-hidden="true"
                              style="--icon-url: url('/img/sso/user/icons/close_small_icon.svg');"
                            ></span>
                        </div>
                    </button>
                </header>
                <div class="dolbom-modal__body" data-modal-body="true">
                  ${content}
                </div>
            </section>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

const openAlert = (title, content, confirmText, showCancel, cancelText, confirmFunc) => {
    const alertHtml = `
        <div class="dolbom-alert" data-alert-root="true" aria-hidden="false">
            <div class="dolbom-alert__backdrop" data-alert-action="cancel"></div>
            <section class="dolbom-alert__dialog" role="alertdialog" aria-modal="true" 
                     aria-labelledby="dolbom-alert-title" aria-describedby="dolbom-alert-message" tabindex="-1">
                <div class="dolbom-alert__content">
                    <h3 class="dolbom-alert__title" id="dolbom-alert-title" data-alert-title>${title}</h3>
                    <p class="dolbom-alert__message" id="dolbom-alert-message" data-alert-message>${content}</p>
                </div>
                <div class="dolbom-alert__actions" data-alert-actions>
                    <button class="dolbom-alert__button dolbom-alert__button--confirm" type="button" data-alert-confirm>
                        ${confirmText}
                    </button>
                    ${showCancel ? `
                    <button onclick="this.closest('.dolbom-alert').remove()" class="dolbom-alert__button dolbom-alert__button--cancel" type="button" data-alert-cancel>
                        ${cancelText}
                    </button>` : ''}
                </div>
            </section>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', alertHtml);
    const alertElem = document.body.lastElementChild;

    const handleConfirm = () => {
        if (typeof confirmFunc === 'function') {
            if (confirmFunc() === false) return;
        }
        closeAlert();
    };

    const closeAlert = () => {
        $(document).off("keydown.dolbomAlert");
        alertElem.remove();
    };

    alertElem.querySelector('[data-alert-confirm]').onclick = handleConfirm;

    const closeActions = alertElem.querySelectorAll('[data-alert-cancel], .dolbom-alert__backdrop');
    closeActions.forEach(target => target.onclick = closeAlert);

    $(document).on("keydown.dolbomAlert", "#appLoginIdInput", function(e) {
        if (e.key === "Enter") {
            e.preventDefault();
            handleConfirm();
        }
    });

    setTimeout(() => $("#appLoginIdInput").focus(), 100);
}

function temp(){
    openAlert("준비중","서비스 준비 중 입니다.", "확인", false, "");
}

function formatDateInput(date){
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};


function snsLogin(site) {
    let param = {"site": site}
    $.ajax({
        url: `/sns/login`,
        data: JSON.stringify(param),
        type: 'POST',
        contentType: 'application/json',
        beforeSend: function (xhr) {
            $('.loading').show();
        },
        success: function (res) {
            if (res.loginUrl) {
                location.href = res.loginUrl;
            } else {
                openAlert("로그인 오류", "인증 URL을 가져오지 못했습니다.", "확인", false);
            }
        },
        error: function (jqXHR) {
            console.error(jqXHR);
            openAlert('결과', "통신 중 오류가 발생했습니다.", '확인', false);
        },
        complete: function () {
            $('.loading').hide();
        }
    });

}

// ================= admin/common.js
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
