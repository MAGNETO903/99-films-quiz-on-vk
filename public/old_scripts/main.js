


window.onload = function() {
	$('#game_preloader').fadeOut(1000)
	try {
		tech_core.init_sdk();
	} catch (err) {
		console.log(':(')
		console.log(err)
	}
	if (PLATFORM_TYPE != 'yandex') {
		if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
		    // код для мобильных устройств
		    tech_core.user_type = 'mobile';
		  } else {
		    tech_core.user_type = 'desktop';
		    // код для обычных устройств
		}
	}
	
	graph_core.resize_screen();

	graph_core.translate()
	console.log('сборка', build)

	game_core.start_game();
	graph_core.resize_screen();
}	





