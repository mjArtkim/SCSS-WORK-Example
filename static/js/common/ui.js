$(function(){

// 모바일 하단 고정버튼
if(window.innerWidth < 1200){
	const container = $('.sub');
	const fixCheck = $('.sub .btn_box').hasClass('fix')
	fixCheck ? container.addClass('fix_btn') : container.removeClass('fix_btn');
	const container2 = $('.popup');
	const fixCheck2 = $('.popup .btn_box').hasClass('fix')
	fixCheck2 ? container2.addClass('fix_btn') : container2.removeClass('fix_btn');
	$('.popup.fix_btn .btn_box').hasClass('fix') || $('.popup.fix_btn .btn_box').parent().removeClass('fix_btn');
}
// 아코디언
$(document).on('click','.menu_accordion > div > button', function(){
	const parent = $(this).parent().parent();
	const list = $(this).parent().siblings('ul');
	const sideMenuTitleHeight = $(this).outerHeight();
	if(!(parent.parent().hasClass('sub'))){
	 parent.siblings().removeClass('on');
	}
	$('.menu_accordion').css({'max-height': sideMenuTitleHeight})
	if(parent.hasClass('on')){
		parent.css({'max-height': sideMenuTitleHeight})
		$(this).attr('title', '펼쳐보기');
	}else{
		parent.css({'max-height': list.outerHeight() + sideMenuTitleHeight})
		$(this).attr('title', '접기')
	}
	parent.toggleClass('on');
	parent.siblings().find('button').attr('title', '펼쳐보기')
})
$(document).on('click','.accordion_item:not(.block) >div > button', function(){
	const parent = $(this).parent().parent();
	if(!(parent.parent().hasClass('sub'))) parent.siblings().removeClass('on');
	parent.toggleClass('on');
	if(parent.hasClass('on')){
		$(this).attr('title', '접기');
		parent.siblings().find('button').attr('title', '펼쳐보기');
	}
	if(!parent.hasClass('on')){
		$(this).attr('title', '펼쳐보기');
	}
})
// 탭
$(document).on('click', '.tab > .btns:not(.not) > button', function(){
	$(this).addClass('on').attr('title', '탭 활성화');
	$(this).siblings().removeClass('on').attr('title', '')
	$('.views > li').removeClass('on');
	$('.views > li').eq($(this).index()).addClass('on');
})
$(document).on('click', '.inner_table', function(){
	$(this).parent().css('padding', 0);
})
$(document).on('click', '.paging > button:not(:has(span))', function(){
	$(this).addClass('on');
	$(this).siblings().removeClass('on');
})
$(document).on('click', '.list_job > li', function(){
	$(this).addClass('on');
	$(this).siblings().removeClass('on');
})
// 폰트 확장 버튼
$('.btn_icon.char').on('click', function(){
	$('html').toggleClass('zoom');
})
// 라디오안에 버튼있는
$(document).on('change', '.radio_data_list.detail .radio_item input', function(){$(this).parent().addClass('on');$(this).parent().siblings().removeClass('on')})
// css has, not 처리 공통
window.innerHeight - $('.wrap > header').innerHeight() > $('.wrap > main').innerHeight() ? $('.wrap').addClass('full') : $('.wrap').removeClass('full');
$('figure:not(:has(img)) + .txt_main').addClass('txt_main_mt');
$('.input:has(.exclaim)').addClass('tal');
$('.input .input:has(.input_unit) + .input').addClass('input_mt');
$('.dl_table_group2 .dl_table .dl_table_dd:has(>.table_box)').css('padding', '0');
$('.popup.layer_bottom:not(:has(header)) .pop_content, .popup.layer_full:not(:has(header)) .pop_content').css('padding-top', '0');
$('.line_box:has(>.line_head)').css('padding','0');
$('.content:has(.bg_house)').css('position','relative');
$('.sub:has(.step_num)').css('position','relative');
$('.dl_table_group2 .dl_table .dl_table_dd:has(.list)').css('justify-content','start')
$('.content:has(.reserve) .mini_title').css({'margin-top':'3rem', 'text-align':'center'})
$('tbody tr:not(:has(td)) th').css('text-align','center');
$('.pop_wrap:has(> .alert)').css('transition', 'none');
$('.content:has(.exception_content)').css({'max-width': 'none', 'padding': 0});
// PC
if(window.innerWidth > 1200){
	$('.content:has(.gif.complete, .gif.fail)').addClass('tac');
	$('.content:has(.list_box.info, .move_btn_box, .input:not(.period), .gif.complete, .inquire_box)').addClass('narrow');
	$('.content:has(.gray_box > .input)').removeClass('narrow');
	$('.table_box:has(.table.small)').addClass('overflow_x');
	$('.dl_table_group2 .dl_table .dl_table_dd:has(>.table_box.hidden)').css('padding', '1rem 2rem');
	$('.popup.layer_bottom:not(:has(header)), .popup.layer_full:not(:has(header))').css('padding-top','5.5rem');
	$('.popup.layer_bottom .pop_content, .popup.layer_full .pop_content:not(:has(.btn_box))').css('padding-bottom','2.5rem');
	$('.sub_bar:has(~ .content_quick)').css('display','none');
	$('.content:has(> .top_box)').css('margin-top', '24px');
}
// mobile
else if(window.innerWidth <= 1200){
	window.innerHeight - $('.pop_header').innerHeight() > $('.popup.layer_full > .pop_content').innerHeight() + $('.popup.layer_full > .btn_box').outerHeight() ? $('.pop_wrap').addClass('full') : $('.pop_wrap').removeClass('full');
	$('.dl_table_group2 .dl_table .dl_table_dd:has(>.table_box.hidden)').css('padding', '0.75rem');
	$('.popup.layer_bottom:has(.fix)').css('padding-bottom', '4.25rem');
	$('.popup.layer_bottom:not(:has(header)), .popup.layer_full:not(:has(header))').css('padding-top', '3rem');
	$('main:has(.gif) .txt_main').addClass('tac');
	$('main.sub:has(.notice_list)').css('padding-top', '1.5rem');
	$('body:not(.main) section:not(.hidden) + section').css('margin-top', '2.5rem');
	$('.content:has(> .top_box)').css('margin-top', '16px');
	$('.pop_wrap.full .layer_full:not(:has(.btn_box))').css('padding-bottom', 0);
	$('.pop_wrap.full .layer_full:not(:has(.btn_box)) .pop_content').css('padding-bottom', '20px');
}

})
