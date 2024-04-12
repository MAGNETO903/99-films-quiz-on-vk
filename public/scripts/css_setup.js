graph_core.winW = $(window).width();
graph_core.winH = $(window).height();


function getOffset( el ) {
    var _x = 0;
    var _y = 0;
    while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
    }
    return { top: _y, left: _x };
}

 if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    // код для мобильных устройств
    graph_core.user_type = 'mobile';
  } else {
    graph_core.user_type = 'pc';
    // код для обычных устройств
}

//Hack to force scroll redraw
function scrollReDraw() {
    $('body').css('overflow', 'hidden').height();
    $('body').css('overflow', 'auto');
}

var noPX = function(string) {
    return string.slice(0, string.length-2);
}

var num = function(variable) {
    return Number(variable);
}

var set_size = function(el_id, w='none', h='none') {
    if (w != 'none') {
	   $(el_id).css('width', w);
	}
    if (h != 'none') {
        $(el_id).css('height', h);
    }
}

var set_pos = function(el_id, left, top) {
    $(el_id).css('left', left);
    $(el_id).css('top', top)
}

var set_pos2 = function(el_id, left='none', top='none') {
    if (left != 'none') {
        $(el_id).css('margin-left', left);
    }
    if (top != 'none') {
        $(el_id).css('margin-top', top)
    }
}

var get_pos = function(selector) {
    var el = $(selector);
    var x = num(noPX(el.css('left')));
    if (isNaN(x)) {
        x = num(noPX(el.css('margin-left')));
    }

    var y = num(noPX(el.css('top')));
    if (isNaN(y)) {
        y = num(noPX(el.css('margin-top')));
    }

    var x_size = num(noPX(el.css('width')));
    var y_size = num(noPX(el.css('height')));

    
	return {"x": x, "y": y, "right": x + x_size, "bottom": y+y_size }
}

var get_size = function(selector) {
	var el = $(selector);

	return {"x": num(noPX(el.css('width'))), "y": num(noPX(el.css('height')))}
}

var get_pic_size = function(selector) {
    var el = $(selector);

    return {"x": num(noPX(el.attr('width'))), "y": num(noPX(el.attr('height')))}
}

var get_center = function(selector) {
    var size = get_size(selector)
    var pos = get_pos(selector)
    return {"x": pos.x + size.x/2, "y": pos.y + size.y/2}
}

var mouse_in_element = function(selector) {
    var pos = get_pos(selector);
    var size = get_size(selector);

    var x1 = pos.x;
    var y1 = pos.y;

    var x2 = x1 + size.x;
    var y2 = y1 + size.y;

    if (x1 < mouse_x && mouse_x < x2 &&
        y1 < mouse_y && mouse_y < y2) {
        return true
    } else {
        return false
    }
}

var get_optimal_font = function(text, block_x, constant, block_y=1000 ) {
    // текст на слова
    var words = text.split(" ")

    var max_len = 0

    for (var i in words) {
        if (words[i].length > max_len) {
            max_len = words[i].length
        }
    }

    
    return Math.min(block_x / max_len * 1.5 * constant, block_y * 0.7  / words.length * constant)
}



var make_disabled = function(selector) {
    var html_disable_block = '<div id="'+selector.slice(1, selector.length)+'_disabled" class="disable_block"></div>'

    $('body').append(html_disable_block)

    var pos = $(selector).offset()

    set_size(selector+'_disabled', get_size(selector).x, get_size(selector).y)
    set_pos(selector+'_disabled',pos.left+num(noPX($(selector).css('border-width'))), pos.top+num(noPX($(selector).css('border-width'))))
}

var make_enabled = function(selector) {
    document.getElementById(selector.slice(1, selector.length)+'_disabled').outerHTML = "";
}

var set_best_size = function(selector, ratio, size_x, size_y) {
    var width = Math.min(size_x, size_y * ratio)

    set_size(selector, width, width / ratio)
}

var set_size_by_x = function(selector, ratio, size_x) {
    var width = size_x

    set_size(selector, width, width / ratio)
}

var set_size_by_y = function(selector, ratio, size_y) {
    var width = size_y * ratio

    set_size(selector, width, width / ratio)
}

var set_img_best_size = function(selector, ratio, size_x, size_y) {
    var width = Math.min(size_x, size_y * ratio)

    $(selector).attr('width', width + 'px')
    $(selector).attr('height', width / ratio + 'px')
}

var setup_main_menu_block = function(winW, winH, profile) {
    if (profile == 'pc') {

    }   
}

var setup_game_viewport = function(winW, winH, profile) {
    set_size('#game_viewport', winW, winH)
    if (profile == 1) {
        set_size('#gv_top_block', winW, winH * proportions.gv_top_block.h)

        set_size_by_y('#gv_tb_left_block', proportions.gv_tb_left_block.prop, winH * proportions.gv_top_block.h)
        set_pos('#gv_tb_left_block', (winW - get_size('#gv_tb_left_block').x)/2)

        set_size('#gv_tb_left_block_span', get_size('#gv_tb_left_block').x, get_size('#gv_tb_left_block').y / 2)
        set_pos('#gv_tb_left_block_span', 0, (get_size('#gv_tb_left_block').y - get_size('#gv_tb_left_block_span').y)/2 )
        $('#gv_tb_left_block').css('font-size', get_size('#gv_tb_left_block').y*0.5)

        set_size_by_y('#gv_tb_right_block', proportions.gv_tb_right_block.prop, winH * proportions.gv_top_block.h)
        set_pos('#gv_tb_right_block', winW - get_size('#gv_tb_right_block').x*1.1)

        $('#gv_frame_block_2').css('background', "url('images/kino_gor.png')")
        $('#gv_frame_block_2').css('background-size', '100%')

        $('.heart').attr('height', get_size('#gv_tb_right_block').y)

        set_size_by_y('#gv_left_block', proportions.gv_left_block.prop, winH)
        set_size_by_y('#gv_left_block_progress', proportions.gv_left_block.prop, winH)
        set_size_by_y('#gv_left_block_progress_hider', proportions.gv_left_block.prop, winH)

        set_size_by_y('#gv_title_block', proportions.gv_title_block.prop, winH * proportions.gv_title_block.h)
        set_pos('#gv_title_block', (winW - get_size('#gv_title_block').x)/2, get_size('#gv_top_block').y * 1.15 )
        $('#gv_title_block').css('font-size', get_size('#gv_title_block').y)

        set_size_by_y('#gv_frame_block_2, #gv_frame_block', proportions.gv_frame_block.prop, winH * proportions.gv_frame_block.h)
        set_pos('#gv_frame_block_2, #gv_frame_block', (winW - get_size('#gv_frame_block_2').x)/2, get_pos('#gv_title_block').bottom + get_size('#gv_title_block').y * 0.5)
    
        set_size_by_y('#gv_fb_pic', proportions.gv_fb_pic.prop, get_size('#gv_frame_block').y * 0.86)
        set_pos('#gv_fb_pic', (get_size('#gv_frame_block').x - get_size('#gv_fb_pic').x)/2, (get_size('#gv_frame_block').y - get_size('#gv_fb_pic').y)/2)

        set_size_by_y('#gv_buttons_block', proportions.gv_buttons_block.prop, proportions.gv_buttons_block.h * winH)
        set_pos('#gv_buttons_block', (winW - get_size('#gv_buttons_block').x)/2, get_pos('#gv_frame_block_2').bottom + get_size('#gv_buttons_block').y * 0.2)
    
        set_size_by_y('.gv_bb_button, .gv_gob_button, .gv_bb_button_hover, .gv_gob_button_hover', proportions.gv_bb_button.prop, proportions.gv_bb_button.h * winH)
        set_size('.gv_bb_button_text, .gv_gob_button_text, #link_to_group', get_size('.gv_bb_button').x, get_size('.gv_bb_button').y)


        set_pos('#button_2', get_size('#gv_buttons_block').x - get_size('.gv_bb_button').x, 0)
        set_pos('#button_3', 0, get_size('#gv_buttons_block').y - get_size('.gv_bb_button').y)
        set_pos('#button_4', get_size('#gv_buttons_block').x - get_size('.gv_bb_button').x, get_size('#gv_buttons_block').y - get_size('.gv_bb_button').y)
    
        set_size_by_x('#gv_game_over_block', proportions.gv_game_over_block.prop, get_size('#gv_buttons_block').x)
        set_pos('#gv_game_over_block', get_pos('#gv_buttons_block').x, (winH - get_size('#gv_game_over_block').y)/2 )

        set_size_by_x('#gv_gob_pic', proportions.gv_strike_block.prop, get_size('#gv_game_over_block').x)
        set_pos('#gv_gob_pic', (get_size('#gv_game_over_block').x - get_size('#gv_gob_pic').x)/2)

        set_pos('#gv_gob_button_1', 0, get_size('#gv_game_over_block').y - get_size('.gv_gob_button').y)
        set_pos('#gv_gob_button_1_hp', 0, get_size('#gv_game_over_block').y - get_size('.gv_gob_button').y)
        
        set_pos('#gv_gob_button_2',  get_size('#gv_game_over_block').x - get_size('.gv_gob_button').x, get_size('#gv_game_over_block').y - get_size('.gv_gob_button').y)

        set_size_by_x('#gv_gob_pic_result', proportions.gv_gob_pic_result.prop, get_size('#gv_gob_pic').x * 0.4)
        set_pos('#gv_gob_pic_result', get_size('#gv_gob_pic').x * 0.05, get_size('#gv_gob_pic').y * 0.25)

        $('.gv_gob_button_text, #link_to_group, #gv_gob_pic_result').css('font-size', get_size('.gv_gob_button').y*0.3)

        set_size('#share_button, #fav_button', winH * 0.1, winH * 0.1)
        set_pos('#share_button', winW - get_size('#share_button').x * 1.25, winH - get_size('#share_button').y * 1.25)
        set_pos('#fav_button', winW - get_size('#share_button').x * 2.5, winH - get_size('#share_button').y * 1.25)

    } else if (profile == 2) {
        set_size('#gv_top_block', winW, winH * proportions.mobile_gv_top_block.h)

        set_size_by_y('#gv_tb_left_block', proportions.mobile_gv_tb_left_block.prop, winH * proportions.mobile_gv_top_block.h)
        set_pos('#gv_tb_left_block', (winW - get_size('#gv_tb_left_block').x) * 0.25)

        set_size('#gv_tb_left_block_span', get_size('#gv_tb_left_block').x, get_size('#gv_tb_left_block').y * 0.4)
        set_pos('#gv_tb_left_block_span', 0, (get_size('#gv_tb_left_block').y - get_size('#gv_tb_left_block_span').y)/2 )
        $('#gv_tb_left_block').css('font-size', get_size('#gv_tb_left_block_span').y*0.7)

        set_size_by_y('#gv_tb_right_block', proportions.mobile_gv_tb_right_block.prop, winH * proportions.mobile_gv_top_block.h)
        set_pos('#gv_tb_right_block', winW - get_size('#gv_tb_right_block').x*1.05)

        set_size_by_y('#gv_left_block', proportions.gv_left_block.prop, winH)
        set_size_by_y('#gv_left_block_progress', proportions.gv_left_block.prop, winH)
        set_size_by_y('#gv_left_block_progress_hider', proportions.gv_left_block.prop, winH)

        set_size_by_x('#gv_title_block', proportions.mobile_gv_title_block.prop, winW * proportions.mobile_gv_title_block.w)
        set_pos('#gv_title_block', get_size('#gv_left_block').x+(winW - get_size('#gv_left_block').x - get_size('#gv_title_block').x)/2, get_size('#gv_top_block').y * 1.25 )
        $('#gv_title_block').css('font-size', get_size('#gv_title_block').y)



        set_size_by_x('#gv_frame_block_2, #gv_frame_block', proportions.mobile_gv_frame_block.prop, winW * proportions.mobile_gv_frame_block.w)
        set_pos('#gv_frame_block_2, #gv_frame_block', get_size('#gv_left_block').x+(winW - get_size('#gv_left_block').x  - get_size('#gv_frame_block_2').x)/2, get_pos('#gv_title_block').bottom + get_size('#gv_title_block').y * 0.7)
        
        set_size_by_x('#gv_fb_pic', proportions.gv_fb_pic.prop, get_size('#gv_frame_block').x * 0.95)
        set_pos('#gv_fb_pic', (get_size('#gv_frame_block').x - get_size('#gv_fb_pic').x)/2, (get_size('#gv_frame_block').y - get_size('#gv_fb_pic').y)/2)


        $('#gv_frame_block_2').css('background', "url('images/kino_vert.png')")
        $('#gv_frame_block_2').css('background-size', '100%')

        $('.heart').attr('height', get_size('#gv_tb_right_block').y)

        set_size_by_y('#gv_buttons_block', proportions.mobile_gv_buttons_block.prop, proportions.mobile_gv_buttons_block.h * winH)
        set_pos('#gv_buttons_block', (winW - get_size('#gv_left_block').x - get_size('#gv_buttons_block').x)/2 + get_size('#gv_left_block').x, get_pos('#gv_frame_block_2').bottom + (winH - get_pos('#gv_frame_block_2').bottom - get_size('#gv_buttons_block').y)*0.6)
        
        set_size_by_x('.gv_bb_button', proportions.gv_bb_button.prop, get_size('#gv_buttons_block').x)
        set_size('.gv_bb_button_text', get_size('.gv_bb_button').x, get_size('.gv_bb_button').y)

        set_pos('#button_2', 0, get_size('.gv_bb_button').y * 1.2)
        set_pos('#button_3', 0, get_size('.gv_bb_button').y * 2.4)
        set_pos('#button_4', 0, get_size('.gv_bb_button').y * 3.6)



        set_size_by_x('#gv_game_over_block', proportions.mobile_gv_game_over_block.prop, winW * 0.95)
        set_pos('#gv_game_over_block', (winW - get_size('#gv_game_over_block').x)/2 , (winH - get_size('#gv_game_over_block').y)/2 )

        set_size_by_x('#gv_gob_pic', proportions.gv_strike_block.prop, get_size('#gv_game_over_block').x)
        set_pos('#gv_gob_pic', (get_size('#gv_game_over_block').x - get_size('#gv_gob_pic').x)/2)

        set_size_by_x('.gv_gob_button', proportions.gv_bb_button.prop, get_size('#gv_game_over_block').x*0.8)
        set_size('.gv_gob_button_text, #link_to_group', get_size('.gv_gob_button').x, get_size('.gv_gob_button').y)

        set_pos('#gv_gob_button_1', (get_size('#gv_game_over_block').x - get_size('.gv_gob_button').x)/2, get_size('#gv_game_over_block').y - get_size('.gv_gob_button').y*2.2)
        set_pos('#gv_gob_button_1_hp', (get_size('#gv_game_over_block').x - get_size('.gv_gob_button').x)/2, get_size('#gv_game_over_block').y - get_size('.gv_gob_button').y*2.2)
        
        set_pos('#gv_gob_button_2', (get_size('#gv_game_over_block').x - get_size('.gv_gob_button').x)/2, get_size('#gv_game_over_block').y - get_size('.gv_gob_button').y)

        set_size_by_x('#gv_gob_pic_result', proportions.gv_gob_pic_result.prop, get_size('#gv_gob_pic').x * 0.6)
        set_pos('#gv_gob_pic_result', get_size('#gv_gob_pic').x * 0.05, get_size('#gv_gob_pic').y * 0.25)

        $('#gv_gob_pic_result').css('font-size', get_size('#gv_gob_pic_result').y*0.35)



        set_size('#share_button, #fav_button', winW * 0.175, winW * 0.175)
        set_pos('#share_button', winW - get_size('#share_button').x * 1.25, winH - get_size('#share_button').y * 1.25)
        set_pos('#fav_button', winW - get_size('#share_button').x * 2.5, winH - get_size('#share_button').y * 1.25)
    
    } else if (profile == 3) {
        set_size('#gv_top_block', winW, winH * proportions.mobile_gv_top_block.h)

        set_size_by_y('#gv_tb_left_block', proportions.mobile_gv_tb_left_block.prop, winH * proportions.mobile_gv_top_block.h)
        set_pos('#gv_tb_left_block', (winW - get_size('#gv_tb_left_block').x) * 0.25)

        set_size('#gv_tb_left_block_span', get_size('#gv_tb_left_block').x, get_size('#gv_tb_left_block').y * 0.4)
        set_pos('#gv_tb_left_block_span', 0, (get_size('#gv_tb_left_block').y - get_size('#gv_tb_left_block_span').y)/2 )
        $('#gv_tb_left_block').css('font-size', get_size('#gv_tb_left_block_span').y)

        set_size_by_y('#gv_tb_right_block', proportions.mobile_gv_tb_right_block.prop, winH * proportions.mobile_gv_top_block.h)
        set_pos('#gv_tb_right_block', winW - get_size('#gv_tb_right_block').x*1.05)

        set_size_by_y('#gv_left_block', proportions.gv_left_block.prop, winH)
        set_size_by_y('#gv_left_block_progress', proportions.gv_left_block.prop, winH)
        set_size_by_y('#gv_left_block_progress_hider', proportions.gv_left_block.prop, winH)

        set_size_by_x('#gv_title_block', proportions.mobile_gv_title_block.prop, winW * proportions.mobile_gv_title_block.w)
        set_pos('#gv_title_block', get_size('#gv_left_block').x+(winW - get_size('#gv_left_block').x - get_size('#gv_title_block').x)/2, get_size('#gv_top_block').y * 1.25 )
        $('#gv_title_block').css('font-size', get_size('#gv_title_block').y*0.78)

        $('#gv_frame_block_2').css('background', "url('images/kino_gor.png')")
        $('#gv_frame_block_2').css('background-size', '100%')

        set_size_by_x('#gv_frame_block_2, #gv_frame_block', proportions.gv_frame_block.prop, winW * proportions.mobile_gv_frame_block.w)
        set_pos('#gv_frame_block_2, #gv_frame_block', get_size('#gv_left_block').x+(winW - get_size('#gv_left_block').x  - get_size('#gv_frame_block_2').x)/2, get_pos('#gv_title_block').bottom + get_size('#gv_title_block').y * 0.7)
        
        set_size_by_y('#gv_fb_pic', proportions.gv_fb_pic.prop, get_size('#gv_frame_block').y * 0.86)
        set_pos('#gv_fb_pic', (get_size('#gv_frame_block').x - get_size('#gv_fb_pic').x)/2, (get_size('#gv_frame_block').y - get_size('#gv_fb_pic').y)/2)

        $('.heart').attr('height', get_size('#gv_tb_right_block').y)

        set_best_size('#gv_buttons_block', proportions.mobile_gv_buttons_block.prop, proportions.mobile_gv_buttons_block.w * winW, (winH - get_pos('#gv_frame_block_2').bottom)*0.9)
        set_pos('#gv_buttons_block', (winW - get_size('#gv_left_block').x - get_size('#gv_buttons_block').x)/2 + get_size('#gv_left_block').x, get_pos('#gv_frame_block_2').bottom + (winH - get_pos('#gv_frame_block_2').bottom - get_size('#gv_buttons_block').y)*0.6)
        
        set_size_by_x('.gv_bb_button', proportions.gv_bb_button.prop, get_size('#gv_buttons_block').x)
        set_size('.gv_bb_button_text', get_size('.gv_bb_button').x, get_size('.gv_bb_button').y)

        set_pos('#button_2', 0, get_size('.gv_bb_button').y * 1.2)
        set_pos('#button_3', 0, get_size('.gv_bb_button').y * 2.4)
        set_pos('#button_4', 0, get_size('.gv_bb_button').y * 3.6)


        set_size_by_x('#gv_game_over_block', proportions.mobile_gv_game_over_block.prop, winW * 0.75)
        set_pos('#gv_game_over_block', (winW - get_size('#gv_game_over_block').x)/2 , (winH - get_size('#gv_game_over_block').y)/2 )

        set_size_by_x('#gv_gob_pic', proportions.gv_strike_block.prop, get_size('#gv_game_over_block').x)
        set_pos('#gv_gob_pic', (get_size('#gv_game_over_block').x - get_size('#gv_gob_pic').x)/2)

        set_size_by_x('.gv_gob_button', proportions.gv_bb_button.prop, get_size('#gv_game_over_block').x*0.8)
        set_size('.gv_gob_button_text, #link_to_group', get_size('.gv_gob_button').x, get_size('.gv_gob_button').y)

        set_pos('#gv_gob_button_1', (get_size('#gv_game_over_block').x - get_size('.gv_gob_button').x)/2, get_size('#gv_game_over_block').y - get_size('.gv_gob_button').y*2.2)
        set_pos('#gv_gob_button_1_hp', (get_size('#gv_game_over_block').x - get_size('.gv_gob_button').x)/2, get_size('#gv_game_over_block').y - get_size('.gv_gob_button').y*2.2)
        
        set_pos('#gv_gob_button_2', (get_size('#gv_game_over_block').x - get_size('.gv_gob_button').x)/2, get_size('#gv_game_over_block').y - get_size('.gv_gob_button').y)

        set_size_by_x('#gv_gob_pic_result', proportions.gv_gob_pic_result.prop, get_size('#gv_gob_pic').x * 0.6)
        set_pos('#gv_gob_pic_result', get_size('#gv_gob_pic').x * 0.05, get_size('#gv_gob_pic').y * 0.25)

        $('#gv_gob_pic_result').css('font-size', get_size('#gv_gob_pic_result').y*0.35)

        set_size('#share_button, #fav_button', winH * 0.1, winH * 0.1)
        set_pos('#share_button', winW - get_size('#share_button').x * 1.25, winH - get_size('#share_button').y * 1.25)
        set_pos('#fav_button', winW - get_size('#share_button').x * 2.5, winH - get_size('#share_button').y * 1.25)


    }

    $('.gv_bb_button_text').css('font-size', get_size('.gv_bb_button').y*0.27)
    $('.gv_gob_button_text, #link_to_group').css('font-size', get_size('.gv_gob_button').y*0.3)

    set_size('#gv_lb_strike_counter', get_size('#gv_left_block').x * 0.5, get_size('#gv_left_block').x * 0.4)
    set_pos('#gv_lb_strike_counter', (get_size('#gv_left_block').x - get_size('#gv_lb_strike_counter').x)*0.53, get_size('#gv_left_block').x*0.45 )
    $('#gv_lb_strike_counter').css('font-size', get_size('#gv_lb_strike_counter').y*0.9)

    set_size('#gv_strike_block_back, #gv_game_over_block_back', winW, winH)

    set_best_size('#gv_strike_block', proportions.gv_strike_block.prop, winW*0.95, winH * 0.6)
    set_pos('#gv_strike_block', (winW - get_size('#gv_strike_block').x)*0.5, (winH - get_size('#gv_strike_block').y)/2)


    set_size('#tv_text', get_size('#gv_strike_block').x * 0.4)
    set_size('#gv_gov_tv_text', get_size('#gv_gob_pic').x)
    $('#tv_text, #gv_gov_tv_text').css('font-size', get_size('#gv_strike_block').y * 0.05 + 'px')
    set_pos('#tv_text', (winW - get_size('#tv_text').x)/2, get_pos('#gv_strike_block').bottom + get_size('#gv_strike_block').y * 0.05)
    set_pos('#gv_gov_tv_text', (winW - get_size('#gv_gov_tv_text').x)/2, get_pos('#gv_game_over_block').bottom - get_size('#gv_gob_pic').y * 0.15)

    
    if (tech_core.user_type == 'tv') {
        $('#tv_text').css('display', 'block')
        $('#gv_gov_tv_text').css('display', 'block')
    } else {
        $('#tv_text').css('display', 'none')
        $('#gv_gov_tv_text').css('display', 'none')
    }

    
    $('#version_text').css('font-size', Math.min(winH, winW) * 0.02)
    set_pos('#version_text', winW - Math.min(winH, winW) * 0.02*8, winH * 0.97)

    $('.gv_bb_button, gv_gob_button, .gv_bb_button_text, .gv_gob_button_text, #link_to_group').css('border-radius', get_size('.gv_gob_button_text, #link_to_group').y * (23/105))
    $('#link_to_group').css('line-height', get_size('#link_to_group').y + 'px')

    var isMobile = {
        Android: function() {
            return navigator.userAgent.match(/Android/i);
        },
        BlackBerry: function() {
            return navigator.userAgent.match(/BlackBerry/i);
        },
        iOS: function() {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i);
        },
        Opera: function() {
            return navigator.userAgent.match(/Opera Mini/i);
        },
        Windows: function() {
            return navigator.userAgent.match(/IEMobile/i);
        },
        any: function() {
            return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
        }
    };

    if (isMobile.any()!= null) {
        $('.gv_bb_button').attr('class', 'gv_bb_button nohover')
        $('.gv_gob_button').attr('class', 'gv_gob_button nohover')
    }

    if (HIDE_VERSION) {
        $('#version_text').css('display', 'none')
    }


    if (tech_core.platform != 'vk') {
        $('#share_button, #fav_button').css('display', 'none')
    }

    set_size('#game_preloader', winW, winH)
}



// PC horizontal
var profile_1 = function(winW, winH) {
    
}

// mobile vertical
var profile_2 = function(winW, winH) {

   
} 

var resize_screen = function() {
    var s_time = performance.now();
    
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        // код для мобильных устройств
        graph_core.user_type = 'mobile';
    } else {
        graph_core.user_type = 'pc';
        // код для обычных устройств
    }
    
    graph_core.winW = $(window).width();
    graph_core.winH = $(window).height();


    var winW = graph_core.winW;
    var winH = graph_core.winH;

    var ratio = winW / winH

    if (tech_core.platform == 'sber') {
        winH *= 0.9
        if (winW > winH) {
            winH *= 0.95
        }
    }



    // горизонтальный
    if (ratio >= 1.1) {
        setup_game_viewport(winW, winH, 1)
    // вертикальный
    } else if (ratio <= 0.6) {
        setup_game_viewport(winW, winH, 2)
    // квадратный
    } else {
        setup_game_viewport(winW, winH, 3)
    }

    graph_core.update_progress_bar();
    

    console.log('resized in '+(performance.now() - s_time).toFixed(2) + 'ms')

}

graph_core.resize_screen = resize_screen

window.addEventListener('resize', function() {
    graph_core.resize_screen();
    graph_core.resize_screen();
}, false);
window.addEventListener('fullscreenchange', function() {
    graph_core.resize_screen();
    graph_core.resize_screen();
}, false)



