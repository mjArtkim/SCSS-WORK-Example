// input 길이제한
function maxLengthCheck(object) {
    if (object.value.length > object.maxLength) {
        object.value = object.value.slice(0, object.maxLength);
    }
}

String.prototype.replaceAll = function (org, dest) {
    return this.split(org).join(dest);
};

// 한글 체크 정규식
function isKor(asValue) {
    var regExp = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
    return regExp.test(asValue); // 형식에 맞는 경우 true 리턴
}

// 영문 숫자 정규식
function isEnNumId(asValue) {
    var regExp = /^[a-z0-9_]{4,20}$/;
    return regExp.test(asValue); // 형식에 맞는 경우 true 리턴
}
// 영문 체크 정규식
function isEng(asValue) {
    var regExp = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
    return regExp.test(asValue); // 형식에 맞는 경우 true 리턴
}

// 숫자 체크 정규식
function isNum(asValue) {
    var regExp = /[0-9]/;
    return regExp.test(asValue); // 형식에 맞는 경우 true 리턴
}

// 특수문자 체크 정규식
function isSpecial(asValue) {
    var regExp = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&₩\\\=\(\'\"]/g;
    return regExp.test(asValue); // 형식에 맞는 경우 true 리턴
}

// 이메일 체크 정규식
function isEmail(asValue) {
    var regExp = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;
    return regExp.test(asValue); // 형식에 맞는 경우 true 리턴
}

// 핸드폰 번호 체크 정규식
function isCelluar(asValue) {
    var regExp = /^01(?:0|1|[6-9])-(?:\d{3}|\d{4})-\d{4}$/;
    return regExp.test(asValue); // 형식에 맞는 경우 true 리턴
}

function isCelluarNoBar(asValue) {
    var regExp = /^01(?:0|1|[6-9])(?:\d{3}|\d{4})\d{4}$/;
    return regExp.test(asValue); // 형식에 맞는 경우 true 리턴
}

//비밀번호 체크 정규식
function isPassword(asValue) {
    // var regExp = /^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z]{8,20}$/; //  8 ~ 20자 영문, 숫자 조합
    var regExp = /^(?=.*?[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{10,}$/; // 10자 특수문자, 영문, 숫자 조합
    return regExp.test(asValue); // 형식에 맞는 경우 true 리턴
}

// input 공백 제거
function rmBlank(e) {
    var txt = $(e).val().replace(/ /gi, '');
    $(e).val(txt);
}

// replace all
String.prototype.replaceAll = function (org, dest) {
    return this.split(org).join(dest);
};

// 3자리 콤마
function numberWithCommas(x) {
    return x
        .toString()
        .replace(/^0+(?!$)/, '')
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function fn_cardNum(num) {
    let cardNum = num.replace(/(.{4})(?=.)/g, '$1-');
    return cardNum;
}

function fn_contactNum(contact) {
    return contact.replace(/^(\d{0,3})(\d{0,4})(\d{0,4})$/g, '$1-$2-$3').replace(/\-{1,2}$/g, '');
}

function setCookie(key, value, expiredays) {
    let todayDate = new Date();
    todayDate.setDate(todayDate.getDate() + expiredays); // 현재 시각 + 일 단위로 쿠키 만료 날짜 변경
    //todayDate.setTime(todayDate.getTime() + (expiredays * 24 * 60 * 60 * 1000)); // 밀리세컨드 단위로 쿠키 만료 날짜 변경
    document.cookie = key + '=' + escape(value) + '; path=/; expires=' + expiredays + ';';
}

function getCookie(name) {
    var nameOfCookie = name + '=';
    var x = 0;
    while (x <= document.cookie.length) {
        var y = x + nameOfCookie.length;
        if (document.cookie.substring(x, y) == nameOfCookie) {
            if ((endOfCookie = document.cookie.indexOf(';', y)) == -1) endOfCookie = document.cookie.length;
            return unescape(document.cookie.substring(y, endOfCookie));
        }
        x = document.cookie.indexOf(' ', x) + 1;
        if (x == 0) break;
    }
    return '';
}

function deleteCookie(name) {
    document.cookie = name + '=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(
        atob(base64)
            .split('')
            .map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join('')
    );

    return JSON.parse(jsonPayload);
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0,
            v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
function removeEmojis(str) {
    const regex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
    return str.replace(regex, '');
}

// post 로 파라미터 이동
function postForm(path, params, method) {
    method = method || 'post';

    var form = document.createElement('form');
    form.setAttribute('method', method);
    form.setAttribute('action', path);

    for (var key in params) {
        if (params.hasOwnProperty(key)) {
            var hiddenField = document.createElement('input');
            hiddenField.setAttribute('type', 'hidden');
            hiddenField.setAttribute('name', key);
            hiddenField.setAttribute('value', params[key]);

            form.appendChild(hiddenField);
        }
    }

    document.body.appendChild(form);
    form.submit();
}

function filterNumber(e, event, type) {
    if (type == 'comma') {
        e.value = numberWithCommas(e.value.replace(/[^0-9]/g, ''));
    } else if (type == 'card') {
        e.value = fn_cardNum(e.value.replace(/[^0-9]/g, ''));
    } else {
        e.value = e.value.replace(/[^0-9]/g, '');
    }

    var code = event.keyCode;
    if ((code > 47 && code < 58) || (code > 95 && code < 106) || event.ctrlKey || event.altKey || code == 8 || code == 9 || code == 46) {
        return;
    }
    event.preventDefault();
    return false;
}

function filterSpecialChar(e, korUse = 'Y') {
    if (korUse == 'Y') {
        e.value = e.value.replace(/[^a-zA-Z0-9ㄱ-힣]/g, '');
    } else {
        e.value = e.value.replace(/[^a-zA-Z0-9]/g, '');
    }
}

function fn_percent(e, event, i, d) {
    e.value = e.value
        .toString()
        .replace(/(\.\d*?)\.+/g, '$1')
        .replace(/\./g, (match, offset) => (offset === e.value.toString().indexOf('.') ? '.' : ''));

    e.value = e.value.toString().replace(/[^\d.]/g, '');
    // 소수점을 기준으로 정수부와 소수부로 분리
    const splitData = e.value.split('.');
    splitData[0] = splitData[0].replace(/\b0(\d)\b/g, '$1');
    // 정수부는 최대 i 자리로 제한
    if (splitData[0].length > i) {
        splitData[0] = splitData[0].slice(0, i);
    }

    // 소수부는 최대 d 자리로 제한
    if (splitData[1] && splitData[1].length > d) {
        splitData[1] = splitData[1].slice(0, d);
    }
    // 다시 조합하여 형식에 맞는 문자열 생성
    e.value = splitData.length === 1 ? splitData[0] : splitData.join('.');

    // 값이 100보다 크면 100으로 고정
    if (parseFloat(e.value) > 100) {
        e.value = '100';
    }

    var code = event.keyCode;
    if ((code > 47 && code < 58) || (code > 95 && code < 106) || event.ctrlKey || event.altKey || code == 8 || code == 9 || code == 46 || code == 110 || code == 190) {
        return;
    }
    event.preventDefault();
    return false;
}

function hasFinalConsonant(string) {
    if (string.length === 0) {
        return false; // 빈 문자열인 경우 받침이 없다고 간주
    }

    const lastChar = string.charAt(string.length - 1);
    const code = lastChar.charCodeAt(0);

    // 한글의 유니코드 범위 확인
    if (code < 0xac00 || code > 0xd7a3) {
        return false; // 한글이 아닌 경우 받침이 없다고 간주
    }

    const offset = code - 0xac00;
    const finalConsonantIndex = offset % 28;

    return finalConsonantIndex !== 0;
}

function cartesianProduct(arr) {
    var result = [[]];
    for (var i = 0; i < arr.length; i++) {
        var temp = [];
        for (var j = 0; j < result.length; j++) {
            for (var k = 0; k < arr[i].length; k++) {
                temp.push(result[j].concat([arr[i][k]]));
            }
        }
        result = temp;
    }
    return result;
}

const userAgent = navigator.userAgent.toLowerCase();
let deviceType = 'pc';
if (userAgent.indexOf('iphone') > -1 || userAgent.indexOf('android') > -1) {
    deviceType = 'm';
}
$(window).scroll(function () {
    if (deviceType != 'pc') return false;
});

// 우편번호 검색
function fn_openAddrSearch() {
    let element_layer = document.getElementById('addrSearch');
    $('#popLayerAddr').prop('hidden', false).addClass('is-open').removeClass('popClose');
    let width = '500';
    if (deviceType == 'm') {
        width = window.innerWidth * 0.9;
    }
    new kakao.Postcode({
        width: width,
        oncomplete: function (data) {
            let selectedType = data.userSelectedType;
            let addr = selectedType == 'R' ? data.roadAddress : data.jibunAddress;
            let buildingName = data.buildingName;
            addr += buildingName == '' ? '' : ' (' + buildingName + ')';
            let zip = data.zonecode;
            $('#addr').val(addr);
            $('#zip').val(zip);
            fn_addrSearchClose();
        },
    }).embed(element_layer);
}
function fn_addrSearchClose() {
    $('#detailAddr').focus();
    $('#popLayerAddr').addClass('popClose');
}
