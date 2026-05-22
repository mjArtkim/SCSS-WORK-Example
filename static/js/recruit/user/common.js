const pageHost = location.protocol + '//' + location.host;
const pagePathName = location.pathname;
let categoryInfo = window.localStorage.getItem('categoryInfo');
let categoryInfoExpire = categoryInfo == null ? null : JSON.parse(categoryInfo).expire;
let varUA = navigator.userAgent.toLowerCase();

$(function () {
    let date = new Date();
    let year = date.getFullYear();
    let month = ('0' + (date.getMonth() + 1)).slice(-2);
    let day = ('0' + date.getDate()).slice(-2);
    $(document).find('#str_date').val(`${year}-${month}-${day}`);
    $(document).find('#end_date').val(`${year}-${month}-${day}`);
    if (varUA.indexOf('iphone') > -1 || varUA.indexOf('ipad') > -1 || varUA.indexOf('ipod') > -1) {
        $('.wrap');
    }

    if (categoryInfo == null) {
        fn_getCategoryInfo();
    } else {
        if (JSON.parse(categoryInfo).value == null || JSON.parse(categoryInfo).value == 'undefined' || JSON.parse(categoryInfo).value == undefined) {
            fn_getCategoryInfo();
        } else {
            if (categoryInfoExpire < Date.now() || categoryInfoExpire == null) {
                fn_getCategoryInfo();
            } else {
                fn_setCategoryMenu(JSON.parse(categoryInfo).value);
            }
        }
    }
});

function movePage(url) {
    if (!url) {
        return;
    }

    fn_location(url);
}

function goToDetail(basePath, seq) {
    if (!basePath || !seq) {
        return;
    }

    movePage(basePath + '?seq=' + seq);
}

function goToType(path, type) {
    if (!path || !type) {
        return;
    }

    movePage(path + '?type=' + type);
}

function goBack() {
    history.back();
}

function pageGoPost(d) {
    var insdoc = '';

    for (var i = 0; i < d.vals.length; i++) {
        insdoc += "<input type='hidden' name='" + d.vals[i][0] + "' value='" + d.vals[i][1] + "'>";
    }

    var goform = $('<form>', {
        method: 'post',
        action: d.url,
        target: d.target,
        html: insdoc,
    }).appendTo('body');

    goform.submit();
}

function langChange(lang) {
    document.cookie = 'lang=' + lang;
    if (userAgent.indexOf('payapp') > -1) {
        Android.setLanguage(lang);
    } else if (userAgent.indexOf('iospay') > -1) {
        window.webkit.messageHandlers.iosListener.postMessage('changeLang|' + lang);
    }
    fn_location(location.pathname + '?lang=' + lang);
}

function fn_setDate(e) {
    //let srcDate = $(e).find('option:selected').val();
    let srcDate = $(e).attr('value');
    if (srcDate != 'recent' && srcDate != 'old') {
        $('#end_date').val(`${year}-${month}-${day}`);

        var days = $(e).attr('data-date');
        endDate.setDate(endDate.getDate() - parseInt(days));

        var setMonth = endDate.getMonth() + 1;
        var setDays = endDate.getDate();

        if (setMonth < 10) {
            setMonth = '0' + setMonth;
        }
        if (setDays < 10) {
            setDays = '0' + setDays;
        }
        if (days == -1) {
            $('#end_date').val(`${year}-${month}-${setDays}`);
        }
        $('#str_date').val(`${endDate.getFullYear()}-${setMonth}-${setDays}`);

        endDate.setDate(endDate.getDate() + parseInt(days)); // 버튼 클릭 시 계속 더해지기 때문에 초기화
    }
    if (srcDate == 'recent') {
        getHistoryList();
    } else {
        getHistoryList(0);
    }
    $(e).siblings().removeClass('on');
    $(e).addClass('on');
}

function fn_back() {
    history.back();
}

function fn_logout(e) {
    let title = $(e).data('title');
    confirmModal({
        title: title,
        cancelUse: true,
        confirm: function () {
            alertLayerClose();
            let param = {};
            $.ajax({
                url: '/user/logout',
                type: 'post',
                data: JSON.stringify(param),
                contentType: 'application/json',
                success: function (data, status) {
                    let option = {
                        title: data.resultMsg,
                        confirm: function () {
                            alertLayerClose();
                            fn_location('/user/main');
                        },
                    };
                    confirmModal(option);
                },
            });
        },
    });
}

function fn_logoutChk() {
    $('.bgBlk').show();
    $('.bgBlk').css('z-index', 16);
    $('#logoutWrap').show();
}

function fn_logoutChk() {
    $('.bgBlk').show();
    $('.bgBlk').css('z-index', 16);
    $('#logoutWrap').show();
}

function fn_cancelLogout() {
    $('.bgBlk').hide();
    $('#logoutWrap').hide();
}

window.addEventListener('pageshow', function (event) {
    $('.loading').hide();
    // if (event.persisted) {
    //     console.log("history.back()으로 돌아왔습니다 (페이지가 캐시에서 로드됨)");
    // } else {
    //     console.log("새로 로드된 페이지입니다");
    // }
});
const basicConfirmText = '확인';
const basicCancelText = '취소';
function confirmModal(option) {
    // 현재 포커스 제거 (input 연타 방지)
    document.activeElement?.blur();
    let title = option.title ? option.title : '제목';
    let content = option.content ? `<p class="modalSubTit v2 mt10">${option.content}</p>` : '';
    let confirmText = option.confirmText ? option.confirmText : basicConfirmText;
    let cancelText = option.cancelText ? option.cancelText : basicCancelText;
    let cancelBtn = option.cancelUse ? `<button type="button" class="btnType btnSize btnLine" id="popCancelBtn">${cancelText}</button>` : '';
    let modalHtml = `
    <div id="alertLayer" class="popOverlay">
        <div class="popWrap">
            <div class="popInner">
                <div class="popCnt modal v2 type5">
                    <div class="tac">
                        <p class="modalTit">${title}</p>
                        ${content}
                    </div>
                    <div class="btnWrap">
                        ${cancelBtn}
                        <button type="button" class="btnType btnSize btnColor" id="popConfirmBtn">${confirmText}</button>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
    $('body').append(modalHtml);
    $('#popConfirmBtn').click(option.confirm ? option.confirm : alertLayerClose);
    $('#popCancelBtn').click(option.cancel ? option.cancel : alertLayerClose);
}

function alertLayerClose() {
    $('[id^=alertLayer]').remove();
}

function popLayerClose() {
    $('[id^=popLayer]').addClass('popClose');
    $('select.popInfo option').eq(0).prop('selected', true);
    $('input.popInfo, textarea.popInfo').val('');
}

function fn_location(page, type) {
    if (page == '' || page == null || page == undefined || page == 'undefined') {
        let option = {
            title: '준비중입니다.',
        };
        confirmModal(option);
    } else {
        fn_showLoading();
        location.href = page;
    }
}

function fn_showLoading() {
    if (userAgent.toLowerCase().indexOf('payapp') > -1 || userAgent.toLowerCase().indexOf('iosapp') > -1) {
    } else {
        $('.loading').show();
    }
}

function fn_getCategoryInfo() {
    $.ajax({
        url: '/user/ajax/selectMenuInfo',
        type: 'post',
        data: JSON.stringify({}),
        contentType: 'application/json',
        success: function (data, status) {
            const obj = {
                value: data.data,
                expire: Date.now() + 600 * 1000,
            };
            const objString = JSON.stringify(obj);
            window.localStorage.setItem('categoryInfo', objString);
            categoryInfo = JSON.parse(window.localStorage.getItem('categoryInfo'));
            fn_setCategoryMenu(categoryInfo.value);
        },
    });
}

function fn_setCategoryMenu(data) {
    const data2 = data;
    if (!data) return;
    let str = '';
    let str2 = '';
    let lang = getCookie('lang');
    for (i = 0; i < data.length; i++) {
        let item = data[i];
        let item2 = data;
        let title = item.name;
        if (lang != null && lang != 'ko' && lang != '') {
            if (lang == 'en') {
                title = item.name_en;
            }
            if (lang == 'zh') {
                title = item.name_zh;
            }
        }
        for (k = 0; k < item2.length; k++) {
            if (item.seq == item2[k].upper_seq) {
                let cat_name = item2[k].name;
                let cat_name_en = item2[k].name_en;
                let cat_name_zh = item2[k].name_zh;
                if (lang != null && lang != 'ko' && lang != '') {
                    if (lang == 'en') {
                        cat_name = cat_name_en;
                    }
                    if (lang == 'zh') {
                        cat_name = cat_name_zh;
                    }
                }
                str2 = str2 + `<li><a href="javascript:;" onclick="fn_location('${item2[k].url}');" title="${cat_name}">${cat_name}</a></li>`;
            }
        }
        if (item.upper_seq == '0') {
            // yolo 제외
            let tempStr = `<div class="menu_accordion">
                <div>
                    <button>${title}</button>
                </div>
                <ul>
                    ${str2}
                </ul>
            </div>`;

            str = str + tempStr;
            str2 = '';
        }
    }
    $('.menu .menu_group').empty();
    $('.menu .menu_group').append(str);
}

function fn_goHanpass() {
    var varUA = navigator.userAgent.toLowerCase();
    if (varUA.indexOf('payapp') > -1) {
        Android.goLink('https://pay.aitc.or.kr/externalLink.do?paramlink=https://hanpassapp.page.link?amv=193&apn=com.hanpass.remittance&efr=1&ibi=com.hanpass.remit&imv=3.1.0&isi=1344407760&link=https%3A%2F%2Fwww.hanpass.com%2F%3Ffriend%3DHRC2');
    } else {
        fn_location('https://hanpassapp.page.link?amv=193&apn=com.hanpass.remittance&efr=1&ibi=com.hanpass.remit&imv=3.1.0&isi=1344407760&link=https%3A%2F%2Fwww.hanpass.com%2F%3Ffriend%3DHRC2');
    }
}

function fn_openAddrSearch(addrId, zipId) {
    $('#popLayerAddr').removeClass('popClose');
    let width = '500';

    const element_layer = document.getElementById('addrSearch');

    new kakao.Postcode({
        width: width,
        oncomplete: function (data) {
            // 조회된 주소 정보를 화면에 표시

            let selectedType = data.userSelectedType;
            let address = selectedType == 'R' ? data.roadAddress : data.jibunAddress;
            let buildingName = data.buildingName;
            address += buildingName == '' ? '' : ' (' + buildingName + ')';
            let zip = data.zonecode;

            $('#' + addrId).val(address);
            $('#' + zipId).val(zip);

            $('#' + addrId + '_detail').focus();

            fn_addrSearchClose();
        },
    }).embed(element_layer);
}
/*
const openModal = (title, content) => {
    const modalHtml = `
        <div class="dolbom-modal" data-modal="terms" aria-hidden="false">
            <div class="dolbom-modal__backdrop" onclick="this.parentElement.remove()"></div>
            <section class="dolbom-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="dolbom-modal-title">
                <header class="dolbom-modal__header">
                    <h3 class="dolbom-modal__title" id="dolbom-modal-title">${title}</h3>
                    <button class="dolbom-modal__close" type="button" aria-label="창 닫기" onclick="this.closest('.dolbom-modal').remove()">
                            <span
                              class="dolbom-modal__close--icon"
                              data-icon-name="close_small"
                              aria-hidden="true"
                            ></span>
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
*/

function returnErrorCode(xhr, status, error) {
    if (xhr.status === 403) {
        confirmModal({ title: '권한이 없습니다.' });
    } else if (xhr.status === 500) {
        confirmModal({ title: '서버 내부 오류가 발생했습니다.' });
    } else {
        confirmModal({ title: '네트워크 오류가 발생했습니다.' });
    }
}

// formmating
function salaryOnInput(input) {
    input.value = formatSalaryValue(input.value);
}
// 연봉 세자리 마다 , 입력
function formatSalaryValue(val) {
    if (val === undefined || val === null) return '';
    let value = String(val);
    value = value.replace(/[^0-9]/g, '');
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}



// validation
function fn_validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}
function fn_validatePhone() {
    $('#resumePhone')
        .off('input')
        .on('input', function () {
            $(this).val(fn_formatPhoneNumber($(this).val()));
        });
}
