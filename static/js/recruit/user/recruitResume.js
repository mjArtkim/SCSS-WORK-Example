let isModify = false;
let g_jobTypeModalContext = '';
const selectedJobCategory = {
    jobUpperName: '',
    jobUpperCode: '',
    jobUpperSeq: '',
    jobLowerName: '',
    jobLowerCode: '',
    jobLowerSeq: '',
};
const hopeSelectedJobCategory = [];
// ================================================
function fn_getCommonCode(url, param, targetId, errorTitle) {
    $.ajax({
        url: url,
        data: JSON.stringify(param),
        type: 'POST',
        contentType: 'application/json',
        beforeSend: function () {
            $('.loading').show();
        },
        success: function (res) {
            if (res.resultCd === 'S' || (res.result && res.result.resultCd === 'S')) {
                const data = res.data || (res.result && res.result.data);
                if (data) {
                    let optionHtml = '';
                    data.forEach((item) => {
                        optionHtml += `<option value="${item.seq}" data-code="${item.code}" data-name="${item.name}">${item.name}</option>`;
                    });
                    $(targetId).append(optionHtml);
                }
            } else {
                const msg = res.resultMsg || (res.result && res.result.resultMsg);
                alert(msg || '데이터를 불러오는 데 실패했습니다.');
            }
        },
        error: function () {
            confirmModal({ title: errorTitle || '오류가 발생했습니다.' });
        },
        complete: function () {
            $('.loading').hide();
        },
    });
}
function fn_getEduCode() {
    fn_getCommonCode('/recruit/user/ajax/getEduCode', { groupCode: 'EDUCATION_TYPE' }, '#educationSelect', '[학력] 학교 분류 코드 불러오기 오류발생');
}
function fn_getMajorCode() {
    fn_getCommonCode('/recruit/user/ajax/getMajorCode', { groupCode: 'MAJOR_CATEGORY' }, '#majorSelect', '[학력] 전공 코드 불러오기 오류발생');
}
function fn_getSalaryCode() {
    fn_getCommonCode('/recruit/user/ajax/getSalaryCode', { groupCode: 'SALARY' }, '#salarySelect', '[희망근무] 연봉 코드 불러오기 오류발생');
}
function fn_getResignReason() {
    fn_getCommonCode('/recruit/user/ajax/getResignReason', { groupCode: 'RESIGN_REASON' }, '#resignReasonSelect', '[경력] 퇴사 사유 불러오기 오류발생');
}
function fn_getJobType() {
    fn_getCommonCode('/recruit/user/ajax/getJobType', { groupCode: 'JOB_TYPE' }, '#jobTypeSelect', '[경력] 근무 형태 불러오기 오류발생');
}
function fn_getEduAreaCode() {
    fn_getCommonCode('/recruit/user/ajax/getAreaCode', { upperCode: 0 }, '#eduAreaSelect', '[학력] 지역 코드 불러오기 오류발생');
}
function fn_getAreaCode() {
    fn_getCommonCode('/recruit/user/ajax/getAreaCode', { upperCode: 0 }, '#areaSelect', '[경력] 지역 코드 불러오기 오류발생');
}
function fn_getHopeAreaCode() {
    fn_getCommonCode('/recruit/user/ajax/getAreaCode', { upperCode: 0 }, '#hopeAreaUpperSelect', '[희망근무] 지역 코드 불러오기 오류발생');
}
function fn_setEduCurrentStatus(val) {
    const statusNum = Number(val);

    switch (statusNum) {
        case 1:
            return '수료';
        case 2:
            return '재학';
        case 3:
            return '졸업';
        case 4:
            return '휴학';
        case 5:
            return '중퇴';
        default:
            return '';
    }
}
function fn_setPassed(val) {
    const statusNum = Number(val);

    switch (statusNum) {
        case 1:
            return '최종합격';
        case 2:
            return '필기합격';
        case 3:
            return '실기합격';
        case 4:
            return '1차합격';
        case 5:
            return '2차합격';
        default:
            return '';
    }
}
function fn_setYearMonth(val) {
    if (!val) return '';
    let dateStr = String(val).replace(/\s/g, '');
    if (dateStr.length === 6 && /^[0-9]+$/.test(dateStr)) {
        return dateStr.replace(/(\d{4})(\d{2})/, '$1.$2');
    }
    return dateStr;
}
/**
 * 휴대폰 번호 포맷팅 통합 함수
 * @param {string} val - 숫자만 포함되거나 하이픈이 섞인 문자열
 * @returns {string} - 하이픈이 적용된 번호
 */
function fn_formatPhoneNumber(val, id) {
    if (!val) return '';

    let result = '';
    const clean = val.replace(/[^0-9]/g, '');
    const len = clean.length;

    if (len < 4) {
        return clean;
    } else if (len < 7) {
        result = clean.replace(/(\d{3})(\d{1,})/, '$1-$2');
    } else if (len < 11) {
        // 10자일 때 (예: 010-123-4567)
        result = clean.replace(/(\d{3})(\d{3})(\d{1,})/, '$1-$2-$3');
    } else {
        // 11자 이상일 때 (예: 010-1234-5678)
        result = clean.replace(/(\d{3})(\d{4})(\d{1,})/, '$1-$2-$3');
    }
    $('#'+id).val(result);
}
/**
 * 19900101 -> 1990.01.01
 * @param {number} val
 */
function fn_formattingBirth(val, id) {
    if (val && val.length === 8) {
        const formattedBirth = val.replace(/(\d{4})(\d{2})(\d{2})/, '$1.$2.$3');
        $('#'+id).val(formattedBirth);
    } else {
        $('#'+id).val('0000.00.00');
    }
}
function fn_formattingAddr(val, id) {
    if (!val) return;
    const addr = val.addr;
    const addrDetail = val.addr_detail;
    const $addressInput = $('#'+id);

    if (addr || addrDetail) {
        const fullAddress = [addr, addrDetail].filter(Boolean).join(' ');
        $addressInput.val(fullAddress);
    } else {
        $addressInput.val('');
        $addressInput.attr('placeholder', '주소를 입력해주세요');
    }
}
function fn_setUserInfoData(data){
    fn_formattingBirth(data.birYMD, 'resumeBirth');
    fn_formatPhoneNumber(data.contact, 'resumePhone');
    fn_formattingAddr(data, 'resumeAddress');
}
$(function () {
    if (res && res.resultCd === 'F') {
        const targetUrl = encodeURIComponent('/recruit/user/recruitResume');
        openAlert('알림', res.resultMsg || '로그인이 필요한 서비스입니다.', '확인', false, '', function () {
            location.href = '/login?redirectPage=' + targetUrl;
        });
        return;
    }

    if (resumeVo && resumeVo.seq) {
    } else {
        $('.re-resume__add-list').hide();
        $('.re-resume__done-list').hide();
        $('.re-resume__empty').show();
    }

    fn_getHopeAreaCode();
    fn_getEduAreaCode();
    fn_getAreaCode();
    fn_getJobType();
    fn_getResignReason();
    fn_getSalaryCode();
    fn_getMajorCode();
    fn_getEduCode();

    fn_setUserInfoData(userInfo)
});
// ================================================
function fn_getJobCode(type, code) {
    const param = {};
    if (type === 'init') {
        param.upperCode = 0;
    } else {
        param.upperCode = code;
    }
    $.ajax({
        url: '/recruit/user/ajax/getJobCode',
        data: JSON.stringify(param),
        type: 'POST',
        contentType: 'application/json',
        beforeSend: function (xhr) {
            $('.loading').show();
        },
        success: function (res) {
            if (res.resultCd === 'S') {
                fn_settingCategory(type, res.data);
            } else if (resultCd === 'F') {
                alert(res.resultMsg);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            confirmModal({ title: '직종 불러오기 오류발생' });
        },
        complete: function () {
            $('.loading').hide();
        },
    });
}
function fn_settingCategory(type, data) {
    if (type === 'init') {
        const categoryHtml = 
            data.map((item) => `
                <button type="button" class="re-resume-jobtype-modal__option upper_code" data-code="${item.code}" data-name="${item.name}" data-seq="${item.seq}">
                    ${item.name}
                </button>
            `).join('');

        $('#hope-work-jobtype-category-list').empty().append(categoryHtml);
    } else {
        const detailHtml = 
            data.map((item) => `
                <button type="button" class="re-resume-jobtype-modal__option lower_code" data-code="${item.code}" data-name="${item.name}" data-detail="${item.name}" data-seq="${item.seq}">
                    ${item.name}
                </button>
            `).join('');
        $('#hope-work-jobtype-detail-list').empty().append(detailHtml);
    }
}

// 이력서 첫 등록시 추가 버튼 클릭했을 때 
$(document).on('click', '.re-resume__add-btn', function(e){
    let $section = $(this).closest('.re-resume__block');
    $section.find('.re-resume__empty').hide();
    $section.find('.re-resume__add-list').show();
});

// 이력서 section 취소 버튼 클릭했을 때 
$(document).on('click', '.re-resume-add__box--cancel', function(e){
    let $section = $(this).closest('.re-resume__block');
    $section.find('.re-resume__empty').show();
    $section.find('.re-resume__add-list').hide();
});

$(document).on('click', '.re-resume-add__box--save', function(e){
    // section 별 validation 필요 
    let $section = $(this).closest('.re-resume__block');
    let sectionKey = String($section.attr('id'));
    let tempIdx = sectionKey.lastIndexOf('-');
    sectionKey = sectionKey.substring(tempIdx + 1);
    
    console.log('현재 섹션 ID 키워드: ', sectionKey);
    
    let $form = $(this).closest('.re-resume-add');

    let validationDateRangeRes = false;

    const eduInfo = {};
    if(sectionKey === 'education'){
        eduInfo.schoolName = $form.find('[name="schoolName"]').val().trim();
        eduInfo.eduStatus = $form.find('[name="eduStatus"]').val().trim();
        eduInfo.eduCurrentStatus = $form.find('[name="eduCurrentStatus"]').val().trim();
        eduInfo.eduSchoolType = $form.find('[name="eduSchoolType"]').val().trim();
        eduInfo.eduSchoolArea = $form.find('[name="eduSchoolArea"]').val().trim();
        eduInfo.eduMajorType = $form.find('[name="eduMajorType"]').val().trim();
        eduInfo.eduDegree = $form.find('[name="eduDegree"]').val().trim();
        eduInfo.totalScore = $form.find('[name="totalScore"]').val().trim();
        eduInfo.eduTotalScore = $form.find('[name="eduTotalScore"]').val().trim();
        eduInfo.startDt = $form.find('[name="eduStartDate"]').val().trim();
        eduInfo.endDt = $form.find('[name="eduGradDate"]').val().trim();

        // if(!eduInfo.schoolName){
        //     alert('학교명을 입력해주세요.');
        //     $form.find('[name="schoolName"]').focus();
        //     return false;
        // }

        // validationDateRangeRes = validateDateRange(eduInfo.startDt, eduInfo.endDt, '입학일자', '졸업일자')
        // if(validationDateRangeRes){
        //     $form.find('[name="eduGradDate"]').focus();
        //     return false;
        // }
        $section.find(".re-resume__add-list").hide();
        $section.find(".re-resume__done-list").html("<li>학력 저장 완료</li>").show();
        $section.find(".re-resume__empty").hide();
    }

    const careerInfo = {};
    if(sectionKey === 'career'){
        careerInfo.isWorking = $form.find('input[name="career_type is-working"]:checked').val().trim() || '';
        careerInfo.companyName = $form.find('[name="companyName"]').val().trim();
        careerInfo.department = $form.find('[name="department"]').val().trim();
        careerInfo.salaryValue = $form.find('[name="salaryValue"]').val().trim();
        careerInfo.startDt = $form.find('.career-start-date').val().trim();
        careerInfo.endDt = $form.find('.career-end-date').val().trim();
        careerInfo.description = $form.find('[name="descriptionValue"]').val().trim();
        careerInfo.resumeSeq = typeof resumeSeq !== 'undefined' ? resumeSeq : ''; 

        if(!careerInfo.companyName){
            alert('회사명을 입력해주세요.');
            $form.find('[name="companyName"]').focus();
            return false;
        }

        validationDateRangeRes = validateDateRange(careerInfo.startDt, careerInfo.endDt, '입사일', '퇴사일')
        if(!validationDateRangeRes){
            $form.find('[name="carEndDate"]').focus();
            return false;
        }
    }

    const certificateInfo = {};
    if(sectionKey === 'certificate') {
        certificateInfo.licenseName = $form.find('[name="licenseName"]').val().trim();
        certificateInfo.issuingAgency = $form.find('[name="agencyName"]').val().trim();
        certificateInfo.acquiredDt = $form.find('[name="licAcquiredDate"]').val().trim(); 
        certificateInfo.isPassed = $form.find('.lic-is-passed').val();

        if(!certificateInfo.licenseName){
            alert('자격증이름을 입력해주세요.');
            $form.find('[name="licenseName"]').focus();
            return false;
        };
    }

    const activityInfo = {};
    if(sectionKey === 'activity'){
        activityInfo.activityName = $form.find('[name="activityName"]').val().trim();
        activityInfo.organization = $form.find('.act-organization').val().trim();
        activityInfo.startDt = $form.find('[name="actStartDate"]').val().trim()
        activityInfo.endDt = $form.find('[name="actEndDate"]').val().trim();
        activityInfo.description = $form.find('[name="activityContent"]').val().trim();

        if(!activityInfo.activityName){
            alert('활동명을 입력해주세요.');
            $form.find('[name="activityName"]').focus();
            return false;
        };

        validationDateRangeRes = validateDateRange(activityInfo.startDt, activityInfo.endDt, '교육시작기간', '교육종료기간')
        if(!validationDateRangeRes){
            $form.find('[name="actEndDate"]').focus();
            return false;
        }
    }

    const introductionInfo = {};
    if(sectionKey === 'introduction'){
        introductionInfo.introductionTitle = $form.find('[name="introductionTitle"]').val().trim();
        introductionInfo.introductionContent = $form.find('[name="introductionContent"]').val().trim();

        if(!introductionInfo.introductionTitle){
            alert('자기소개서 제목을 입력해주세요.');
            $form.find('[name="introductionTitle"]').focus();
            return false;
        };

        if(!introductionInfo.introductionContent){
            alert('자기소개서 내용을 입력해주세요.');
            $form.find('[name="introductionContent"]').focus();
            return false;
        };
    }

    console.log(' saveData ')
    console.log( eduInfo )
    console.log( careerInfo )
    console.log( certificateInfo )
    console.log( activityInfo )
    console.log( introductionInfo )

});
function validateDateRange(startDt, endDt, startLabel, endLabel) {
    if(startDt && endDt){
        if(startDt.length !== 6 || endDt.length !== 6){
            alert('날짜는 YYYYMM 형식으로 입력해주세요.');
            return false;
        }
        const start = Number(startDt);
        const end = Number(endDt);
        if(end < start){
            alert(`${endLabel}은(는) ${startLabel}보다 빠를 수 없습니다.`);
            return false;
        }
    }
    return true;
}

$(document).on('blur', '[name="eduGradDate"]', function() {
    let $form = $(this).closest('.re-resume-add');
    
    let startDateVal = $form.find('[name="eduStartDate"]').val().trim();
    let gradDateVal = $(this).val().trim();

    if (startDateVal.length === 6 && gradDateVal.length === 6) {
        if (parseInt(gradDateVal, 10) < parseInt(startDateVal, 10)) {
            alert('졸업일자가 입학일자보다 빠릅니다. 다시 확인해주세요.');
            $(this).val('').focus();
        }
    }
});
function toggleInputState($target, isDisabled) {
    if (isDisabled) {
        $target.val('');
        $target.prop('disabled', true);
        $target.css('background-color', '#f5f5f5');
    } else {
        $target.prop('disabled', false);
        $target.css('background-color', '#fff');
    }
}
// 학력 입력시 재학중, 휴학중일 경우 졸업일자 비활성화 
$(document).on('change', '.edu-select-current-status', function () {
    const status = $(this).val();
    const $gradDateInput = $(this).closest('.re-resume-add').find('[name="eduGradDate"]');
    const isDisabled = (status === '2' || status === '4');
    toggleInputState($gradDateInput, isDisabled);
});
// 경력 입력시 재직중 선택하면 퇴사일 비활성화
$(document).on('change', 'input[name="career_type is-working"]', function () {
    const value = $(this).val();
    const $endDateInput = $(this).closest('.re-resume-add').find('[name="carEndDate"]');
    const isDisabled = (value === '1');
    toggleInputState($endDateInput, isDisabled);
});
$(document).on('blur', '[name="licAcquiredDate"]', function() {
    let inputDateVal = $(this).val().trim();
    if (inputDateVal.length === 6) {
        const today = new Date();
        const todayYYYYMM = parseInt(today.getFullYear() + String(today.getMonth() + 1).padStart(2, '0'), 10);
        const intInputDate = parseInt(inputDateVal, 10);
        if (intInputDate > todayYYYYMM) {
            alert('취득일자는 오늘 날짜 이후로 입력할 수 없습니다.');
            $(this).val('').focus();
            return false;
        }
    }
});

// 직종선택 모달 
let $currentJobTypeBtn = null;
function fn_openJobTypeModal(context) {
    $('#hope-work-jobtype-modal').prop('hidden', false).addClass('is-open');
    g_jobTypeModalContext = context;
    $currentJobTypeBtn = $(window.event.currentTarget); // 현재 어느 section에서 '직종선택' 버튼을 선택했는지 기억 
    $('#hope-work-jobtype-selected').empty();
    $('#hope-work-jobtype-category-list').empty();
    $('#hope-work-jobtype-detail-list').empty();
    $('#hope-work-jobtype-modal-title').text(g_jobTypeModalContext === 'hopeWork' ? '희망 직종 선택' : '경력 직종 선택');
    fn_getJobCode('init');
}

$(document).on('click', '.upper_code', function () {
    $('.upper_code').removeClass('is-active');
    $(this).addClass('is-active');

    const code = $(this).data('code');
    const seq = $(this).data('seq');
    const name = $(this).data('name');

    selectedJobCategory.jobUpperName = name;
    selectedJobCategory.jobUpperCode = code;
    selectedJobCategory.jobUpperSeq = seq;

    fn_getJobCode('', code);
});
$(document).on('click', '.lower_code', function () {
    $('.lower_code').removeClass('is-active');
    $(this).addClass('is-active');

    let upper = selectedJobCategory.jobUpperName;
    let lowerName = $(this).data('detail');
    let lowerCode = $(this).data('code');
    let lowerSeq = $(this).data('seq');
    let selectedText = upper + ' > ' + lowerName;

    if (g_jobTypeModalContext === 'hopeWork') {
    } else {
        selectedJobCategory.jobLowerName = lowerName;
        selectedJobCategory.jobLowerCode = lowerCode;
        selectedJobCategory.jobLowerSeq = lowerSeq;
        $('#hope-work-jobtype-selected').text(selectedText);
        $('#hope-work-jobtype-modal .re-resume-jobtype-modal__selected-label').text('선택 항목');
    }
});
// 직종 선택 모달 '선택하기' 버튼 클릭 
$(document).on('click', '#hope-work-jobtype-confirm', function (event) {
    event.preventDefault();
    const selectedText = $('#hope-work-jobtype-selected').text();
    const selectedCode = $('#hope-work-jobtype-selected').data('code') || '';
    if (selectedText === '') {
        alert('직무와 세부 직종을 선택해주세요.');
        return;
    }

    if (g_jobTypeModalContext === 'career') {
        if ($currentJobTypeBtn && $currentJobTypeBtn.length > 0) {
            $currentJobTypeBtn.find('span').text(selectedText);
            let $form = $currentJobTypeBtn.closest('.re-resume-add');
            $form.find('.re-resume-add__work-value').val(selectedCode);
        }

        $('#hope-work-jobtype-modal').prop('hidden', true);
        $currentJobTypeBtn = null;
    } else if (g_jobTypeModalContext === 'hopeWork') {
        fn_renderSelectList($('#hope-work-jobtype-list'), g_selectedHopeWorkJobTypeList);
        $('#hope-work-jobtype-input').val('');
    }

    fn_closeJobTypeModal();
});
$(document).on('click', '#hope-work-jobtype-modal [data-role="close"]', function (event) {
    $currentJobTypeBtn = null;
    fn_closeJobTypeModal();
});
function fn_closeJobTypeModal() {
    $('#hope-work-jobtype-modal').prop('hidden', true).removeClass('is-open');
}