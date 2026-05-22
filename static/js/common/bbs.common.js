var tel_chk= /^\d{4}$/;
var num_chk = /^[0-9]*$/;

function input_null_chk(input, msg){
    if(input.val() == ''){
        confirmModal({title : msg + ' 입력해주세요.'})
        input.focus();
        return true;
    }else{
        return false;
    }
}

function select_null_chk(input, msg){
    if(input.val() == 'n99'){
        alert(msg + ' 선택해주세요.');
        input.focus();
        return true;
    }else{
        return false;
    }
}

function input_num_chk(input){
    if(!num_chk.test(input.val())){
        alert('숫자만 입력해주세요.')
        input.focus();
        return false;
    }else{
        return true;
    }
}

function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#image_preview').attr('src', e.target.result);
        }

        reader.readAsDataURL(input.files[0]);
    }
}

function readURL2(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#content').append('<img src="' + e.target.result + '" class="img" />');
        }

        reader.readAsDataURL(input.files[0]);
    }
}

$(function(){

    $.datepicker.regional['ko'] = {
        closeText: '닫기',
        prevText: '이전달',
        nextText: '다음달',
        currentText: '오늘',
        monthNames: ['1월(JAN)','2월(FEB)','3월(MAR)','4월(APR)','5월(MAY)','6월(JUN)', '7월(JUL)','8월(AUG)','9월(SEP)','10월(OCT)','11월(NOV)','12월(DEC)'],
        monthNamesShort: ['1월','2월','3월','4월','5월','6월', '7월','8월','9월','10월','11월','12월'],
        dayNames: ['일','월','화','수','목','금','토'],
        dayNamesShort: ['일','월','화','수','목','금','토'],
        dayNamesMin: ['일','월','화','수','목','금','토'],
        weekHeader: 'Wk',
        dateFormat: 'yy-mm-dd',
        firstDay: 0,
        isRTL: false,
        showMonthAfterYear: true,
        yearSuffix: ''
    };

    $.datepicker.setDefaults($.datepicker.regional['ko']);

    $('#str_date, #end_date').datepicker({
        showOn: 'focus', // focus / button / both
        showAnim: 'fadeIn', // slideDown/fadeIn/blind/bounce/clip/drop/fold/slide
        showOptions: {}, // Options for enhanced animations
        defaultDate: null, // +/-number for offset from today, null for today
        appendText: '', // Display text following the input box, e.g. showing the format
        hideIfNoPrevNext: false, // True to hide next/previous month links
        navigationAsDateFormat: false, // True if date formatting applied to prev/today/next links
        gotoCurrent: true, // True if today link goes back to current selection instead
        changeMonth: true, // True if month can be selected directly, false if only prev/next
        changeYear: true, // True if year can be selected directly, false if only prev/next
        yearRange: 'c-10:c+10', // Range of years to display in drop-down, // either relative to today's year (-nn:+nn), relative to currently displayed year // (c-nn:c+nn), absolute (nnnn:nnnn), or a combination of the above (nnnn:-n)
        showOtherMonths: true, // 나머지 날짜도 화면에 표시, 선택은 불가 selectOtherMonths: false, // 나머지 날짜에도 선택을 하려면 true
        selectOtherMonths: true,
        showWeek: false, // True to show week of the year, false to not show it
        calculateWeek: this.iso8601Week, // How to calculate the week of the year, // takes a Date and returns the number of the week for it
        shortYearCutoff: '+10', // Short year values < this are in the current century, // > this are in the previous century, // string value starting with '+' for current year + value
        minDate: null, // The earliest selectable date, or null for no limit
        maxDate: null, // +0d 하면 오늘 이후는 선택못함, null 은 제한없음
        duration: 'fast', // Duration of display/closure
        beforeShowDay: null, // Function that takes a date and returns an array with // [0] = true if selectable, false if not, [1] = custom CSS class name(s) or '', // [2] = cell title (optional), e.g. $.datepicker.noWeekends
        beforeShow: null, // Function that takes an input field and // returns a set of custom settings for the date picker
        onSelect: null, // Define a callback function when a date is selected
        onChangeMonthYear: null, // Define a callback function when the month or year is changed
        onClose: null, // Define a callback function when the datepicker is closed
        numberOfMonths: 1, // Number of months to show at a time
        showCurrentAtPos: 0, // The position in multipe months at which to show the current month (starting at 0)
        stepMonths: 1, // Number of months to step back/forward
        stepBigMonths: 12, // Number of months to step back/forward for the big links
        altField: '', // Selector for an alternate field to store selected dates into
        altFormat: '', // The date format to use for the alternate field
        constrainInput: true, // The input is constrained by the current date format
        showButtonPanel: true, // True to show button panel, false to not show it
        autoSize: false // True to size the input for the date format, false to leave as is
    });

    $('#chk_all').on('change', function(){
        if($('#chk_all').is(':checked') == true){
            $('.chk_one').prop('checked', true);
        }else{
            $('.chk_one').prop('checked', false);
        }
    });

    $('.chk_one').on('change', function(){
        if($(this).is(':checked') == true){
            var chk_index = 0;
            for(var i = 0; i < $('.chk_one').length; i++){
                if($('.chk_one').eq(i).is(':checked') == true){
                    chk_index++;
                }
            }

            if(chk_index == $('.chk_one').length){
                $('#chk_all').prop('checked', true);
            }

        }else{
            $('#chk_all').prop('checked', false);
        }
    });
});