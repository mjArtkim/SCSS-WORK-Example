let isModify = false;
let modifyEduList = [];
let modifyCareerList = [];
let modifyLicenseList = [];
let modifyActivityList = [];
let modifyIntroductionList = [];
let modifyHopeworkInfo = {};

let resultCd = '';
let resultMsg = '';
let g_jobTypeModalContext = '';

const eduInfoList = [];
const careerInfoList = [];
const licenseInfoList = [];
const activityInfoList = [];
const introductionInfoList = [];

const selectedJobCategory = {
    jobUpperName: '',
    jobUpperCode: '',
    jobUpperSeq: '',
    jobLowerName: '',
    jobLowerCode: '',
    jobLowerSeq: '',
};
const hopeSelectedJobCategory = [];

const selectedAreaCategory = {
    areaUpperName: '',
    areaUpperCode: '',
    areaLowerName: '',
    areaLowerCode: '',
};
const hopeSelectedAreaCategory = [];

function fn_resumeInsertValidation() {
    const resumeTitle = $('#resumeTitle').val();
    if (!resumeTitle.trim()) {
        alert('이력서 제목을 입력하세요');
        $('#resumeTitle').focus();
        return null;
    }

    const resumeEmail = $('#resumeEmail').val();
    if (!resumeEmail) {
        alert('이메일을 입력해주세요.');
        $('#resumeEmail').focus();
        return null;
    } else if (!fn_validateEmail(resumeEmail)) {
        alert('올바른 이메일 형식이 아닙니다. (예: example@mail.com)');
        $('#resumeEmail').focus();
        return null;
    }

    const resumePhone = $('#resumePhone').val();
    if (!resumePhone) {
        alert('휴대폰 번호를 입력해주세요.');
        $('#resumePhone').focus();
        return null;
    }

    const addr = $('#addr').val();
    const detailAddr = $('#detailAddr').val();
    const zip = $('#zip').val();

    if (!resumeEmail.trim()) {
        alert('이메일을 입력해주세요.');
        $('#resumeEmail').focus();
        return null;
    }

    if (!resumePhone.trim()) {
        alert('휴대폰 번호를 입력해주세요.');
        $('#resumePhone').focus();
        return null;
    }

    if (!addr.trim()) {
        alert('주소를 입력해주세요.');
        $('#addr').focus();
        return null;
    }

    const param = {
        writerSeq: userInfo.seq,
        resumeTitle: resumeTitle,
        useYn: 'Y',
        personalInfo: {
            userSeq: userInfo.seq,
            userPhone: resumePhone.replace(/-/g, ''),
            userMail: resumeEmail,
            userAdd: addr,
            userAddDetail: detailAddr,
            userZipCode: zip,
            useYn: 'Y',
            isUpdated: isModify,
        },
    };

    return param;
}
function fn_insertResume() {
    const param = fn_resumeInsertValidation();
    if (isModify) {
        param.resumeSeq = $('#updateResumeSeq').val();

        param.educationList = modifyEduList;
        param.careerList = modifyCareerList;
        param.licenseList = modifyLicenseList;
        param.activityList = modifyActivityList;
        param.introduceList = modifyIntroductionList;
    } else {
        // 유효성 검사 실패 시(null 반환 시) 프로세스 중단
        if (!param) return;

        param.educationList = eduInfoList;
        param.careerList = careerInfoList;
        param.licenseList = licenseInfoList;
        param.activityList = activityInfoList;
        param.introduceList = introductionInfoList;

        // 연봉 데이터 처리 (쉼표 제거 후 숫자만)
        param.careerList.forEach((item) => {
            if (item.salaryValue) {
                item.salaryValue = item.salaryValue.replace(/,/g, '');
            }
        });

        // 희망근무조건
        const currentHopeWork = fn_getSectionFormData('hopeWork');
        const validCurrentData = {};
        Object.keys(currentHopeWork).forEach((key) => {
            const val = currentHopeWork[key];
            if (val !== null && val !== undefined && val !== '' && val !== 'null') {
                validCurrentData[key] = val;
            }
        });
        const rawData = Object.assign({}, validCurrentData);

        // 1) 다중 근무지역 데이터 처리 (List<DesiredArea> 매핑용)
        const desiredAreaList = [];
        if (rawData.workAreaCodeList && rawData.workAreaCodeList.length > 0) {
            rawData.workAreaCodeList.forEach((item) => {
                desiredAreaList.push({
                    parentAreaSeq: Number(item.areaUpperSeq),
                    childAreaSeq: item.areaLowerSeq ? Number(item.areaLowerSeq) : null,
                });
            });
        }

        // 2) 다중 직종 데이터 처리 (List<DesiredJob> 매핑용)
        const desiredJobList = [];
        if (rawData.jobTypeCodeList && rawData.jobTypeCodeList.length > 0) {
            rawData.jobTypeCodeList.forEach((item) => {
                desiredJobList.push({
                    parentJobSeq: Number(item.jobUpperSeq),
                    childJobSeq: item.jobLowerSeq ? Number(item.jobLowerSeq) : null,
                });
            });
        }

        // 3) 최종 VO 구조에 결합
        const refinedHopeWork = {
            desiredSalary: Number(rawData.salaryValue || rawData.salary || 0),
            desiredEmploymentType: JSON.stringify([rawData.workType]),
            isSalaryPrivate: rawData.isSalaryPrivate === true || rawData.isSalaryPrivate === 'Y' ? 'Y' : 'N',
            desiredAreaList: desiredAreaList,
            desiredJobList: desiredJobList,
        };

        param.hopeworkInfo = refinedHopeWork;
    }

    const formData = new FormData();
    formData.append('resumeData', JSON.stringify(param));

    // 이미지 파일 추가 (input type="file"에서 가져옴)
    const fileInput = document.getElementById('resume-photo-file');
    if (fileInput.files.length > 0) {
        formData.append('uploadFile', fileInput.files[0]);
    }

    console.log('================ [최종 전송 데이터 확인] ================');

    console.log(param);
    // 임시저장
    //console.log("JSON 문자열 형태:", JSON.stringify(param, null, 2));
    console.log('======================================================');

    const alertTitle = isModify ? '이력서 수정 결과' : '이력서 등록 결과';
    let alertContent = '';
    $.ajax({
        url: '/recruit/user/ajax/resumeRegister',
        type: 'POST',
        enctype: 'multipart/form-data',
        data: formData,
        processData: false,
        contentType: false,
        dataType: 'json',
        beforeSend: function (xhr) {
            $('.loading').show();
        },
        success: function (res) {
            if (res.resultCd === 'S') {
                alertContent = res.resultMsg;
                console.log(' resume Register Success ');
                openAlert(alertTitle, alertContent, '확인', false, '', () => {
                    location.href = '/recruit/user/recruitMy';
                });
            } else {
                alertContent = alertContent || '이력서 등록 중 오류가 발생했습니다.';
                openAlert(alertTitle, res.resultMsg, '확인', false);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(' resume Register ERROR');
            openAlert(alertTitle, '서버와의 통신에 실패했습니다. 잠시 후 다시 시도해주세요.', '확인', false);
        },
        complete: function () {
            $('.loading').hide();
        },
    });
}
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
            resultCd = res.resultCd;
            resultMsg = res.resultMsg;
            if (resultCd === 'S') {
                fn_settingCategory(type, res.data);
            } else if (resultCd === 'F') {
                alert(resultMsg);
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
        const categoryHtml = data
            .map(
                (item) => `
            <button type="button" class="re-resume-jobtype-modal__option upper_code" data-code="${item.code}" data-name="${item.name}" data-seq="${item.seq}">
                ${item.name}
            </button>
        `
            )
            .join('');

        $('#hope-work-jobtype-category-list').empty().append(categoryHtml);
    } else {
        let selectedText = '';
        const detailHtml = data
            .map(
                (item) => `
            <button type="button" class="re-resume-jobtype-modal__option lower_code" data-code="${item.code}" data-name="${item.name}" data-detail="${item.name}" data-seq="${item.seq}">
                ${item.name}
            </button>
        `
            )
            .join('');
        $('#hope-work-jobtype-detail-list').empty().append(detailHtml);
    }
}
function fn_getJobTypeSelectedText() {
    const result = selectedJobCategory.jobUpperName + ' > ' + selectedJobCategory.jobLowerName;
    $('#hope-work-jobtype-selected').text(result);
}
function fn_openJobTypeModal(context) {
    $('#hope-work-jobtype-modal').prop('hidden', false).addClass('is-open');
    g_jobTypeModalContext = context;
    $('#hope-work-jobtype-selected').empty();
    $('#hope-work-jobtype-category-list').empty();
    $('#hope-work-jobtype-detail-list').empty();
    $('#hope-work-jobtype-modal-title').text(g_jobTypeModalContext === 'hopeWork' ? '희망 직종 선택' : '경력 직종 선택');
    fn_getJobCode('init');
}
function fn_closeJobTypeModal() {
    $('#hope-work-jobtype-modal').prop('hidden', true).removeClass('is-open');
}
function fn_setCareerJobTypeValue($target, value) {
    let selectedValue = fn_normalizeSingleJobType(value || '');
    let $button = $target.find('.re-resume-add__work--career-jobtype').first();
    let $label = $button.find('span').first();
    $target.find('.re-resume-add__work-value').val(selectedValue);
    $button.toggleClass('is-selected', !!selectedValue);
    $label.text(selectedValue || '직종선택');
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
// 수정하기 : 화면에 데이터 출력
function fn_initModifyMode(data) {
    console.log(' fn_initModifyMode isModify : ', data);
    $('#resumeTitle').val(data?.resumeTitle);
    $('#resumePhone').val(data?.personalInfo?.userPhone);
    $('#resumeEmail').val(data?.personalInfo?.userMail);
    $('#addr').val(data?.personalInfo?.userAdd);
    $('#detailAddr').val(data?.personalInfo?.userAddDetail);
    $('#zip').val(data?.personalInfo?.userZipCode);

    if (data.resumeUserImg) {
        const resumeUserImg = data.resumeUserImg;
        const $previewBox = $('#resume-photo-preview');
        const $deleteBtn = $('#resume-photo-delete');
        $('#resume-photo-placeholder').hide();
        $previewBox.find('img').remove();
        const $imgHtml = $('<img>', {
            id: 'resumeUserImg',
            src: resumeUserImg,
            alt: '이력서 사진',
            css: {
                width: '100%',
                height: '100%',
                'object-fit': 'cover',
                'border-radius': 'inherit',
            },
        });
        $previewBox.append($imgHtml);
        $('#resume-photo-file-name').val(resumeUserImg);
        $deleteBtn.prop('disabled', false);
    }

    if (data.educationList && data.educationList.length > 0) {
        const $doneList = $('#resume-section-education .re-resume__done-list');
        const $emptyMessage = $('#resume-section-education .re-resume__empty');

        $doneList.empty();
        $emptyMessage.hide();

        const eduList = data.educationList;
        modifyEduList = data.educationList;
        eduList.forEach((item) => {
            const eduInfo = { ...item };
            eduInfo.id = 'education-' + item.seq;
            const currentStatusText = fn_setEduCurrentStatus(item.currentStatus);
            eduInfo.summary = fn_makeSummary([fn_makePeriod(item.startDt, item.endDt, '재학기간'), currentStatusText, item.name]);
            const itemHtml = fn_getResumeHtml('education', eduInfo);
            if (itemHtml) {
                $doneList.append($(itemHtml));
            }
        });
    }

    if (data.careerList && data.careerList.length > 0) {
        const $doneList = $('#resume-section-career .re-resume__done-list');
        const $emptyMessage = $('#resume-section-career .re-resume__empty');

        $doneList.empty();
        $emptyMessage.hide();

        const careerList = data.careerList;
        modifyCareerList = data.careerList;
        careerList.forEach((item) => {
            const careerInfo = { ...item };
            careerInfo.id = 'career-' + item.seq;
            careerInfo.period = fn_setYearMonth(item.startDt) + ' ~ ' + fn_setYearMonth(item.endDt);
            careerInfo.salary = formatSalaryValue(item.salaryValue);
            careerInfo.workAreaName = item.locationName || ' ';
            careerInfo.resignationName = item.resignName;

            careerInfo.summary = item.jobLowerName + ' > ' + item.department + ' | ' + item.jobType;
            const itemHtml = fn_getResumeHtml('career', careerInfo);

            if (itemHtml) {
                $doneList.append($(itemHtml));
            }
        });
    }

    if (data.licenseList && data.licenseList.length > 0) {
        const $doneList = $('#resume-section-certificate .re-resume__done-list');
        const $emptyMessage = $('#resume-section-certificate .re-resume__empty');

        $doneList.empty();
        $emptyMessage.hide();

        const licenseList = data.licenseList;
        modifyLicenseList = data.licenseList;
        licenseList.forEach((item) => {
            const licenseInfo = { ...item };
            licenseInfo.id = item.seq;
            const isPassText = fn_setPassed(item.isPassed);
            const formattingDate = fn_setYearMonth(item.acquiredDt);
            licenseInfo.summary = isPassText + ' | ' + formattingDate;

            const itemHtml = fn_getResumeHtml('certificate', licenseInfo);

            if (itemHtml) {
                $doneList.append($(itemHtml));
            }
        });
    }

    if (data.activityList && data.activityList.length > 0) {
        const $doneList = $('#resume-section-activity .re-resume__done-list');
        const $emptyMessage = $('#resume-section-activity .re-resume__empty');

        $doneList.empty();
        $emptyMessage.hide();

        const activityList = data.activityList;
        modifyActivityList = data.activityList;
        activityList.forEach((item) => {
            const activityInfo = { ...item };
            activityInfo.id = item.seq;

            const startDt = fn_setYearMonth(item.startDt);
            const endDt = fn_setYearMonth(item.endDt);

            activityInfo.period = startDt + ' ~ ' + endDt;

            const itemHtml = fn_getResumeHtml('activity', activityInfo);

            if (itemHtml) {
                $doneList.append($(itemHtml));
            }
        });
    }

    if (data.introduceList && data.introduceList.length > 0) {
        const $doneList = $('#resume-section-introduction .re-resume__done-list');
        const $emptyMessage = $('#resume-section-introduction .re-resume__empty');

        $doneList.empty();
        $emptyMessage.hide();

        const introduceList = data.introduceList;
        modifyIntroductionList = data.introduceList;
        introduceList.forEach((item) => {
            const introduceInfo = { ...item };
            introduceInfo.id = item.seq;
            const itemHtml = fn_getResumeHtml('introduction', introduceInfo);
            if (itemHtml) {
                $doneList.append($(itemHtml));
            }
        });
    }

    if (data.hopeworkInfo) {
        const $doneList = $('#resume-section-hopeWork .re-resume__done-list');
        const $emptyMessage = $('#resume-section-hopeWork .re-resume__empty');

        $doneList.empty();
        $emptyMessage.hide();

        modifyHopeworkInfo = data.hopeworkInfo;

        // 근무형태 파싱 (["정규직"] -> "정규직")
        let workTypeStr = '-';
        if (modifyHopeworkInfo.desiredEmploymentType) {
            try {
                const types = JSON.parse(modifyHopeworkInfo.desiredEmploymentType);
                workTypeStr = Array.isArray(types) ? types.join(', ') : types;
            } catch (e) {
                workTypeStr = modifyHopeworkInfo.desiredEmploymentType;
            }
        }

        // 희망 지역 리스트
        let areaStr = '미지정';
        if (modifyHopeworkInfo.desiredAreaList && modifyHopeworkInfo.desiredAreaList.length > 0) {
            areaStr = modifyHopeworkInfo.desiredAreaList
                .map((area) => {
                    const parent = area.parentAreaName || '';
                    const child = area.childAreaName || '';
                    // 둘 다 있을 때는 한 칸 띄우고, 하나만 있으면 있는 것만 표시
                    return [parent, child].filter(Boolean).join(' ');
                })
                .join(', ');
        }

        // 희망 직무 리스트
        let jobStr = '미지정';
        if (modifyHopeworkInfo.desiredJobList && modifyHopeworkInfo.desiredJobList.length > 0) {
            jobStr = modifyHopeworkInfo.desiredJobList
                .map((job) => {
                    const parent = job.parentJobName || '';
                    const child = job.childJobName || '';
                    return [parent, child].filter(Boolean).join(' ');
                })
                .join(', '); // 여러 직무가 있으면 콤마로 연결
        }

        // 템플릿 함수(fn_getResumeHtml) 규격에 맞게 데이터 가공
        const hopeInfo = {
            id: 'hopeWork-' + modifyHopeworkInfo.seq,
            workArea: areaStr,
            jobType: jobStr,
            workType: workTypeStr,
            salaryName: modifyHopeworkInfo.desiredSalaryName || '회사내규에 따름',
        };

        // 기존 함수 호출 및 렌더링
        const itemHtml = fn_getResumeHtml('hopeWork', hopeInfo);

        if (itemHtml) {
            $doneList.append($(itemHtml));
        }
    }
}

$(function () {
    if (res && res.resultCd === 'F') {
        const targetUrl = encodeURIComponent('/recruit/user/recruitResume');
        openAlert('알림', res.resultMsg || '로그인이 필요한 서비스입니다.', '확인', false, '', function () {
            location.href = '/login?redirectPage=' + targetUrl;
        });
        return;
    }

    fn_validatePhone();
    fn_bindResumePhotoEvent();

    fn_formattingBirth(userInfo.birYMD);
    fn_formatPhoneNumber(userInfo.contact);
    fn_formattingAddr(userInfo);

    fn_getHopeAreaCode();
    fn_getEduAreaCode();
    fn_getAreaCode();
    fn_getJobType();
    fn_getResignReason();
    fn_getSalaryCode();
    fn_getMajorCode();
    fn_getEduCode();

    // ===
    const sectionKeyList = ['education', 'career', 'certificate', 'activity', 'introduction', 'hopeWork'];
    sectionKeyList.map((item, idx) => {
        fn_drawResumeSection(item);
    });

    if (resumeVo && resumeVo.seq) {
        isModify = true;
        $('#updateResumeSeq').val(updateResumeSeq);
        $('.re-resume__done-list').show();
        fn_initModifyMode(resumeVo);
        const currentPhone = $('#resumePhone').val();
        if (currentPhone) {
            $('#resumePhone').val(fn_formatPhoneNumber(currentPhone));
        }
    } else {
        $('.re-resume__add-list').hide();
        $('.re-resume__done-list').hide();
        //$('.re-resume__empty').hide();
        $('.re-resume__empty').show();
    }
});

// =======================
$(document).on('click', '#hope-work-jobtype-modal [data-role="close"]', function (event) {
    event.preventDefault();
    fn_closeJobTypeModal();
});
$(document).on('click', '.upper_code', function () {
    $('.upper_code').removeClass('is-active');
    $(this).addClass('is-active');

    const code = $(this).data('code');
    const seq = $(this).data('seq');
    selectedJobCode = code;

    const name = $(this).data('name');

    selectedJobCategory.jobUpperName = name;
    selectedJobCategory.jobUpperCode = code;
    selectedJobCategory.jobUpperSeq = seq;

    fn_getJobCode('', code);
});
$(document).on('click', '.lower_code', function () {
    event.preventDefault();

    $('.lower_code').removeClass('is-active');
    $(this).addClass('is-active');

    let upper = selectedJobCategory.jobUpperName || '미선택';
    let lowerName = $(this).data('name') || $(this).data('detail') || '';
    let lowerCode = $(this).data('code');
    let lowerSeq = $(this).data('seq');
    let selectedText = upper + ' > ' + lowerName;

    if (g_jobTypeModalContext === 'hopeWork') {
        let newJobCategory = {
            jobUpperName: selectedJobCategory.jobUpperName,
            jobUpperCode: selectedJobCategory.jobUpperCode,
            jobUpperSeq: selectedJobCategory.jobUpperSeq,
            jobLowerName: lowerName,
            jobLowerCode: lowerCode,
            jobLowerSeq: lowerSeq,
        };
        let selectedIndex = $.inArray(selectedText, g_selectedHopeWorkJobTypeList);

        if (selectedIndex > -1) {
            g_selectedHopeWorkJobTypeList.splice(selectedIndex, 1);
        } else {
            if (g_selectedHopeWorkJobTypeList.length >= 5) {
                alert('직종은 최대 5개까지 선택할 수 있습니다.');
                return;
            }
            g_selectedHopeWorkJobTypeList.push(selectedText);
            hopeSelectedJobCategory.push(newJobCategory);
        }
        let selectedCount = g_selectedHopeWorkJobTypeList.length;
        if (selectedCount > 0) {
            $('#hope-work-jobtype-selected').text(g_selectedHopeWorkJobTypeList.join(', '));
        } else {
            $('#hope-work-jobtype-selected').text('직무와 세부 직종을 선택해주세요.');
        }

        $('#hope-work-jobtype-modal .re-resume-jobtype-modal__selected-label').text('선택 항목 (' + selectedCount + '/5)');
    } else {
        selectedJobCategory.jobLowerName = lowerName;
        selectedJobCategory.jobLowerCode = lowerCode;
        selectedJobCategory.jobLowerSeq = lowerSeq;
        $('#hope-work-jobtype-selected').text(selectedText);
        $('#hope-work-jobtype-modal .re-resume-jobtype-modal__selected-label').text('선택 항목');
    }
});
$(document).on('change', '#hopeAreaUpperSelect', function () {
    const selectedUpperCode = String($(this).find('option:selected').data('code'));
    $('#hopeAreaLowerSelect').html('<option disabled selected>상세지역선택</option>');
    if (selectedUpperCode) {
        if (selectedUpperCode === '118000' || selectedUpperCode === '117000') {
            fn_addHopeWorkArea();
        } else {
            fn_getCommonCode('/recruit/user/ajax/getAreaCode', { upperCode: selectedUpperCode }, '#hopeAreaLowerSelect', '상세 지역 코드 불러오기 오류발생');
        }
    }
});
$(document).on('change', '#hopeAreaLowerSelect', function () {
    fn_addHopeWorkArea();
});
$(document).on('change', '.re-resume-add__label input[type="checkbox"]', function () {
    const isChecked = $(this).is(':checked');
    const $salarySelect = $('#salarySelect');

    if (isChecked) {
        $salarySelect.prop('disabled', true);
        $salarySelect.val($salarySelect.find('option:first').val());
    } else {
        $salarySelect.prop('disabled', false);
    }
});
$(document).on('change', 'input[name="career_type is-working"]', function () {
    const $endDateInput = $('#carEndDate');

    if ($(this).val() === '1') {
        $endDateInput.val('');
        $endDateInput.prop('disabled', true);
        $endDateInput.css('background-color', '#f5f5f5');
    } else {
        $endDateInput.prop('disabled', false);
        $endDateInput.css('background-color', '#fff');
    }
});
$(document).on('change', '.edu-select-current-status', function () {
    const status = $(this).val();
    const $gradDateInput = $('#eduGradDate');

    // 재학중(2) 또는 휴학중(4) 선택 시
    if (status === '2' || status === '4') {
        $gradDateInput.val(''); // 입력된 값 초기화
        $gradDateInput.prop('disabled', true); // 비활성화
        $gradDateInput.css('background-color', '#f5f5f5'); // 시각적 비활성화 표시
    } else {
        // 그 외 상태(수료, 졸업, 중퇴 등)는 활성화
        $gradDateInput.prop('disabled', false);
        $gradDateInput.css('background-color', '#fff');
    }
});
function fn_addHopeWorkArea() {
    let areaText = fn_getSelectText($('#hopeAreaUpperSelect'), '');
    let areaCode = fn_getValue($('#hopeAreaUpperSelect'), '');
    let detailText = fn_getSelectText($('#hopeAreaLowerSelect'), '');
    let detailCode = fn_getValue($('#hopeAreaLowerSelect'), '');
    const selectedUpperName = String($('#hopeAreaUpperSelect').find('option:selected').data('name'));
    const selectedUpperCode = String($('#hopeAreaUpperSelect').find('option:selected').data('code'));
    const selectedUpperSeq = String($('#hopeAreaUpperSelect').find('option:selected').val());
    const selectedLowerName = String($('#hopeAreaLowerSelect').find('option:selected').data('name'));
    const selectedLowerCode = String($('#hopeAreaLowerSelect').find('option:selected').data('code'));
    const selectedLowerSeq = String($('#hopeAreaLowerSelect').find('option:selected').val());

    let addText = '';
    let list = fn_getListArray($('#hope-work-area-list').find('li > div'));

    if (!areaText) return;

    const isSpecialArea = selectedUpperCode === '118000' || selectedUpperCode === '117000';

    if (!isSpecialArea && !detailText) {
        return;
    }

    if (isSpecialArea || !detailText) {
        addText = areaText;
    } else {
        addText = areaText + ' > ' + detailText;
    }

    const newAreaItem = {
        areaUpperName: selectedUpperName,
        areaUpperCode: selectedUpperCode,
        areaUpperSeq: selectedUpperSeq,
        areaLowerName: isSpecialArea ? '' : selectedLowerName,
        areaLowerCode: isSpecialArea ? '' : selectedLowerCode,
        areaLowerSeq: isSpecialArea ? '' : selectedLowerSeq,
    };
    const isAlreadyAdded = hopeSelectedAreaCategory.some((item) => item.areaUpperCode === newAreaItem.areaUpperCode && item.areaLowerCode === newAreaItem.areaLowerCode && item.areaLowerSeq === newAreaItem.areaLowerSeq);
    if (isAlreadyAdded) {
        $lower.prop('selectedIndex', 0);
        return;
    }

    if ($.inArray(addText, list) > -1) {
        $('#hopeAreaLowerSelect').prop('selectedIndex', 0);
        return;
    }

    if (list.length >= 5) {
        alert('근무지역은 최대 5개까지 추가할 수 있습니다.');
        $('#hopeAreaLowerSelect').prop('selectedIndex', 0);
        return;
    }

    hopeSelectedAreaCategory.push(newAreaItem);

    $('#hope-work-area-list').append(`
        <li>
            <div>${addText}</div>
            <button type="button"><span class="re-resume-done__box--close"></span></button>
        </li>
    `);

    $('#hopeAreaUpperSelect').prop('selectedIndex', 0);
    $('#hopeAreaLowerSelect').prop('selectedIndex', 0).html('<option disabled selected>상세지역선택</option>');
}

// ===
let g_resumeData = {};
let g_editItemId = {};
let g_openSection = {};
let g_selectedJobTypeCategory = '';
let g_selectedHopeWorkJobTypeList = [];
let g_selectedCareerJobType = '';
let g_resumePhotoFile = null;
let g_resumePhotoPreviewUrl = '';
function fn_getResumeHtml(sectionKey, item) {
    if (sectionKey === 'education') {
        return `
            <li class="re-resume-done" id="resume-item-${item.id}">
                <div class="re-resume-done__box">
                    <div class="re-resume-done__box--tit">${item.schoolName || ''}</div>
                    <div class="re-resume-done__box--btn">
                        <button type="button" class="re-resume__item-edit-btn"><span class="re-resume-done__box--edit"></span></button>
                        <button type="button" class="re-resume__item-delete-btn"><span class="re-resume-done__box--close"></span></button>
                    </div>
                </div>
                <div class="re-resume-done__bottom">${item.summary || ''}</div>
            </li>
        `;
    }

    if (sectionKey === 'career') {
        return `
            <li class="re-resume-done" id="resume-item-${item.id}">
                <div class="re-resume-done__box">
                    <div class="re-resume-done__inner">
                        <div class="re-resume-done__box--tit">${item.companyName || ''}</div>
                        <div class="re-resume-done__box--date">${item.period || ''}</div>
                    </div>
                    <div class="re-resume-done__box--btn">
                        <button type="button" class="re-resume__item-edit-btn"><span class="re-resume-done__box--edit"></span></button>
                        <button type="button" class="re-resume__item-delete-btn"><span class="re-resume-done__box--close"></span></button>
                    </div>
                </div>
                <ul class="re-resume-done__textbox">
                    <li>${item.summary || ''}</li>
                    <li>${item.description || ''}</li>
                    <li class="re-resume-done__inner">
                        <div>연봉 | ${item.salary || ''}</div>
                        <div>근무지역 | ${item.workAreaName || ''}</div>
                        <div>퇴사사유 | ${item.resignationName || ''}</div>
                    </li>
                </ul>
            </li>
        `;
    }

    if (sectionKey === 'certificate') {
        return `
            <li class="re-resume-done" id="resume-item-${item.id}">
                <div class="re-resume-done__box">
                    <div class="re-resume-done__inner">
                        <div class="re-resume-done__box--tit">${item.licenseName || ''}</div>
                        <div class="re-resume-done__box--date">${item.issuingAgency || ''}</div>
                    </div>
                    <div class="re-resume-done__box--btn">
                        <button type="button" class="re-resume__item-edit-btn"><span class="re-resume-done__box--edit"></span></button>
                        <button type="button" class="re-resume__item-delete-btn"><span class="re-resume-done__box--close"></span></button>
                    </div>
                </div>
                <div class="re-resume-done__bottom">${item.summary || ''}</div>
            </li>
        `;
    }

    if (sectionKey === 'activity') {
        return `
            <li class="re-resume-done" id="resume-item-${item.id}">
                <div class="re-resume-done__box">
                    <div class="re-resume-done__inner">
                        <div class="re-resume-done__box--tit">${item.activityName || ''}</div>
                        <div class="re-resume-done__box--date">${item.period || ''}</div>
                    </div>
                    <div class="re-resume-done__box--btn">
                        <button type="button" class="re-resume__item-edit-btn"><span class="re-resume-done__box--edit"></span></button>
                        <button type="button" class="re-resume__item-delete-btn"><span class="re-resume-done__box--close"></span></button>
                    </div>
                </div>
                <div class="re-resume-done__bottom">${item.description || ''}</div>
            </li>
        `;
    }

    if (sectionKey === 'introduction') {
        return `
            <li class="re-resume-done" id="resume-item-${item.id}">
                <div class="re-resume-done__box">
                    <div class="re-resume-done__box--tit">${item.introductionTitle || ''}</div>
                    <div class="re-resume-done__box--btn">
                        <button type="button" class="re-resume__item-edit-btn"><span class="re-resume-done__box--edit"></span></button>
                        <button type="button" class="re-resume__item-delete-btn"><span class="re-resume-done__box--close"></span></button>
                    </div>
                </div>
                <div class="re-resume-done__bottom">${item.introductionContent || ''}</div>
            </li>
        `;
    }

    if (sectionKey === 'hopeWork') {
        const areaText = item.hopeAreas ? item.hopeAreas.map(a => `${a.areaUpperName} > ${a.areaLowerName}`).join(', ') : '';
        const jobText = item.hopeJobs ? item.hopeJobs.map(j => `${j.jobUpperName} > ${j.jobLowerName}`).join(', ') : '';
        let workTypeText = '';
        try {
            const types = JSON.parse(item.desiredEmploymentType);
            workTypeText = Array.isArray(types) ? types.join(', ') : '';
        } catch(e) { workTypeText = item.desiredEmploymentType || ''; }
        const salaryDisplay = item.isSalaryPrivate ? '비공개' : (item.salaryName || '면접 후 결정');
        return `
            <li class="re-resume-done" id="resume-item-${item.id}">
                <div class="re-resume-done__box">
                    <div class="re-resume-done__inner">
                        <div class="re-resume-done__box--tit">${item.title || '희망 근무 조건 작성 내역'}</div>
                    </div>
                    <div class="re-resume-done__box--btn">
                        <button type="button" class="re-resume__item-edit-btn"><span class="re-resume-done__box--edit"></span></button>
                    </div>
                </div>
                <div class="re-resume-done__hope">
                    <div class="re-resume-done__hope--inner">
                        <div class="re-resume-done__hope--tit">근무지역</div>
                        <div>${item.workArea || ''}</div>
                    </div>
                    <div class="re-resume-done__hope--inner">
                        <div class="re-resume-done__hope--tit">직종</div>
                        <div>${item.jobType || ''}</div>
                    </div>
                    <div class="re-resume-done__hope--inner">
                        <div class="re-resume-done__hope--tit">근무형태</div>
                        <div>${item.workType || ''}</div>
                    </div>
                    <div class="re-resume-done__hope--inner">
                        <div class="re-resume-done__hope--tit">희망연봉</div>
                        <div>${item.salaryName || ''}</div>
                    </div>
                </div>
            </li>
        `;
    }

    return '';
}
function fn_updateSectionEditState(sectionKey) {
    let $section = $('#resume-section-' + sectionKey);
    let isEditing = !!g_editItemId[sectionKey];
    let $title = $section.find('.re-resume__section-title').first();
    let $badge = $title.find('.re-resume__edit-state');
    let $saveButton = $section.find('.re-resume-add__box--save').first();
    let $cancelButton = $section.find('.re-resume-add__box--cancel').first();

    if ($section.length === 0) {
        return;
    }

    if ($badge.length === 0 && $title.length) {
        $badge = $('<span class="re-resume__edit-state">수정 중</span>');
        $title.append($badge);
    }

    $section.toggleClass('is-editing', isEditing);
    $badge.toggle(isEditing);

    if ($saveButton.length) {
        $saveButton.text(isEditing ? '수정하기' : '저장');
    }

    if ($cancelButton.length) {
        $cancelButton.text(isEditing ? '수정취소' : '취소');
    }
}
function fn_renderSelectList($target, list) {
    let article = '';

    $.each(list || [], function (_, item) {
        article += `
            <li>
                <div>${item}</div>
                <button type="button"><span class="re-resume-done__box--close"></span></button>
            </li>
        `;
    });

    $target.empty().append(article);
}
function fn_getSectionKey($target) {
    return ($target.closest('.re-resume__block').attr('id') || '').replace('resume-section-', '');
}
function fn_resetSectionForm(sectionKey) {
    let $form = $('#resume-section-' + sectionKey).find('.re-resume__add-list');

    $form.find('input[type="text"]').val('');
    $form.find('textarea').val('');
    $form.find('input[type="checkbox"]').prop('checked', false);
    $form.find('select').each(function () {
        $(this).prop('selectedIndex', 0);
    });

    if (sectionKey === 'hopeWork') {
        fn_renderSelectList($form.find('.re-resume-add__here').eq(0), []);
        fn_renderSelectList($form.find('.re-resume-add__here').eq(1), []);
    }

    if (sectionKey === 'career') {
        fn_setCareerJobTypeValue($form, '');
    }
}
function fn_drawResumeSection(sectionKey) {
    let $section = $('#resume-section-' + sectionKey);
    let editItemId = g_editItemId[sectionKey] || '';

    let list = [];
    
    if (isModify) {
        if (sectionKey === 'education') list = modifyEduList || [];
        else if (sectionKey === 'career') list = modifyCareerList || [];
        else if (sectionKey === 'certificate') list = modifyLicenseList || [];
        else if (sectionKey === 'activity') list = modifyActivityList || [];
        else if (sectionKey === 'introduction') list = modifyIntroductionList || [];
        else if (sectionKey === 'hopeWork' || sectionKey === 'hopework') list = modifyHopeworkInfo ? [modifyHopeworkInfo] : [];

        console.log(" modifyHopeworkInfo ", modifyHopeworkInfo)
        console.log(' list ', list )
    } else {
        list = g_resumeData[sectionKey] || [];
    }

    // 현재 수정 중인 아이템은 리스트(done-list)에서 제외
    let displayList = list;
    if (g_openSection[sectionKey] && editItemId) {
        displayList = $.grep(list, function (item) {
            // item.id나 item.seq 모두 체크 (문자열 비교)
            const itemId = String(item.id || item.seq).replace(sectionKey + '-', '');
            const targetId = String(editItemId).replace(sectionKey + '-', '');
            return itemId !== targetId;
        });
    }

    // HTML 생성 및 데이터 가공(Summary 복구)
    let article = '';
    $.each(displayList, function (_, item) {
        if (!item.id) {
            item.id = sectionKey + '-' + (item.seq || '');
        }

        if (!item.summary) {
            if (sectionKey === 'education') {
                item.summary = fn_makeSummary([fn_makePeriod(item.startDt, item.endDt, '재학기간'), fn_setEduCurrentStatus(item.currentStatus), item.majorName || item.schoolName]);
            } else if (sectionKey === 'career') {
                const jobName = item.jobTypeName || item.jobUpperName + ' > ' + item.jobLowerName;
                item.summary = jobName + ' | ' + (item.department || '') + ' | ' + (item.jobType || '');
            } else if (sectionKey === 'certificate') {
                item.summary = fn_setPassed(item.isPassed) + ' | ' + fn_setYearMonth(item.acquiredDt);
            } else if (sectionKey === 'activity') {
                item.summary = fn_setYearMonth(item.startDt) + ' ~ ' + fn_setYearMonth(item.endDt);
            }
        }

        article += fn_getResumeHtml(sectionKey, item);
    });

    // 4. 화면 반영 및 UI 제어
    const $doneList = $section.find('.re-resume__done-list');
    const $addList = $section.find('.re-resume__add-list');
    const $emptyBox = $section.find('.re-resume__empty');

    // 리스트 영역 비우고 새로 추가
    $doneList.empty().append(article);

    // 섹션 오픈 상태에 따른 토글
    if (g_openSection[sectionKey]) {
        $addList.show();
        // 수정 중일 때 기존 리스트를 계속 보여줄지 숨길지 결정 (보통 숨김)
        $doneList.toggle(displayList.length > 0);
    } else {
        $addList.hide();
        $doneList.toggle(displayList.length > 0);
        $emptyBox.toggle(list.length === 0);
    }

    fn_updateSectionEditState(sectionKey);
}
function fn_getResumeItem(sectionKey, itemId) {
    let list = [];

    // 수정 모드일 때 보관된 리스트 참조
    if (isModify) {
        if (sectionKey === 'education') list = modifyEduList;
        else if (sectionKey === 'career') list = modifyCareerList;
        else if (sectionKey === 'certificate') list = modifyLicenseList;
        else if (sectionKey === 'activity') list = modifyActivityList;
        else if (sectionKey === 'introduction') list = modifyIntroductionList;
    } else {
        list = g_resumeData[sectionKey] || [];
    }

    // itemId가 "18"이고 item.id가 "education-18"인 경우 등을 모두 대응
    return (
        $.grep(list, function (item) {
            const pureId = String(item.id || item.seq).replace(sectionKey + '-', '');
            const targetId = String(itemId).replace(sectionKey + '-', '');
            return pureId === targetId;
        })[0] || null
    );
}
function fn_openOptionSection(sectionKey) {
    let $section = $('#resume-section-' + sectionKey);
    if ($section.length === 0) {
        return;
    }
    $section.find('.re-resume__add-btn').trigger('click');

    $('html, body')
        .stop()
        .animate(
            {
                scrollTop: $section.offset().top - 80,
            },
            300
        );
}
// 섹션 추가 버튼
$(document).on('click', '.re-resume__add-btn', function (event) {
    event.preventDefault();
    let sectionKey = fn_getSectionKey($(this));
    g_editItemId[sectionKey] = '';
    fn_resetSectionForm(sectionKey);
    g_openSection[sectionKey] = true;
    fn_drawResumeSection(sectionKey);
    $(`#resume-section-${sectionKey} .re-resume__empty`).hide();
});
// 자격증, 활동, 자기소개서, 경력 등 사이드바/옵션 메뉴
$(document).on('click', '.re-resume__option-item', function (event) {
    event.preventDefault();

    let optionId = $(this).attr('id') || '';

    // 클릭한 옵션에 따라 해당 섹션을 활성화하고 스크롤 이동
    if (optionId === 'resume-option-certificate' || optionId === 'resume-option-language') {
        fn_openOptionSection('certificate');
        return;
    }

    if (optionId === 'resume-option-activity') {
        fn_openOptionSection('activity');
        return;
    }

    if (optionId === 'resume-option-introduction') {
        fn_openOptionSection('introduction');
        return;
    }

    if (optionId === 'resume-option-career') {
        fn_openOptionSection('career');
    }
});
// 섹션 취소 버튼
$(document).on('click', '.re-resume-add__box--cancel', function (event) {
    event.preventDefault();
    let sectionKey = fn_getSectionKey($(this));
    g_editItemId[sectionKey] = '';
    fn_resetSectionForm(sectionKey);
    g_openSection[sectionKey] = false;
    fn_drawResumeSection(sectionKey);
});
// 섹션 저장
function fn_makeItemId(sectionKey) {
    return sectionKey + '-' + new Date().getTime() + '-' + Math.floor(Math.random() * 1000);
}
function fn_getValue($target, defaultValue) {
    let value = $.trim($target.val() || '');
    return value || defaultValue || '';
}
function fn_getSelectText($target, defaultValue) {
    let value = $.trim($target.find('option:selected').text() || '');

    if (!value || value.indexOf('선택') > -1 || value.indexOf('상태') > -1) {
        return defaultValue || '';
    }

    return value;
}
function fn_makeSummary(list) {
    let textList = [];

    $.each(list, function (_, item) {
        if ($.trim(item || '') !== '') {
            textList.push(item);
        }
    });

    return textList.join(' | ');
}
function fn_makePeriod(startDt, endDt, defaultValue) {
    if (!startDt || !endDt) {
        return defaultValue || '';
    }

    return fn_formatMonth(startDt, startDt) + ' ~ ' + fn_formatMonth(endDt, endDt);
}
function fn_formatMonth(value, defaultValue) {
    let text = $.trim(value || '');

    if (/^\d{6}$/.test(text)) {
        return text.substring(0, 4) + '.' + text.substring(4, 6);
    }

    return text || defaultValue || '';
}
function fn_getListArray($targets) {
    let textList = [];

    $targets.each(function () {
        let value = $.trim($(this).text());

        if (value) {
            textList.push(value);
        }
    });

    return textList;
}
function fn_getCheckedArray($targets) {
    let textList = [];

    $targets.each(function () {
        let value = $.trim($(this).siblings('span').text());

        if (value) {
            textList.push(value);
        }
    });

    return textList;
}
function fn_getCareerJobTypeValue($target) {
    return fn_normalizeSingleJobType($target.find('.re-resume-add__work-value').val() || '');
}
function fn_normalizeSingleJobType(value) {
    let valueList = $.map(String(value || '').split(','), function (item) {
        let text = $.trim(item);
        return text ? text : null;
    });

    return valueList[0] || '';
}
// 섹션 validation
function fn_validateSectionData(sectionKey, item) {
    if (!item) return false;

    const invalidate = (msg) => {
        alert(msg);
        return false;
    };

    if (sectionKey === 'education') {
        if (!item.schoolName) return invalidate('학교명을 입력해주세요.');
        if (!item.startDt) return invalidate('입학일을 선택해주세요.');
        if (!item.endDt) return invalidate('졸업일(예정일)을 선택해주세요.');
    }

    if (sectionKey === 'career') {
        if (!item.companyName) return invalidate('회사명을 입력해주세요.');
        if (!item.startDt) return invalidate('입사일을 선택해주세요.');
        if (!item.isWorking && !item.endDt) return invalidate('퇴사일을 선택해주세요.');
    }

    if (sectionKey === 'certificate') {
        if (!item.licenseName) return invalidate('자격증 명칭을 입력해주세요.');
        if (!item.acquiredDt) return invalidate('취득일을 입력해주세요.');
    }

    if (sectionKey === 'activity') {
        if (!item.activityName) return invalidate('활동명을 입력해주세요.');
        if (!item.startDt) return invalidate('시작일을 입력해주세요.');
    }

    if (sectionKey === 'introduction') {
        if (!item.introductionTitle || item.introductionTitle.trim() === '') return invalidate('자기소개서 제목을 입력해주세요.');
        if (!item.introductionContent) return invalidate('자기소개서 내용을 입력해주세요.');
    }

    if (sectionKey === 'hopeWork') {
        if (!item.workAreaList || item.workAreaList.length === 0) return invalidate('희망 근무지역을 최소 하나 선택해주세요.');
        if (!item.jobTypeList || item.jobTypeList.length === 0) return invalidate('희망 직종을 최소 하나 선택해주세요.');
    }

    return true;
}
// 섹션 저장 버튼 데이터 불러오기
function fn_getSectionFormData(sectionKey) {
    let $form = $('#resume-section-' + sectionKey).find('.re-resume__add-list');
    let $inputs = $form.find('input[type="text"]');
    let $selects = $form.find('select');
    let $textarea = $form.find('textarea');
    let $item = $form.find('.re-resume-add');

    if (sectionKey === 'education') {
        const $currentItem = $('#resume-section-education').find('.re-resume__add-list .re-resume-add');
        const startDt = fn_getValue($item.find('.re-resume-add__box--date:eq(0) input'));
        const endDt = fn_getValue($item.find('.re-resume-add__box--date:eq(1) input'));
        return {
            schoolName: fn_getValue($item.find('.edu-school-name'), '학교명'),
            startDt: startDt,
            enrollStatus: fn_getValue($item.find('.edu-select-status')),
            endDt: startDt,
            currentStatus: fn_getValue($item.find('.edu-select-current-status')),
            schoolType: fn_getValue($item.find('.edu-school-type')),
            location: fn_getValue($item.find('.edu-school-area')),
            majorType: fn_getValue($item.find('.edu-major-type')),
            majorName: fn_getValue($item.find('.edu-major-name')),
            degree: fn_getValue($item.find('.edu-degree')),
            score: fn_getValue($item.find('.edu-score')),
            totalScore: fn_getValue($item.find('.edu-total-score')),
            summary: fn_makeSummary([fn_makePeriod(startDt, endDt, '재학기간'), fn_getSelectText($item.find('.edu-select-current-status'), '졸업'), fn_getSelectText($item.find('.edu-major-type'), '계열')]),
        };
    }
    if (sectionKey === 'career') {
        const $dateBox = $item.find('.re-resume-add__box--date').has('input[pattern]');
        const startDt = fn_getValue($dateBox.find('input').eq(0));
        const endDt = fn_getValue($dateBox.find('input').eq(1));
        const careerJobType = fn_getCareerJobTypeValue($item);
        const workAreaName = $form.find('#resignReasonSelect option:selected').data('name');
        const resignationName = $form.find('#resignReasonSelect option:selected').data('name');
        const selectedJobTypeSeq = $item.find('.car-employ-code').val();

        return {
            isWorking: $item.find('input[name*="is-working"]:checked').val(),
            companyName: fn_getValue($item.find('input[placeholder="회사명"]'), '회사명'),
            jobUpperCode: selectedJobCategory.jobUpperSeq,
            jobLowerCode: selectedJobCategory.jobLowerSeq,
            jobType: careerJobType,
            jobTypeSeq: selectedJobTypeSeq,
            department: fn_getValue($item.find('.car-department'), '근무 부서'),
            workType: fn_getValue($item.find('.car-employ-code'), ''),
            startDt: startDt,
            endDt: endDt,
            period: fn_makePeriod(startDt, endDt, '근무기간'),
            summary: fn_makeSummary([careerJobType, fn_getValue($item.find('.car-department'), '근무 부서'), fn_getSelectText($item.find('.car-employ-code'), '근무형태')]),
            description: fn_getValue($item.find('.car-description'), ''),
            salary: fn_getValue($item.find('.car-salary'), '0') + ' 만원',
            salaryName: fn_getValue($item.find('.car-salary'), '0') + ' 만원',
            salaryValue: fn_getValue($item.find('.car-salary'), '0'),
            areaCode: fn_getValue($item.find('.car-area'), ''),
            workAreaName: workAreaName,
            // location : workAreaName,
            locationName: workAreaName,
            resignationCode: fn_getValue($item.find('.car-resign-reason'), ''),
            resignationName: resignationName,
        };
    }
    if (sectionKey === 'certificate') {
        const $currentItem = $('#resume-section-certificate').find('.re-resume__add-list .re-resume-add');
        const $dates = $currentItem.find('.lic-date').eq(0).val();
        const $isPassedSelect = $currentItem.find('.lic-is-passed');
        return {
            licenseName: fn_getValue($currentItem.find('.lic-name'), '자격증명'),
            issuingAgency: fn_getValue($currentItem.find('.lic-issuing-agency'), '발행처'),
            acquiredDt: $dates,
            isPassed: fn_getValue($isPassedSelect, ''),
            summary: fn_makeSummary([fn_getSelectText($isPassedSelect, '합격구분'), fn_formatMonth($dates, '')]),
        };
    }
    if (sectionKey === 'activity') {
        const $dates = $item.find('.act-date');
        const startDt = $dates.eq(0).val() || '';
        const endDt = $dates.eq(1).val() || '';
        return {
            activityName: fn_getValue($item.find('.act-name'), '과정명'),
            organization: fn_getValue($item.find('.act-organization'), '교육기관'),
            startDt: startDt,
            endDt: endDt,
            period: fn_makePeriod(startDt, endDt, '교육기간'),
            description: fn_getValue($item.find('.act-cotent'), ''),
            summary: fn_makeSummary([fn_getValue($item.find('.act-organization'), ''), fn_makePeriod(startDt, endDt, 'PERIOD')]),
        };
    }
    if (sectionKey === 'introduction') {
        const $currentItem = $('#resume-section-introduction').find('.re-resume__add-list .re-resume-add');
        return {
            introductionTitle: fn_getValue($currentItem.find('.itroduction-title'), '제목'),
            introductionContent: fn_getValue($currentItem.find('.introduction-content'), '내용을 입력해주세요'),
        };
    }
    if (sectionKey === 'hopeWork') {
        item.hopeAreas = [...hopeSelectedAreaCategory]; 
        item.hopeJobs = [...hopeSelectedJobCategory];  
        
        let workTypes = [];
        $('.mo-add-condition__check input:checked').each(function() {
            workTypes.push($(this).next('span').text().trim());
        });
        item.desiredEmploymentType = JSON.stringify(workTypes);

        item.isSalaryPrivate = $('.re-resume-add__label input[type="checkbox"]').is(':checked')
        item.salary = $('#salarySelect').val();
        item.salaryName = $('#salarySelect option:selected').text();
        item.salaryCode = $('#salarySelect').val();
        item.salaryValue = $('#salarySelect').val();
        return item;
        // let workAreaList = fn_getListArray($form.find('.re-resume-add__here').eq(0).find('li > div'));
        // let jobTypeList = fn_getListArray($form.find('.re-resume-add__here').eq(1).find('li > div'));
        // let workTypeList = fn_getCheckedArray($form.find('.mo-add-condition__check input:checked'));
        // let isSalaryPrivate = $form.find('.re-resume-add__label input[type="checkbox"]').is(':checked');
        // let hopeSalary = $form.find('#salarySelect').val();
        // let salaryName = $form.find('#salarySelect option:selected').data('name');
        // return {
        //     title: '희망 근무 조건 작성 내역',
        //     workAreaList: workAreaList,
        //     workArea: workAreaList.length ? workAreaList.join(', ') : '',
        //     workAreaCodeList: hopeSelectedAreaCategory,
        //     jobTypeList: jobTypeList,
        //     jobTypeCodeList: hopeSelectedJobCategory,
        //     jobType: jobTypeList.length ? jobTypeList.join(', ') : '',
        //     workTypeList: workTypeList,
        //     workType: workTypeList.length ? workTypeList.join(', ') : '',
        //     isSalaryPrivate: isSalaryPrivate,
        //     salary: hopeSalary,
        //     salaryValue: hopeSalary,
        //     salaryName: salaryName,
        // };
    }

    return {};
}
// 섹션 저장 버튼
$(document).on('click', '.re-resume-add__box--save', function (event) {
    event.preventDefault();
    let sectionKey = fn_getSectionKey($(this));
    let item = fn_getSectionFormData(sectionKey);

    console.log(' ... 섹션 저장 버튼 item ');
    console.log(item)

    if (!fn_validateSectionData(sectionKey, item)) {
        return;
    }

    let editItemId = g_editItemId[sectionKey] || '';
    item.id = editItemId || fn_makeItemId(sectionKey);

    if (!g_resumeData[sectionKey]) {
        g_resumeData[sectionKey] = [];
    }

    if (sectionKey === 'education') {
        if (isModify && editItemId) {
            /**
             * 1. [수정 모드] + [기존 항목 수정]
             * 서버에서 불러온 기존 데이터 중 특정 항목을 수정하는 경우
             */
            modifyEduList = $.map(modifyEduList, function (obj) {
                const objId = String(obj.id || obj.seq).replace('education-', '');
                const targetId = String(editItemId).replace('education-', '');

                if (objId === targetId) {
                    item.resumeSeq = updateResumeSeq;
                    item.isUpdated = true;
                    return $.extend({}, obj, item);
                }
                return obj;
            });
        } else if (isModify && !editItemId) {
            /**
             * 2. [수정 모드] + [신규 항목 추가]
             * 수정 페이지로 들어왔지만, 기존에 없던 학력을 새로 추가 버튼을 눌러 작성한 경우
             * 수정용 배열(modifyEduList)에 새 데이터를 밀어넣습니다.
             */
            modifyEduList.push(item);
        } else {
            /**
             * 3. [신규 작성 모드]
             * 수정 페이지가 아닌, 아예 처음 이력서를 작성하는 페이지에서 학력을 추가하는 경우
             * 일반 신규 배열(eduInfoList)에 데이터를 저장합니다.
             */
            eduInfoList.push(item);
        }
    } else if (sectionKey === 'career') {
        if (isModify && editItemId) {
            modifyCareerList = $.map(modifyCareerList, function (obj) {
                const objId = String(obj.id || obj.seq).replace('career-', '');
                const targetId = String(editItemId).replace('career-', '');

                if (objId === targetId) {
                    item.resumeSeq = updateResumeSeq;
                    item.isUpdated = true;
                    return $.extend({}, obj, item);
                }

                return obj;
            });
        } else if (isModify && !editItemId) {
            modifyCareerList.push(item);
        } else {
            careerInfoList.push(item);
        }
    } else if (sectionKey === 'certificate') {
        if (isModify && editItemId) {
            modifyLicenseList = $.map(modifyLicenseList, function (obj) {
                const objId = String(obj.id || obj.seq).replace('certificate-', '');
                const targetId = String(editItemId).replace('certificate-', '');

                if (objId === targetId) {
                    item.resumeSeq = updateResumeSeq;
                    item.isUpdated = true;
                    return $.extend({}, obj, item);
                }

                return obj;
            });
        } else if (isModify && !editItemId) {
            modifyLicenseList.push(item);
        } else {
            licenseInfoList.push(item);
        }
    } else if (sectionKey === 'activity') {
        if (isModify && editItemId) {
            modifyActivityList = $.map(modifyActivityList, function (obj) {
                const objId = String(obj.id || obj.seq).replace('activity-', '');
                const targetId = String(editItemId).replace('activity-', '');

                if (objId === targetId) {
                    item.resumeSeq = updateResumeSeq;
                    item.isUpdated = true;
                    return $.extend({}, obj, item);
                }

                return obj;
            });
        } else if (isModify && !editItemId) {
            modifyActivityList.push(item);
        } else {
            activityInfoList.push(item);
        }
    } else if (sectionKey === 'introduction') {
        if (isModify && editItemId) {
            modifyIntroductionList = $.map(modifyIntroductionList, function (obj) {
                const objId = String(obj.id || obj.seq).replace('introduction-', '');
                const targetId = String(editItemId).replace('introduction-', '');

                if (objId === targetId) {
                    item.resumeSeq = updateResumeSeq;
                    item.isUpdated = true;
                    return $.extend({}, obj, item);
                }

                return obj;
            });
        } else if (isModify && !editItemId) {
            modifyIntroductionList.push(item);
        } else {
            introductionInfoList.push(item);
        }
    } else if (sectionKey === 'hopeWork') {
        if (isModify) {
            item.resumeSeq = updateResumeSeq;
            item.isUpdated = true;
        }
        g_resumeData[sectionKey] = [item];
        modifyHopeworkInfo = item;  
        // if (isModify && editItemId) {
        //     item.resumeSeq = updateResumeSeq;
        //     item.isUpdated = true;
        //     modifyHopeworkInfo = $.extend({}, modifyHopeworkInfo, item);
        //     g_resumeData[sectionKey] = [modifyHopeworkInfo];
        // } else if (isModify && !editItemId) {
        // } else {
        //     g_resumeData[sectionKey] = [item];
        // }
    }


    if (sectionKey !== 'hopeWork') {
        if (editItemId) {
            g_resumeData[sectionKey] = $.map(g_resumeData[sectionKey], function (resumeItem) {
                if (String(resumeItem.id) === String(editItemId)) {
                    return item;
                }
                return resumeItem;
            });
        } else {
            g_resumeData[sectionKey].push(item);
        }
    }
    g_editItemId[sectionKey] = '';
    fn_resetSectionForm(sectionKey);
    g_openSection[sectionKey] = false;
    fn_drawResumeSection(sectionKey);
});
// 섹션 수정하기 데이터 setting
function fn_setSelectText($target, value) {
    let isSelected = false;

    $target.find('option').each(function () {
        if ($.trim($(this).text()) === $.trim(value || '')) {
            $(this).prop('selected', true);
            isSelected = true;
            return false;
        }
    });

    if (!isSelected) {
        $target.prop('selectedIndex', 0);
    }
}
function fn_setCheckedValues($targets, values) {
    let valueList = values || [];

    $targets.each(function () {
        let text = $.trim($(this).siblings('span').text());
        $(this).prop('checked', $.inArray(text, valueList) > -1);
    });
}
function fn_setSectionFormData(sectionKey, item) {
    let $form = $('#resume-section-' + sectionKey).find('.re-resume__add-list');
    let $inputs = $form.find('input[type="text"]');
    let $selects = $form.find('select');
    let $textarea = $form.find('textarea');

    if (!item) {
        return;
    }

    if (sectionKey === 'education') {
        $form.find('.edu-school-name').val(item.schoolName || '');
        $form.find('.edu-start-date').val(item.startDt || '');
        $form.find('.edu-end-date').val(item.endDt || '');
        $form.find('.edu-select-status').val(item.enrollStatus || '');
        $form.find('.edu-select-current-status').val(item.currentStatus || '');
        $form.find('.edu-school-type').val(item.schoolType || '');
        $form.find('.edu-school-area').val(item.location || '');

        $form.find('.edu-major-type').val(item.majorType || '');
        $form.find('.edu-major-name').val(item.majorName || '');
        $form.find('.edu-degree').val(item.degree || '');

        $form.find('.edu-score').val(item.score || '');
        $form.find('.edu-total-score').val(item.totalScore || '');
        return;
    }

    if (sectionKey === 'career') {
        $form.attr('data-seq', item.seq);

        $form.find('input[type="radio"][value="' + item.isWorking + '"]').prop('checked', true);
        $form.find('.re-resume-add__input').first().val(item.companyName);

        const $jobBtn = $form.find('.re-resume-add__work--career-jobtype');
        const $jobHidden = $form.find('.re-resume-add__work-value');

        if (item.jobUpperName && item.jobLowerName) {
            const fullJobName = item.jobUpperName + ' > ' + item.jobLowerName;
            $jobBtn.addClass('is-selected');
            $jobBtn.find('span').text(fullJobName);
            $jobHidden.val(fullJobName);
        }

        $form.find('.car-department').val(item.department);
        $form.find('.car-employ-code').val(item.employCode);

        $form.find('.career-start-date').val(item.startDt);
        $form.find('.career-end-date').val(item.endDt);

        $form.find('.car-area').val(item.location);
        $form.find('.car-salary').val(item.salaryValue);
        $form.find('.car-description').val(item.description);
        $form.find('.car-resign-reason').val(item.resignationCode);

        $form.find('.car-employ-code').val(item.jobTypeSeq);

        $form.find('.re-resume-add__work--career-jobtype span').text(item.jobTypeName);

        return;
    }

    if (sectionKey === 'certificate') {
        $form.find('.lic-name').val(item.licenseName || '');
        $form.find('.lic-issuing-agency').val(item.issuingAgency || item.agencyName || '');
        $form.find('.lic-date').val(item.acquiredDt || '');
        $form.find('.lic-is-passed').val(item.isPassed || '');

        return;
    }

    if (sectionKey === 'activity') {
        $form.find('.act-name').val(item.activityName || '');
        $form.find('.act-organization').val(item.organization || '');

        let $dateInputs = $form.find('.act-date');
        $dateInputs.eq(0).val(item.startDt || '');
        $dateInputs.eq(1).val(item.endDt || '');

        $form.find('.act-cotent').val(item.description || item.activityContent || '');

        return;
    }

    if (sectionKey === 'introduction') {
        $form.find('.itroduction-title').val(item.introductionTitle || '');
        $form.find('.introduction-content').val(item.introductionContent || '');
        return;
    }

    if (sectionKey === 'hopeWork') {

        if (item.hopeAreas && item.hopeAreas.length > 0) {
            // 기존 배열을 비우고 item 데이터로 채움
            hopeSelectedAreaCategory.splice(0, hopeSelectedAreaCategory.length, ...item.hopeAreas);
        }
        if (item.hopeJobs && item.hopeJobs.length > 0) {
            // 기존 배열을 비우고 item 데이터로 채움
            hopeSelectedJobCategory.splice(0, hopeSelectedJobCategory.length, ...item.hopeJobs);
        }
        
        // 1. 근무형태 (Checkbox 처리)
        // 데이터 형식 예시: "[\"정규직\"]" -> JSON 파싱 필요
        if (item.desiredEmploymentType) {
            let workTypes = JSON.parse(item.desiredEmploymentType);

            if (Array.isArray(workTypes)) {
                workTypes = workTypes.flatMap((type) => type.split(',').map((t) => t.trim()));
            }

            $form.find('.mo-add-condition__check input[type="checkbox"]').prop('checked', false);
            $form.find('.mo-add-condition__check input[type="checkbox"]').each(function () {
                const labelText = $(this).next('span').text().trim();
                if (workTypes.includes(labelText)) {
                    $(this).prop('checked', true);
                }
            });
        }

        // 2. 희망연봉 (Select 및 비공개 체크박스)
        if (item.desiredSalary) {
            const $targetOption = $form.find(`#salarySelect option[data-code="${item.desiredSalary}"]`);
            if ($targetOption.length > 0) {
                $form.find('#salarySelect').val($targetOption.val()).change();
            } else {
                $form.find('#salarySelect').val(item.desiredSalary).change();
            }
        }
        $form.find('.re-resume-add__label input[type="checkbox"]').prop('checked', item.salaryPrivate);

        // 3. 근무지역 리스트 UI 복구
        // let areaHtml = '';
        // if (item.desiredAreaList && item.desiredAreaList.length > 0) {
        //     item.desiredAreaList.forEach(function (area) {
        //         const parent = area.parentAreaName || '';
        //         const child = area.childAreaName || '';
        //         const hopeAreaText = child ? `${parent} > ${child}` : parent;

        //         areaHtml += `
        //             <li data-parent-seq="${area.parentAreaSeq}" data-child-seq="${area.childAreaSeq}">
        //                 <div>${hopeAreaText}</div>
        //                 <button type="button"><span class="re-resume-done__box--close"></span></button>
        //             </li>`;
        //     });
        // }
        // $form.find('#hope-work-area-list').html(areaHtml);
        const $areaList = $('#hope-work-area-list');
        $areaList.empty();
        hopeSelectedAreaCategory.forEach(area => {
            $areaList.append(`
                <li data-parent-seq="${area.areaUpperSeq}" data-child-seq="${area.areaLowerSeq}">
                    <div>${area.areaUpperName} > ${area.areaLowerName}</div>
                    <button type="button"><span class="re-resume-done__box--close"></span></button>
                </li>
            `);
        });

        // 4. 직종 리스트 UI 복구
        // let jobHtml = '';
        // if (item.desiredJobList && item.desiredJobList.length > 0) {
        //     item.desiredJobList.forEach(function (job) {
        //         const parent = job.parentJobName || '';
        //         const child = job.childJobName || '';
        //         const hopeJobText = child ? `${parent} > ${child}` : parent;

        //         jobHtml += `
        //             <li data-parent-seq="${job.parentJobSeq}" data-child-seq="${job.childJobSeq}">
        //                 <div>${hopeJobText}</div>
        //                 <button type="button"><span class="re-resume-done__box--close"></span></button>
        //             </li>`;
        //     });
        // }
        // $form.find('#hope-work-jobtype-list').append(jobHtml);
        const $jobList = $('#hope-work-jobtype-list');
        $jobList.empty();
        hopeSelectedJobCategory.forEach(job => {
            $jobList.append(`
                <li data-parent-seq="${job.jobUpperSeq}" data-child-seq="${job.jobLowerSeq}">
                    <div>${job.jobUpperName} > ${job.jobLowerName}</div>
                    <button type="button"><span class="re-resume-done__box--close"></span></button>
                </li>
            `);
        });

        return;
    }
}

// 섹션 수정 버튼
$(document).on('click', '.re-resume__edit-btn, .re-resume__item-edit-btn', function (event) {
    event.preventDefault();

    let sectionKey = fn_getSectionKey($(this));
    let itemId = '';
    let item = null;

    if (sectionKey === 'hopeWork') {
        if ($(this).hasClass('re-resume__item-edit-btn')) {
            itemId = ($(this).closest('.re-resume-done').attr('id') || '').replace('resume-item-', '');
        }
        item = isModify ? modifyHopeworkInfo : g_resumeData[sectionKey] || null;
        if (!itemId && item) {
            itemId = item.id || item.seq || 'hopeWork-1';
        }
    } else {
        if ($(this).hasClass('re-resume__item-edit-btn')) {
            itemId = ($(this).closest('.re-resume-done').attr('id') || '').replace('resume-item-', '');
            item = fn_getResumeItem(sectionKey, itemId);
        } else {
            let list = isModify ? modifyEduList || [] : g_resumeData[sectionKey] || [];
            item = list[0] || null;
            itemId = item ? item.id || item.seq : '';
        }
    }

    if (!item) return;

    g_editItemId[sectionKey] = itemId;
    fn_resetSectionForm(sectionKey);

    fn_setSectionFormData(sectionKey, item);

    g_openSection[sectionKey] = true;
    fn_drawResumeSection(sectionKey);
});
$(document).on('click', '.re-resume__item-delete-btn', function (event) {
    event.preventDefault();

    let sectionKey = fn_getSectionKey($(this));
    let itemId = ($(this).closest('.re-resume-done').attr('id') || '').replace('resume-item-', '');
    let param = { sectionKey: sectionKey, itemId: itemId };
    if (!g_resumeData[sectionKey]) {
        g_resumeData[sectionKey] = [];
    }

    g_resumeData[sectionKey] = $.grep(g_resumeData[sectionKey], function (item) {
        return String(item.id) !== String(itemId);
    });

    if (String(g_editItemId[sectionKey] || '') === String(itemId)) {
        g_editItemId[sectionKey] = '';
        fn_resetSectionForm(sectionKey);
    }

    fn_drawResumeSection(sectionKey);
});
// 희망근무조건
$(document).on('click', '#hope-work-jobtype-confirm', function (event) {
    event.preventDefault();
    const selectedText = $('#hope-work-jobtype-selected').text();
    const isNoSelection = !selectedText || selectedText.includes('선택해주세요');

    if (g_jobTypeModalContext === 'career') {
        if (isNoSelection) {
            alert('직무와 세부 직종을 선택해주세요.');
            return;
        }
        fn_setCareerJobTypeValue($('#resume-section-career'), selectedText);
    } else if (g_jobTypeModalContext === 'hopeWork') {
        fn_renderSelectList($('#hope-work-jobtype-list'), g_selectedHopeWorkJobTypeList);
        $('#hope-work-jobtype-input').val('');
    }

    fn_closeJobTypeModal();
});
$(document).on('keydown', '#hope-work-jobtype-modal', function (event) {
    if (event.key === 'Escape') {
        event.preventDefault();
        fn_closeJobTypeModal();
    }
});
$(document).on('change', '#resume-section-hopeWork .mo-add-condition__check input', function () {
    let checkedCount = $('#resume-section-hopeWork .mo-add-condition__check input:checked').length;

    if (checkedCount > 3) {
        $(this).prop('checked', false);
        alert('근무형태는 최대 3개까지 선택할 수 있습니다.');
    }
});
$(document).on('click', '.re-resume-add__here button', function (event) {
    event.preventDefault();
    $(this).closest('li').remove();
});
$(document).on('click', '.re-resume-add__box--cancel', function (event) {
    event.preventDefault();
    let sectionKey = fn_getSectionKey($(this));
    g_editItemId[sectionKey] = '';
    fn_resetSectionForm(sectionKey);
    g_openSection[sectionKey] = false;
    fn_drawResumeSection(sectionKey);
});
// 사진 추가
function fn_bindResumePhotoEvent() {
    $(document).on('click', '#resume-photo-upload, #resume-photo-preview', function (event) {
        event.preventDefault();
        $('#resume-photo-file').trigger('click');
    });

    $(document).on('keydown', '#resume-photo-preview', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            $('#resume-photo-file').trigger('click');
        }
    });

    $(document).on('click', '#resume-photo-delete', function (event) {
        event.preventDefault();
        fn_resetResumePhoto();
        if (isModify) {
            $('#resumeUserImg').remove();
            $('#resume-photo-file-name').val('');
            $('#resume-photo-placeholder').show();
        }
    });

    $(document).on('click', '#resume-photo-file', function () {
        $(this).val('');
    });

    $(document).on('change', '#resume-photo-file', function () {
        let file = this.files && this.files[0] ? this.files[0] : null;

        if (!file) {
            return;
        }

        fn_handleResumePhotoChange(file);
    });

    $(window)
        .off('beforeunload.resumePhoto')
        .on('beforeunload.resumePhoto', function () {
            fn_revokeResumePhotoPreviewUrl();
        });

    fn_setResumePhotoState();
}
function fn_handleResumePhotoChange(file) {
    let allowedTypeList = ['image/jpeg', 'image/png', 'image/webp'];
    let maxFileSize = 5 * 1024 * 1024;

    if ($.inArray(file.type, allowedTypeList) === -1) {
        alert('JPG, PNG, WEBP 형식의 이미지만 등록할 수 있습니다.');
        $('#resume-photo-file').val('');
        return;
    }

    if (file.size > maxFileSize) {
        alert('사진은 5MB 이하 파일만 등록할 수 있습니다.');
        $('#resume-photo-file').val('');
        return;
    }

    fn_revokeResumePhotoPreviewUrl();

    g_resumePhotoFile = file;
    g_resumePhotoPreviewUrl = URL.createObjectURL(file);

    $('#resume-photo-file-name').val(file.name || '');
    fn_setResumePhotoState();
}
function fn_setResumePhotoState() {
    let $preview = $('#resume-photo-preview');
    let $placeholder = $('#resume-photo-placeholder');
    let $deleteButton = $('#resume-photo-delete');
    let $uploadButton = $('#resume-photo-upload');
    let hasPhoto = !!g_resumePhotoFile && !!g_resumePhotoPreviewUrl;

    $preview.toggleClass('is-filled', hasPhoto);
    $preview.css('background-image', hasPhoto ? 'url("' + g_resumePhotoPreviewUrl + '")' : 'none');
    $placeholder.toggle(!hasPhoto);
    $deleteButton.prop('disabled', !hasPhoto);
    $uploadButton.text(hasPhoto ? '변경' : '등록');
}
function fn_resetResumePhoto() {
    g_resumePhotoFile = null;
    fn_revokeResumePhotoPreviewUrl();

    $('#resume-photo-file').val('');
    $('#resume-photo-file-name').val('');
    fn_setResumePhotoState();
}
function fn_revokeResumePhotoPreviewUrl() {
    if (!g_resumePhotoPreviewUrl) {
        return;
    }

    URL.revokeObjectURL(g_resumePhotoPreviewUrl);
    g_resumePhotoPreviewUrl = '';
}
