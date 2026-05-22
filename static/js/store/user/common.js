
const pageHost = location.protocol + '//' + location.host;
let categoryInfo = window.localStorage.getItem('storeCategoryInfo');
let categoryInfoExpire = categoryInfo == null ? null : JSON.parse(categoryInfo).expire;
let sideMenuInfo = window.localStorage.getItem('sideMenuInfo');
let sideMenuExpire = sideMenuInfo == null ? null : JSON.parse(sideMenuInfo).expire;
let headMenuInfo = window.localStorage.getItem('headMenuInfo');
let headMenuExpire = headMenuInfo == null ? null : JSON.parse(headMenuInfo).expire;

$(function(){
    if(categoryInfoExpire < Date.now() || categoryInfoExpire == null){
        fn_getCategoryInfo();
    }else{
        fn_setCategoryMenu(JSON.parse(categoryInfo).value);
        fn_setSideMenu(JSON.parse(categoryInfo).value);
    }
})

$(function(){
    if(headMenuExpire < Date.now() || headMenuExpire == null){
        fn_getHeadMenuInfo();
    }else{
        fn_setHeadMenu(JSON.parse(headMenuInfo).value);
    }
})

$(document).keyup(function(e){
    if(e.keyCode == 13){
        let alert = $('#alertLayer');
        if(alert.length != 0) {
            $(document).find('#popConfirmBtn').click();
        }
    }
})

$(document).on('click', '.cartBtn', function (e) {
    let seq = $(this).data('seq');
    e.stopPropagation();
    cartPopupOpen(seq);
});

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

function fn_getCategoryInfo(){
    $.ajax({
        url : '/store/common/selectCategoryList',
        type : 'post',
        data : JSON.stringify({}),
        contentType : 'application/json',
        success : function(data, status) {
            const obj = {
                value : data.data,
                expire : Date.now() + 3600*1000
            }
            const objString = JSON.stringify(obj);
            window.localStorage.setItem("storeCategoryInfo", objString);
            categoryInfo = JSON.parse(window.localStorage.getItem('storeCategoryInfo'));
            fn_setCategoryMenu(categoryInfo.value);
            fn_setSideMenu(categoryInfo.value);
        }
    });
}

function fn_getHeadMenuInfo(){
    $.ajax({
        url : '/store/common/selectHeadMenuList',
        type : 'post',
        data : JSON.stringify({}),
        contentType : 'application/json',
        success : function(data, status) {
            const obj = {
                value : data.data,
                expire : Date.now() + 3600*1000
            }
            const objString = JSON.stringify(obj);
            window.localStorage.setItem("headMenuInfo", objString);
            headMenuInfo = JSON.parse(window.localStorage.getItem('headMenuInfo'));
            fn_setHeadMenu(headMenuInfo.value);
        }
    });
}

function fn_setCategoryMenu(data){
    let str = '';
    if(data.length == 0){
        str += `<li class="noItem on" style="color: #ADADAD;">등록된 카테고리가 없습니다.</li>`;
    }else{
        for(let i = 0; i < data.length; i ++ ){
            let cate = data[i];
            if(cate.dept == '1'){
                str += `<li onclick="fn_location('/store/user/product/productList/category/${cate.code}')">
                    <div>
                        <span>${cate.name}</span>`
                let subStr = '';
                for(let j = 0; j < data.length; j ++ ) {
                    let subCate = data[j];
                    if (cate.code == subCate.upperCode) {
                        subStr += subStr == '' ? `<div class="detailMenu"><ul>` : '';
                        subStr += `<li onclick="event.stopPropagation(); fn_location('/store/user/product/productList/category/${subCate.code}')">
                                  <span>${subCate.name}</span>
                               </li>`;
                    }
                }
                subStr += subStr == '' ? '' : '</ul></div>';
                str += subStr;
                str += `</div></li>`
            }
        }
    }
    $('.cateList ul').empty();
    $('.cateList ul').append(str);
}

function fn_setSideMenu(data){
    const data2 = data;
    if(!data) return;
    let str = '';
    let str2 = '';
    for(let i = 0; i < data.length; i ++ ){
        let item = data[i];
        let item2 = data;
        let title = item.name;

        if(item.upperCode == '0') {
            for (let k = 0; k < item2.length; k++) {
                if (item.code == item2[k].upperCode) {
                    let cat_name = item2[k].name;
                    str2 = str2 + `<li><a href="javascript:;" onclick="fn_location('/store/user/product/productList/category/${item2[k].code}');" title="${cat_name}">${cat_name}</a></li>`
                }
            }
            let tempStr = '';
            if (str2 == '') {
                tempStr = `<div class="menu_accordion" onclick="fn_location('/store/user/product/productList/category/${item.code}')">
                                <div>
                                    <button>${title}</button>
                                </div>
                            </div>`
            } else {
                tempStr = `<div class="menu_accordion">
                                <div>
                                    <button class="upperCategory">${title}</button>
                                </div>
                                <ul>
                                    ${str2}
                                </ul>
                            </div>`
            }
            str = str + tempStr;
            str2 = '';
        }
    }
    $('.menu .menu_group').html(str);
}

function fn_setHeadMenu(data){
    if(!data) return;
    let str = '';
    let lang = getCookie('lang');
    if(data.length > 0){
        for(i = 0; i < data.length; i ++ ){
            let item = data[i];
            let title = item.name;
            str += `<li><span onclick="fn_location('${item.url}')">${title}</span></li>`
        }
    }
    $('.hdrNav').html(str);
}


function fn_toTop(){
    $('html, body').animate({scrollTop:0}, 500);
}

function fn_location(page, type){
    if(page == '' || page == null || page == undefined || page == 'undefined'){
        let option={
            'title' : '준비중입니다.'
        }
        confirmModal(option);
    }else{
        $('.loading').show();
        location.href = page;
    }
}

function fn_logout(){
    confirmModal({'title' : '로그아웃 하시겠습니까?', 'cancelUse' : true, 'confirm' : function (){
            alertLayerClose();
            let param = {}
            $.ajax({
                url : '/user/logout',
                type : 'post',
                data : JSON.stringify(param),
                contentType : 'application/json',
                success : function(data, status) {
                    let option={
                        'title' : '로그아웃 되었습니다.',
                        'confirm' : function(){
                            alertLayerClose();
                            fn_location('/store/user/main');
                        }
                    }
                    confirmModal(option);
                }
            });
        }})
}


window.addEventListener('pageshow', function(event) {
    $('.loading').hide();
});

function confirmModal(option){
    // 현재 포커스 제거 (input 연타 방지)
    document.activeElement?.blur();
    let title = option.title ? option.title : '제목';
    let content = option.content ? `<p class="modalSubTit v2 mt10">${option.content}</p>` : '';
    let confirmText = option.confirmText ? option.confirmText : '확인';
    let cancelText = option.cancelText ? option.cancelText : '취소';
    let cancelBtn = option.cancelUse ?
        `<button type="button" class="btnType btnSize btnLine" id="popCancelBtn">${cancelText}</button>` : '';
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
                        <button type="button" class="btnType btnSize btnColor active1" id="popConfirmBtn">${confirmText}</button>
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

$(document).on('click','[id^=popLayer]',function(e){
    if($(e.target).hasClass('popOverlay')){
        popLayerClose()
    }
});

function userPopupReset(){
    $('.user_popup_wrap input[type=text]').val('')
    $('.user_popup_wrap input[type=range]').val(10)
    $('.user_popup_wrap input[type=file]').val('')
    $('.user_popup_wrap input[type=checkbox]').prop('checked', false)
    $('.user_popup_wrap select').prop("selectedIndex", 0)
    $('.user_popup_wrap textarea').val('')
}


function fn_productSearch(id){

    let searchVal = $('#'+id).val().trim();
    if(searchVal == ''){
        confirmModal({title:'검색어를 입력해주세요.'});
        return false;
    }
    searchVal = searchVal.replaceAll(' ','_');
    fn_location('/store/user/product/productList/search/'+searchVal);
}

function fn_productSearchKeyword(e){
    let searchVal = String($(e).data('keyword')).trim().replaceAll(' ','_');
    fn_location('/store/user/product/productList/search/'+searchVal);
}

function removeAllLocalStorageData(){
    window.localStorage.removeItem('userJwtToken');
    window.localStorage.removeItem('pinChk');
    window.localStorage.removeItem('pttrnChk');
    $.ajax({
        url : "/user/ajax/logout",
        data : {},
        type : 'POST',
        contentType : 'application/json',
        success : function(data) {
            if ( varUA.indexOf('payapp') > -1) {
                Android.delMemberSeq();
            }
        },
        error : function(jqXHR, textStatus, errorThrown) {
            confirmModal({title : textStatus});
        }
    })
}