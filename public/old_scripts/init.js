// техническое ядро
var tech_core = {
    "user_type": 'none',
    "sdk": "",
    "sdk_ready": true,
    "platform": PLATFORM_TYPE,
    "mouse_down": false,
    "mouse_x": 0,
    "mouse_y": 0,
    "last_interstitial_ad_show": 0,
    "last_interstitial_ad_open": 0,
    "launch_time": Date.now(),
    "tv_data": {
        "cursor_pos": 1,
        "cur_window": "game",
        "strike_block_opened": false,
        "buttons_active": true,
        "last_press_back_time": 0
    },
    "init_sdk": function() {
        //console.re.log('remote log test');
        // инициализция SDK
        if (PLATFORM_TYPE == 'yandex') {
           YaGames
                .init({
                    adv: {
                        onAdvClose: wasShown => {
                            console.info('[yandex] adv closed!');
                        }
                    }
                })
                .then(y_sdk => {
                    y_sdk.getStorage().then(safeStorage => Object.defineProperty(window, 'localStorage', { get: () => safeStorage }))
                    .then(() => {
                       localStorage.setItem('key', '[yandex] safe storage is working');
                       console.log(localStorage.getItem('key'))
                    })
                    tech_core.sdk = y_sdk;
                    tech_core.user_type = y_sdk.deviceInfo.type
                    if (y_sdk.deviceInfo.type != 'tv') {
                        y_sdk.adv.showFullscreenAdv({
                            callbacks: {
                                onOpen: function() {

                                    tech_core.last_interstitial_ad_open = Date.now();

                                },
                                onClose: function(wasShown) {
                                // some action after close
                                    if (wasShown) {
                                        tech_core.send_ym_report('fullscreen_adv_shown')
                                        tech_core.last_interstitial_ad_show = Date.now();
                                        if (tech_core.last_interstitial_ad_show - tech_core.last_interstitial_ad_show > 3000) {
                                            tech_core.send_ym_report('fullscreen_adv_3_sec')
                                        }
                                    }
                                },
                                onError: function(error) {
                                    // some action on error
                                }
                            }
                        })
                    }
                    console.log(y_sdk.deviceInfo.type)
                    //tech_core.user_type = 'tv'
                    tech_core.set_control(tech_core.user_type)
                    if (PLATFORM_TYPE == 'yandex') {
                        tech_core.sdk_ready = true
                    }
                    console.log('[yandex] yandex sdk ready')
                })
        } else if (PLATFORM_TYPE == 'vk') {
            VK.init(function() {
                 // API initialization succeeded
                 // Your code here
                 console.log('[vk] VK SDK inited')
              }, function() {
                 // API initialization failed
                 // Can reload page here
                 console.log('[vk] VK SDK failed to init')
            }, '5.131');


            var user_id = null;   // user's id
            var app_id = VK_APP_ID;  // your app's id
             
            admanInit({
                user_id: user_id,
                app_id: VK_APP_ID,
                type: 'preloader',         // 'preloader' or 'rewarded' (default - 'preloader')
                params: {preview: 1}   // to verify the correct operation of advertising
            }, onAdsReady, onNoAds);
             
            function onAdsReady(adman) {
              adman.onStarted(function () {});
              adman.onCompleted(function() {});          
              adman.onSkipped(function() {});          
              adman.onClicked(function() {});
              adman.start('preroll');

              vkBridge.send("VKWebAppShowNativeAds", {ad_format:"preloader"})
                .then(data => console.log('[vk]', data.result))
                .catch(error => console.log('[vk]', error));
            };
            function onNoAds() {
                console.log('[vk] no ads')
            };

            // подгружает рекламу
            vkBridge.send("VKWebAppCheckNativeAds", {"ad_format": "reward"});
            vkBridge.send("VKWebAppCheckNativeAds", {"ad_format": "interstitial"});
        } else if (PLATFORM_TYPE == 'sber') {
            var onSuccess = () => {
                tech_core.sdk_ready = true
                console.log('[sber] AdSdk Inited');
            };
            var onError = (err) => {
                console.error('[sber] AdSDK Init Error', err);
            };
            const token = SBER_APP_TOKEN;
            const initPhrase = 'Запусти ' + SBER_APP_NAME;

            add_inner_script_to_head(`
                  window.assistant.createAssistant({
                         getState: () => {
                                return {};
                         },
                  });
           `);
            
            if (SBER_testing == true) {
                window.SberDevicesAdSDK.initDev({ token: token, initPhrase: initPhrase, onSuccess, onError, test: true });
            } else {
                window.SberDevicesAdSDK.init({onSuccess, onError, test: false})
            }       
        } else if (PLATFORM_TYPE == 'gm') {
            window.SDK_OPTIONS = {
                gameId: GM_APP_ID,
                onEvent: function (a) {
                    switch (a.name) {
                        case "SDK_GAME_PAUSE":
                
                        // pause game logic / mute audio
                        break;
                        case "SDK_GAME_START":
                            
                            // advertisement done, resume game logic and unmute audio
                        break;
                        case "SDK_READY":
                            console.log('[gm] sdk ready')
                            tech_core.sdk_ready = true
                            // when sdk is ready
                        break;
                    }
                }     
            };
            (function (a, b, c) {
                var d = a.getElementsByTagName(b)[0];
                a.getElementById(c) || (a = a.createElement(b), a.id = c, a.src = "https://api.gamemonetize.com/sdk.js", d.parentNode.insertBefore(a, d))
            })(document, "script", "gamemonetize-sdk"); 
        } else if (PLATFORM_TYPE == 'gd') {
            window["GD_OPTIONS"] = {
                "gameId": GD_APP_ID,
                "advertisementSettings": {
                    "debug": GD_AD_DEBUG, // Enable IMA SDK debugging.
                    "autoplay": false, // Don't use this because of browser video autoplay restrictions.
                    "locale": "en", // Locale used in IMA SDK, this will localize the "Skip ad after x seconds" phrases.
                },
                "onEvent": function(event) {
                    switch (event.name) {
                        case "SDK_GAME_START":
                        // advertisement done, resume game logic and unmute audio

                        break;
                        case "SDK_GAME_PAUSE":
                            // pause game logic / mute audio
                            back_music.mute(true)
                            Howler.volume(0);
                            break;
                        case "SDK_GDPR_TRACKING":
                            // this event is triggered when your user doesn't want to be tracked
                            break;
                        case "SDK_GDPR_TARGETING":
                            // this event is triggered when your user doesn't want personalised targeting of ads and such
                            break;
                    }
                },
            };
            (function(d, s, id) {
                var js, fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) return;
                js = d.createElement(s);
                js.id = id;
                js.src = 'https://html5.api.gamedistribution.com/main.min.js';
                fjs.parentNode.insertBefore(js, fjs);
            }(document, 'script', 'gamedistribution-jssdk'));
        }
    },
    "get_group": function(film_num) {
        
        var group;
        for (var i = 1; i <= groups.length; i++) {
            if (groups[i].includes(film_num) == true) {
                group = i
            }
        }

        return group
    },
    "get_answers": function(film_num) {
        var all_answers = groups[tech_core.get_group(film_num)]

        var answers = get_random_elements(all_answers, 3, [film_num])
        var right_ans_index = Math.floor(Math.random() * 4)
        answers.splice(right_ans_index, 0, film_num)

        return answers

    },
    "load_progress": function() {
        if (SHOULD_LOAD_PROGRESS) {
            var data = window.localStorageFallback.getItem('film_quiz_data')

            if (data != null) {
                //game_core.data = data
                game_core.data = JSON.parse(window.localStorageFallback.getItem('film_quiz_data'))

            }

            if (game_core.data.available_questions == undefined) {
                game_core.data.available_questions = []
                for (var i = 0; i < FILMS_AMOUNT; i++) {
                    if (game_core.data.history.includes(i+1) == false && game_core.data.mistakes_history.includes(i+1) == false) {
                        game_core.data.available_questions.push(i+1)
                    }   
                }
            } else if (game_core.data.available_questions.length == 0) {
                for (var i = 0; i < FILMS_AMOUNT; i++) {
                    if (game_core.data.history.includes(i+1) == false && game_core.data.mistakes_history.includes(i+1) == false) {
                        game_core.data.available_questions.push(i+1)
                    }   
                }
            }
        } else {
            game_core.data.available_questions = []
            for (var i = 0; i < FILMS_AMOUNT; i++) {
                if (game_core.data.history.includes(i+1) == false && game_core.data.mistakes_history.includes(i+1) == false) {
                    game_core.data.available_questions.push(i+1)
                }   
            }
        }
        
    },
    "save_progress": function() {
        window.localStorageFallback.setItem('film_quiz_data', JSON.stringify(game_core.data))
    },
    "show_rewarded_video": function(success_callback) {
        tech_core.send_ym_report('rewarded_video_try');
        if (tech_core.platform == 'yandex') {
            tech_core.sdk.adv.showRewardedVideo({
                callbacks: {
                    onOpen: () => {
                        console.log('[yandex] Video ad open.');
                        tech_core.send_ym_report('rewarded_video_open');
                    },
                    onRewarded: () => {
                        console.log('[yandex] Rewarded!');
                        success_callback()
                        tech_core.send_ym_report('rewarded_video_rewarded')
                    },
                    onClose: () => {
                        console.log('[yandex] Video ad closed.');
                    }, 
                    onError: (e) => {
                        console.log('[yandex] Error while open video ad:', e);
                    }
                }
            })
        } else if (tech_core.platform == 'sber') {
             window.SberDevicesAdSDK.runVideoAd({
                onSuccess: function() {
                    success_callback();
                    tech_core.send_ym_report('rewarded_video_rewarded')
                }, 
                onError: function(e) {
                    console.log(e)
                }, 
                mute: false,
            });
        } else if (tech_core.platform == 'vk') {
            
            vkBridge.send("VKWebAppShowNativeAds", {ad_format:"reward"})
            .then(function(data) {
                success_callback()
                tech_core.send_ym_report('rewarded_video_rewarded')
            })
            .catch(error => console.log(error));
            vkBridge.send("VKWebAppCheckNativeAds", {"ad_format": "reward", "use_waterfall": true});
        }
    },
    "send_ym_report": function(msg) {
        console.log(msg)
        ym(YM_NUMBER, 'reachGoal', msg)
    },
    "show_interstitial_ad": function() {
        
        if (Date.now() - tech_core.last_interstitial_ad_show > AD_INTERVAL && Date.now() - tech_core.launch_time > AD_DELAY) {
            //tech_core.send_ym_report('fullscreen_adv_try')
            if (tech_core.platform == 'yandex') {
                tech_core.sdk.adv.showFullscreenAdv({
                    callbacks: {
                        onOpen: function() {

                            tech_core.last_interstitial_ad_open = Date.now();

                        },
                        onClose: function(wasShown) {
                        // some action after close
                            if (wasShown) {
                                tech_core.send_ym_report('fullscreen_adv_shown')
                                tech_core.last_interstitial_ad_show = Date.now();
                                if (tech_core.last_interstitial_ad_show - tech_core.last_interstitial_ad_show > 3000) {
                                    tech_core.send_ym_report('fullscreen_adv_3_sec')
                                }
                            }
                        },
                        onError: function(error) {
                            // some action on error
                        }
                    }
                })
            } else if (tech_core.platform == 'sber') {
                var onSuccess = function() {
                    tech_core.last_interstitial_ad_show = Date.now();
                    tech_core.send_ym_report('fullscreen_adv_shown')
                }
                var onError = function(e) {
                    console.log(e)
                }
                window.SberDevicesAdSDK.runBanner({
                    onSuccess,
                    onError,
                });
            } else if (tech_core.platform == 'vk') {
                vkBridge.send("VKWebAppCheckNativeAds", {"ad_format": "interstitial"});

                vkBridge.send("VKWebAppShowNativeAds", {ad_format:"interstitial"})
                    .then(function(data) {
                        tech_core.last_interstitial_ad_show = Date.now();
                        tech_core.send_ym_report('fullscreen_adv_shown')
                    })
                    .catch(error => console.log(error));
            }
        }
    },
    "open_group": function() {
        
        window.open("https://vk.com/ingenium_games", "_blank");
        return false
    },
    "invite_friend": function() {
        if (tech_core.platform == 'vk') {
            vkBridge.send("VKWebAppShowInviteBox", {})
            .then(function(data) {
                console.log('[vk]', data)
                tech_core.send_ym_report('invite_friend')
            })
            .catch(function(error) {
                console.log('[vk]', error)
            });
        }
    },
    "add_game_to_menu": function() {
        if (tech_core.platform == 'vk') {
            vkBridge.send("VKWebAppAddToFavorites")
            .then(function(data) {
                if (data.type == 'VKWebAppAddToFavoritesResult') {
                    if (data.result) {
                        // чувак добавил в избранное наше приложение
                        tech_core.send_ym_report('add_to_fav')
                    }
                }
            })
        }
    },
    "join_group": function() {
        if (tech_core.platform == 'vk') {
            tech_core.send_ym_report("vk_join_group_btn")
            console.log("Нажали вступить в группу!")
            vkBridge.send("VKWebAppJoinGroup", {"group_id": 212602446})
            .then(function(data) {
                console.log(data)
                
                if (data.result) {
                    // чувак успешно вступил в группу
                    tech_core.send_ym_report('joined_group')
                }
                
            })
        }
        graph_core.hide_join_group_block();
        game_core.get_next_answer();
        game_core.data.joined_group = true
        tech_core.save_progress();
    },
    "send_post": function() {
        if (tech_core.platform == 'vk') {
            
            var message = ''   

            if (game_core.data.streak == 1) {
                message = 'Мне удалось правильно ответить на 1 вопрос и получить ранг - ЛЕОНАРДО ДИКАПРИО! \n Сможешь также? Дерзай в викторине "Угадай 99 фильмов"!'
            } else if (game_core.data.streak == 3) {
                message = 'Мне удалось правильно ответить на 3 вопроса подряд и получить ранг - РОБЕРТ ДАУНИ младший! \n Сможешь также? Дерзай в викторине "Угадай 99 фильмов"!'
            } else if (game_core.data.streak == 5) {
                message = 'Мне удалось правильно ответить на 5 вопросов подряд и получить ранг - УИЛЛ СМИТ! \n Сможешь также? Дерзай в викторине "Угадай 99 фильмов"!'
            } else if (game_core.data.streak == 10) {
                message = 'Мне удалось правильно ответить на 10 вопросов подряд и получить ранг - СТИВЕН СПИЛБЕРГ! \n Сможешь также? Дерзай в викторине "Угадай 99 фильмов"!'
            } else if (game_core.data.streak == 15) {
                message = 'Мне удалось правильно ответить на 15 вопросов подряд и получить ранг - ТОМ КРУЗ! \n Сможешь также? Дерзай в викторине "Угадай 99 фильмов"!'
            } else if (game_core.data.streak == 20) {
                message = 'Мне удалось правильно ответить на 20 вопросов подряд и получить ранг - АНДЖЕЛИНА ДЖОЛИ! \n Сможешь также? Дерзай в викторине "Угадай 99 фильмов"!'
            } else if (game_core.data.streak == 30) {
                message = 'Мне удалось правильно ответить на 30 вопросов подряд и получить ранг - БРЭД ПИТТ! \n Сможешь также? Дерзай в викторине "Угадай 99 фильмов"!'
            } else if (game_core.data.streak == 50) {
                message = 'Мне удалось правильно ответить на 50 вопросов подряд и получить ранг - ШЕРЛОК ХОЛМС! \n Сможешь также? Дерзай в викторине "Угадай 99 фильмов"!'
            } else if (game_core.data.streak == 99) {
                message = 'Мне удалось правильно ответить на 99 вопросов подряд и получить ранг - ГОЛЛИВУД! \n Сможешь также? Дерзай в викторине "Угадай 99 фильмов"!'
            }

            vkBridge.send("VKWebAppShowWallPostBox", {
                "message": message,
                "attachments": "https://vk.com/app8226570"
            }).then(function(data) {
                if (data.type == 'VKWebAppShowWallPostBoxResult') {
                    tech_core.send_ym_report('send_vk_post')
                } else if (data.type == 'VKWebAppShowWallPostBoxFailed') {
                    tech_core.send_ym_report('failed_send_vk_post')
                }
            })
            
        }
    },
    "reset_progress": function() {
        game_core.data = {
            "history": [],
            "mistakes_history": [],
            "lifes": 3,
            "streak": 0,
            "streak_history": ['0'],
            "right_answers": 0,
            "gotten_review": false,
            "joined_group": false
        }
        tech_core.save_progress();
    },
    "set_control": function(user_type) {
        $('body').mousedown(function(event) {
            tech_core.mouse_down = true
        })

        $('body').mouseup(function(event) {
            tech_core.mouse_down = false
        })

        if (MAKE_SCREEN_ON_X) {
            $( 'body' ).keydown(function( event ) {
                //console.log(event.which)
                if ( event.which == 88 ) {
                    //event.preventDefault();
                    make_screenshot();
                }
            })
        }

        if (user_type == 'desktop') {
            $('body').mouseup(function(event) {
                tech_core.mouse_down = false
            })

            $('body').mousemove(function(event) {
                tech_core.mouse_x = event.pageX;
                tech_core.mouse_y = event.pageY;
            })

        
        } else if (user_type == 'mobile') {
        
            $('body').bind('touchstart', function(e) {
                var touches = e.originalEvent.touches || e.originalEvent.changedTouches;
                var touch = touches[touches.length-1]
                var x = touch.pageX;
                var y = touch.pageY;
                tech_core.mouse_x = x;
                tech_core.mouse_y = y;
                tech_core.mouse_down = true;
            })
        

            $("body").bind('touchend', function() {
                tech_core.mouse_down = false
                
            })

            $("body").bind('touchmove', function(e) {
                var touches = e.originalEvent.touches || e.originalEvent.changedTouches;
                var touch = touches[touches.length-1]
                var x = touch.pageX;
                var y = touch.pageY;
                tech_core.mouse_x = x;
                tech_core.mouse_y = y;
                
            })
        } else if (user_type == 'tv') {
            graph_core.tv_update_cursor();
            if (tech_core.platform == 'yandex') {
                window.addEventListener("keydown", function(event) {
                    
                    if (event.code == 'Enter') {
                        if (tech_core.tv_data.strike_block_opened) {
                            graph_core.hide_strike_block();
                            game_core.get_next_answer();
                        } else if (tech_core.tv_data.cur_window == 'game') {
                            game_core.answer_question(document.getElementById(tech_core.tv_data.cursor_pos))
                        } else if (tech_core.tv_data.cur_window == 'gov_block') {
                            if (tech_core.tv_data.cursor_pos == 1) {
                                game_core.restart_game();
                            } else {
                                game_core.recover_heart();
                            }
                        } else if (tech_core.tv_data.cur_window == 'winner_block') {
                            if (tech_core.tv_data.cursor_pos == 2) {
                                game_core.restart_game();
                            }
                        } else if (tech_core.tv_data.cur_window == 'exit_block') {
                            if (tech_core.tv_data.cursor_pos == 1) {
                                graph_core.hide_exit_block();
                            } else {
                                game_core.exit_game();
                            }
                        }
                    } else if (['ArrowLeft', "ArrowRight", "ArrowUp","ArrowDown"].includes(event.code) == true && tech_core.tv_data.buttons_active) {
                        if (tech_core.tv_data.cur_window == 'game') {
                            tech_core.tv_data.cursor_pos = tv_moves[tech_core.tv_data.cur_window][tech_core.tv_data.cursor_pos][event.code]
                            graph_core.tv_update_cursor();
                        } else if (tech_core.tv_data.cur_window == 'winner_block' || tech_core.tv_data.cur_window == 'exit_block') {
                            if (tech_core.tv_data.cursor_pos == 1) {
                                tech_core.tv_data.cursor_pos = 2
                            } else {
                                tech_core.tv_data.cursor_pos = 1
                            }
                            graph_core.tv_update_cursor();
                        }
                    }
                      
                })

                tech_core.sdk.onEvent(tech_core.sdk.EVENTS.HISTORY_BACK, () => {

                    if (Date.now() - tech_core.tv_data.last_press_back_time < 300) {
                        graph_core.show_exit_block();
                    }
                    tech_core.tv_data.last_press_back_time = Date.now()
                });
            }
        }
    }
}

// графическое ядро
var graph_core = {
    "winW": 0,
    "winH": 0,
    "user_type": 'none',
    "lang": DEFAULT_LANG,
    "resize_screen": function() {},
    "translate": function(lang = this.lang) {
        document.title = text.title[lang]
    },
    
    "open_game_viewport": function() {
        //$('#game_viewport').css('display', 'block')
        $('#game_viewport').fadeIn(1000*ANIMATION)
    },
    "change_frame": function(film_num) {
        var new_url = 'images/frames/' + film_num + '.jpg'
        $('#gv_fb_pic').css('background', 'url('+new_url+')');
        $('#gv_fb_pic').css('background-size', '100%')
    },
    "update_buttons": function(answers) {
        $('.gv_bb_button_red').attr('class', 'gv_bb_button')
        $('.gv_bb_button_green').attr('class', 'gv_bb_button')
        //$('.gv_bb_button').css('background', 'url("images/Button_off.png")')
        //$('.gv_bb_button').css('background-size', '100%')

        //$('.gv_bb_button:hover').css('background', 'url("images/Button_on.png")')
        //$('.gv_bb_button:hover').css('background-size', '100%')

        $('#button_1 .gv_bb_button_text').text(films[answers[0]][this.lang])
        $('#button_2 .gv_bb_button_text').text(films[answers[1]][this.lang])
        $('#button_3 .gv_bb_button_text').text(films[answers[2]][this.lang])
        $('#button_4 .gv_bb_button_text').text(films[answers[3]][this.lang])

        $('.gv_bb_button_text').css('font-size', get_size('.gv_bb_button').y*0.27)
    },
    "reset_buttons": function() {
        $('.gv_bb_button_red').attr('class', 'gv_bb_button')
        $('.gv_bb_button_green').attr('class', 'gv_bb_button')

        if (tech_core.user_type == 'tv') {
            $('.gv_bb_button_hover').attr('class', 'gv_bb_button')
        }


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

        if (isMobile.any() != null) {
            $('.gv_bb_button').attr('class', 'gv_bb_button nohover')
            $('.gv_gob_button').attr('class', 'gv_gob_button nohover')
        }

        if (tech_core.user_type == 'tv') {
            tech_core.tv_data.cursor_pos = 1;
            graph_core.tv_update_cursor();
        }
    },
    "update_step_text": function() {
        var step = game_core.data.history.length-1;

        //$('#gv_tb_left_block_span').text((step+1) + ' '+ text['gv_tb_left_block_span'][graph_core.lang] + ' 99')
        $('#gv_tb_left_block_span').text('вопрос '+ (step+1))
    },
    "update_progress_bar": function() {
        var full_step_h = 88.6/850 * get_size('#gv_left_block').y;
        var circle_h = 29/850 * get_size('#gv_left_block').y;
        var margin = 20/850 * get_size('#gv_left_block').y;
        if (game_core.data.streak == 0) {
            set_size('#gv_left_block_progress_hider', 'none', get_size('#gv_left_block').y - margin)
        } else if (game_core.data.streak == 1) {
            set_size('#gv_left_block_progress_hider', 'none', get_size('#gv_left_block').y - margin - circle_h)
        } else if (game_core.data.streak > 1 && game_core.data.streak <= 3) {
            var cur_step_h = ((game_core.data.streak - 1) / (3-1)) * full_step_h
            set_size('#gv_left_block_progress_hider', 'none', get_size('#gv_left_block').y - margin - circle_h - cur_step_h)
        } else if (game_core.data.streak > 3 && game_core.data.streak <= 5) {
            var cur_step_h = ((game_core.data.streak - 3) / (5-3)) * full_step_h
            set_size('#gv_left_block_progress_hider', 'none', get_size('#gv_left_block').y - margin - circle_h - full_step_h - cur_step_h)
        } else if (game_core.data.streak > 5 && game_core.data.streak <= 10) {
            var cur_step_h = ((game_core.data.streak - 5) / (10-5)) * full_step_h
            set_size('#gv_left_block_progress_hider', 'none', get_size('#gv_left_block').y - margin - circle_h - full_step_h*2 - cur_step_h)
        } else if (game_core.data.streak > 10 && game_core.data.streak <= 15) {
            var cur_step_h = ((game_core.data.streak - 10) / (15-10)) * full_step_h
            set_size('#gv_left_block_progress_hider', 'none', get_size('#gv_left_block').y - margin - circle_h - full_step_h*3 - cur_step_h)
        } else if (game_core.data.streak > 15 && game_core.data.streak <= 20) {
            var cur_step_h = ((game_core.data.streak - 15) / (20-15)) * full_step_h
            set_size('#gv_left_block_progress_hider', 'none', get_size('#gv_left_block').y - margin - circle_h - full_step_h*4 - cur_step_h)
        } else if (game_core.data.streak > 20 && game_core.data.streak <= 30) {
            var cur_step_h = ((game_core.data.streak - 20) / (30-20)) * full_step_h
            set_size('#gv_left_block_progress_hider', 'none', get_size('#gv_left_block').y - margin - circle_h - full_step_h*5 - cur_step_h)
        } else if (game_core.data.streak > 30 && game_core.data.streak <= 50) {
            var cur_step_h = ((game_core.data.streak - 30) / (50-30)) * full_step_h
            set_size('#gv_left_block_progress_hider', 'none', get_size('#gv_left_block').y - margin - circle_h - full_step_h*6 - cur_step_h)
        } else if (game_core.data.streak > 50 && game_core.data.streak <= 99) {
            var cur_step_h = ((game_core.data.streak - 50) / (99-50)) * full_step_h
            set_size('#gv_left_block_progress_hider', 'none', get_size('#gv_left_block').y - margin - circle_h - full_step_h*7 - cur_step_h)
        }
    },
    "destroy_heart": function() {
        var id = '#heart_' + (3-game_core.data.lifes)
        $(id).attr('src', 'images/heart_off.png')
    },
    "recover_heart": function() {
        var id = '#heart_' + (4-game_core.data.lifes)
        $(id).attr('src', 'images/heart_on.png')
    },
    "update_hearts": function() {
        if (game_core.data.lifes == 2) {
            $('#heart_1').attr('src', 'images/heart_off.png')
        } else if (game_core.data.lifes == 1) {
            $('#heart_1').attr('src', 'images/heart_off.png')
            $('#heart_2').attr('src', 'images/heart_off.png')
        } else if (game_core.data.lifes == 0) {
            $('#heart_1').attr('src', 'images/heart_off.png')
            $('#heart_2').attr('src', 'images/heart_off.png')
            $('#heart_3').attr('src', 'images/heart_off.png')
            
        }
    },
    "make_button_green": function(id) {
        var btn_id = '#button_' + id;

        $(btn_id).attr('class', 'gv_bb_button_green')

        //$(btn_id).css('background', 'url("images/Button_yes.png")')
        //$(btn_id).css('background-size', '100%')
    },
    "make_button_red": function(id) {
        var btn_id = '#button_' + id;

        $(btn_id).attr('class', 'gv_bb_button_red')
        
    },
    "update_streak_counter": function() {
        $('#gv_lb_strike_counter').text(game_core.data.streak)
    },
    "show_strike_block": function() {
        

        
        if (game_core.data.streak == 1) {
            tech_core.send_ym_report('1_answer')
            $('#gv_gob_pic').css('background', 'url("images/card_1.png")')
        } else if (game_core.data.streak == 3) {
            tech_core.send_ym_report('3_answers')
            $('#gv_gob_pic').css('background', 'url("images/card_2.png")')
        } else if (game_core.data.streak == 5) {
            tech_core.send_ym_report('5_answers')
            $('#gv_gob_pic').css('background', 'url("images/card_3.png")')
        } else if (game_core.data.streak == 10) {
            tech_core.send_ym_report('10_answers')
            $('#gv_gob_pic').css('background', 'url("images/card_4.png")')
        } else if (game_core.data.streak == 15) {
            tech_core.send_ym_report('15_answers')
            $('#gv_gob_pic').css('background', 'url("images/card_5.png")')
        } else if (game_core.data.streak == 20) {
            tech_core.send_ym_report('20_answers')
            $('#gv_gob_pic').css('background', 'url("images/card_6.png")')
        } else if (game_core.data.streak == 30) {
            tech_core.send_ym_report('30_answers')
            $('#gv_gob_pic').css('background', 'url("images/card_7.png")')
        } else if (game_core.data.streak == 50) {
            tech_core.send_ym_report('50_answers')
            $('#gv_gob_pic').css('background', 'url("images/card_8.png")')
        } else if (game_core.data.streak == 99) {
            tech_core.send_ym_report('99_answers')
            $('#gv_gob_pic').css('background', 'url("images/card_9.png")')
        }

        if (tech_core.user_type == 'tv') {
            tech_core.tv_data.strike_block_opened = true
            $('#tv_text').css('display', 'block')
        }

        $('#gv_gob_pic').css('background-size', '100%')
        if (tech_core.platform != 'vk') {
            $('#gv_strike_block_back').fadeIn(1000*ANIMATION)
        } else {
            $('#gv_gob_pic_result').css('display', 'none')
        
        
            $('#gv_gob_button_1_hp').attr('id', 'gv_gob_button_1')


            $('#link_to_group').css('display', 'none')
            $('#gv_gob_button_1 .gv_gob_button_text').css('display', 'table-cell')

            $('#gv_gob_button_1 .gv_gob_button_text').text('Поделиться на странице')
            $('#gv_gob_button_1 .gv_gob_button_text').attr('onclick', "tech_core.send_post();graph_core.hide_strike_block();game_core.get_next_answer();")         

            $('#gv_gob_button_2 .gv_gob_button_text').text('Дальше')
            $('#gv_gob_button_2 .gv_gob_button_text').attr('onclick', "graph_core.hide_strike_block();game_core.get_next_answer();")   

            $('#gv_gob_button_1').attr('id', 'gv_gob_button_1_hp')

            $('#gv_game_over_block_back').fadeIn(1000*ANIMATION)

        }


    },
    "hide_strike_block": function() {
        //$('#gv_strike_block_back').fadeOut(1000*ANIMATION)
        $('#gv_strike_block_back').css('display', 'none')
        if (tech_core.platform == 'vk') {
            $('#gv_game_over_block_back').css('display', 'none')
        }

        if (tech_core.user_type == 'tv') {
            tech_core.tv_data.strike_block_opened = false
        }
    },
    "update_strike_block": function() {
        if (game_core.data.streak == 1) {
            $('#gv_strike_block').css('background', 'url("images/card_1.png")')
        } else if (game_core.data.streak == 3) {
            $('#gv_strike_block').css('background', 'url("images/card_2.png")')
        } else if (game_core.data.streak == 5) {
            $('#gv_strike_block').css('background', 'url("images/card_3.png")')
        } else if (game_core.data.streak == 10) {
            $('#gv_strike_block').css('background', 'url("images/card_4.png")')
        } else if (game_core.data.streak == 15) {
            $('#gv_strike_block').css('background', 'url("images/card_5.png")')
        } else if (game_core.data.streak == 20) {
            $('#gv_strike_block').css('background', 'url("images/card_6.png")')
        } else if (game_core.data.streak == 30) {
            $('#gv_strike_block').css('background', 'url("images/card_7.png")')
        } else if (game_core.data.streak == 50) {
            $('#gv_strike_block').css('background', 'url("images/card_8.png")')
        } else if (game_core.data.streak == 99) {
            $('#gv_strike_block').css('background', 'url("images/card_9.png")')
        }
        $('#gv_strike_block').css('background-size', '100%')
    },
    "show_game_over_block": function() {
        

        $('#gv_gob_pic').css('background', 'url("images/card_10.png")')
        $('#gv_gob_pic').css('background-size', '100%')

        $('#gv_gob_pic_result').css('display', 'block')
        
        
        $('#gv_gob_button_1_hp').attr('id', 'gv_gob_button_1')

        $('#link_to_group').css('display', 'none')
        $('#gv_gob_button_1 .gv_gob_button_text').css('display', 'table-cell')

        $('#gv_gob_button_1 .gv_gob_button_text').text(text.gv_gob_button_1_text[graph_core.lang])
        $('#gv_gob_button_1 .gv_gob_button_text').attr('onclick', "game_core.restart_game();")

        $('#gv_gob_button_2 .gv_gob_button_text').text(text.gv_gob_button_2_text[graph_core.lang])
        $('#gv_gob_button_2 .gv_gob_button_text').attr('onclick', "game_core.recover_heart();")

        if (tech_core.user_type == 'tv') {
            tech_core.tv_data.cur_window = 'gov_block'
            tech_core.tv_data.cursor_pos = 1;
            tech_core.tv_data.buttons_active = true
            graph_core.tv_update_cursor();


            $('#gv_gob_button_1, #gv_gob_button_2').css('display', 'none')
            $('#gv_gov_tv_text').css('display', 'block')

        }

        $('#gv_game_over_block_back').fadeIn(1000*ANIMATION)
    },
    "hide_game_over_block": function() {
        $('#gv_game_over_block_back').fadeOut(1000*ANIMATION)
    },
    "update_game_over_block": function() {
        var html_result = ``

        html_result += text.gv_gob_pic_result_1[graph_core.lang];
        html_result += game_core.data.right_answers;
        html_result += '<br>'
        html_result += text.gv_gob_pic_result_2[graph_core.lang]

        
        html_result += rangs[String(game_core.data.streak_history[game_core.data.streak_history.length-1])][graph_core.lang]

        $('#gv_gob_pic_result').html(html_result)
    },
    "show_winner_block": function() {
        $('#gv_gob_pic').css('background', 'url("images/card11.png")')
        $('#gv_gob_pic').css('background-size', '100%')

        $('#gv_gob_pic_result').css('display', 'none')
        $('#link_to_group').css('display', 'none')
        $('#gv_gob_button_1 .gv_gob_button_text').css('display', 'table-cell')

        $('#gv_gob_button_1').attr('id', 'gv_gob_button_1_hp')

        $('#gv_gob_button_1_hp .gv_gob_button_text').text(text.gv_winner_button_1_text[graph_core.lang])
        $('#gv_gob_button_1_hp .gv_gob_button_text').attr('onclick', "game_core.go_to_hp_quiz();")

        $('#gv_gob_button_2 .gv_gob_button_text').text(text.gv_winner_button_2_text[graph_core.lang])
        $('#gv_gob_button_2 .gv_gob_button_text').attr('onclick', "game_core.restart_game();")

        if (tech_core.user_type == 'tv') {
            tech_core.tv_data.cur_window = 'winner_block'
            tech_core.tv_data.buttons_active = true
            tech_core.tv_data.cursor_pos = 1
            graph_core.tv_update_cursor();
        }

        $('#gv_game_over_block_back').fadeIn(1000*ANIMATION)
    },
    "hide_winner_block": function() {
        $('#gv_game_over_block_back').fadeOut(1000*ANIMATION)
    },
    "show_get_review_block": function() {
        

        $('#gv_gob_pic_result').css('display', 'none')

        $('#gv_gob_button_1_hp').attr('id', 'gv_gob_button_1')


        if (tech_core.platform == 'vk') {
            $('#gv_gob_button_1 .gv_gob_button_text').text('Вступить в группу!')
            $('#gv_gob_button_2 .gv_gob_button_text').text('Позже вступить')
            $('#gv_gob_pic').css('background', 'url("images/card13.png")')
        } else {
            $('#gv_gob_button_1 .gv_gob_button_text').text(text.gv_get_review_button_1_text[graph_core.lang])
            $('#gv_gob_button_2 .gv_gob_button_text').text(text.gv_get_review_button_2_text[graph_core.lang])
            $('#gv_gob_pic').css('background', 'url("images/card12.png")')
        
        }

        $('#link_to_group').css('display', 'none')
        $('#gv_gob_button_1 .gv_gob_button_text').css('display', 'table-cell')

        $('#gv_gob_pic').css('background-size', '100%')
        
        $('#gv_gob_button_1 .gv_gob_button_text').attr('onclick', "game_core.get_review();graph_core.hide_get_review_block();")

        $('#gv_gob_button_1').attr('id', 'gv_gob_button_1_hp')

        $('#gv_gob_button_2 .gv_gob_button_text').text(text.gv_get_review_button_2_text[graph_core.lang])
        $('#gv_gob_button_2 .gv_gob_button_text').attr('onclick', "graph_core.hide_get_review_block();game_core.get_next_answer();")

        $('#gv_game_over_block_back').fadeIn(1000*ANIMATION)
    },
    "hide_get_review_block": function() {

        $('#gv_game_over_block_back').css('display', 'none')
    },
    "show_join_group_block": function() {
        tech_core.send_ym_report("vk_view_group_block")
        
        
         $('#gv_gob_pic_result').css('display', 'none')

        $('#gv_gob_button_1_hp').attr('id', 'gv_gob_button_1')


        $('#gv_gob_button_1 .gv_gob_button_text').text('Вступить в группу!')
        $('#gv_gob_button_2 .gv_gob_button_text').text('Позже вступить')
        $('#gv_gob_pic').css('background', 'url("images/card13.png")')
        

        $('#gv_gob_pic').css('background-size', '100%')
            

        if (tech_core.platform == 'vk') {
            $('#gv_gob_button_1 .gv_gob_button_text').css('display', 'table-cell')
            $('#gv_gob_button_1 .gv_gob_button_text').attr('onclick', "tech_core.join_group();")
        } else {
            $('#link_to_group').css('display', 'table-cell')
            $('#gv_gob_button_1 .gv_gob_button_text').css('display', 'none')
        }
        
        $('#gv_gob_button_1').attr('id', 'gv_gob_button_1_hp')

        //$('#gv_gob_button_2 .gv_gob_button_text').text(text.gv_get_review_button_2_text[graph_core.lang])
        $('#gv_gob_button_2 .gv_gob_button_text').attr('onclick', 'graph_core.hide_join_group_block();game_core.get_next_answer();tech_core.send_ym_report("vk_rejected_join_group_btn");')

        $('#gv_game_over_block_back').fadeIn(1000*ANIMATION)
    },  
    "hide_join_group_block": function() {
        $('#gv_game_over_block_back').css('display', 'none')
    },
    "recover_all_hearts": function() {
        $('#heart_1').attr('src', 'images/heart_on.png');
        $('#heart_2').attr('src', 'images/heart_on.png');
        $('#heart_3').attr('src', 'images/heart_on.png');
    },
    "deactivate_buttons": function() {
        $('.gv_bb_button_text').attr('onclick', '')
        if (tech_core.user_type == 'tv') {
            tech_core.tv_data.buttons_active = false
        }
    },
    "activate_buttons": function() {
        $('.gv_bb_button_text').attr('onclick', 'game_core.answer_question(this);')
        if (tech_core.user_type == 'tv') {
            tech_core.tv_data.buttons_active = true
        }
    },
    "tv_update_cursor": function() {
        $('.gv_bb_button_hover').attr('class', "gv_bb_button")
        $('.gv_gob_button_hover').attr('class', "gv_gob_button")
        $('#gv_gob_button_1_hp_hover').attr('id', 'gv_gob_button_1_hp')
        if (tech_core.tv_data.cur_window == 'game') {

            var cursor_id = '#button_' + tech_core.tv_data.cursor_pos;
            $(cursor_id).attr('class', 'gv_bb_button_hover')
        } else if (tech_core.tv_data.cur_window == 'gov_block') {
            


            var cursor_id = '#gv_gob_button_' + tech_core.tv_data.cursor_pos;
            $(cursor_id).attr('class', 'gv_gob_button_hover')
        } else if (tech_core.tv_data.cur_window == 'winner_block' || tech_core.tv_data.cur_window == 'exit_block') {
            if (tech_core.tv_data.cursor_pos == 1) {
                var cursor_id = '#gv_gob_button_1_hp';
                $(cursor_id).attr('id', 'gv_gob_button_1_hp_hover')
            } else {
                var cursor_id = '#gv_gob_button_' + tech_core.tv_data.cursor_pos;
                $(cursor_id).attr('class', 'gv_gob_button_hover')
            }
        }
    },
    "show_exit_block": function() {
        $('#gv_gob_pic_result').css('display', 'none')

        $('#gv_gob_button_1_hp').attr('id', 'gv_gob_button_1')


        $('#gv_gob_button_1 .gv_gob_button_text').text('Нет!')
        $('#gv_gob_button_2 .gv_gob_button_text').text('Выйти')
        $('#gv_gob_pic').css('background', 'url("images/card14.png")')
        

        $('#gv_gob_pic').css('background-size', '100%')
            


        
        $('#link_to_group').css('display', 'none')

        $('#gv_gob_button_1 .gv_gob_button_text').css('display', 'table-cell')


        $('#gv_gob_pic').css('background-size', '100%')
        
        $('#gv_gob_button_1 .gv_gob_button_text').attr('onclick', "graph_core.hide_exit_block();")
        $('#gv_gob_button_2 .gv_gob_button_text').attr('onclick', "game_core.exit_game();")

        $('#gv_gob_button_1').attr('id', 'gv_gob_button_1_hp')

        if (tech_core.user_type == 'tv') {
            tech_core.tv_data.cur_window = 'exit_block'
            tech_core.tv_data.buttons_active = true
            tech_core.tv_data.cursor_pos = 1
            graph_core.tv_update_cursor();
        }
        
        $('#gv_game_over_block_back').fadeIn(ANIMATION*1000)
    },
    "hide_exit_block": function() {
        $('#gv_game_over_block_back').css('display', 'none')
        if (tech_core.user_type == 'tv') {
            tech_core.tv_data.cur_window = 'game'
            tech_core.tv_data.buttons_active = true
            tech_core.tv_data.cursor_pos = 1
            graph_core.tv_update_cursor();
        }
    }
}

// игровой объект
var game_core = {
    "data": {
        "history": [],
        "mistakes_history": [],
        "lifes": 3,
        "streak": 0,
        "streak_history": ['0'],
        "right_answers": 0,
        "gotten_review": false,
        "joined_group": false
    },
    "start_game": function() {
        if (tech_core.platform == 'yandex') {
            tech_core.send_ym_report('visit_ya_games')
        } else if (tech_core.platform == 'vk') {
            tech_core.send_ym_report('visit_vk')
        } else if (tech_core.platform == 'sber') {
            tech_core.send_ym_report('visit_sber')
        } else if (tech_core.platform == 'crazygames') {
            tech_core.send_ym_report('visit_crazygames')
        } else if (tech_core.platform == 'gamedistribution') {
            tech_core.send_ym_report('visit_gamedistribution')
        }



        graph_core.open_game_viewport();
       
        tech_core.load_progress();
        

        // предзагрузка всех карточек
        $('body').append('<img src="images/card_2.png" class="hidden">')
        $('body').append('<img src="images/card_3.png" class="hidden">')
        $('body').append('<img src="images/card_4.png" class="hidden">')
        $('body').append('<img src="images/card_5.png" class="hidden">')
        $('body').append('<img src="images/card_6.png" class="hidden">')
        $('body').append('<img src="images/card_7.png" class="hidden">')
        $('body').append('<img src="images/card_8.png" class="hidden">')
        $('body').append('<img src="images/card_9.png" class="hidden">')
        $('body').append('<img src="images/card_10.png" class="hidden">')

        if (game_core.data.history.length > 0) {
            var last_question = game_core.data.history[game_core.data.history.length-1]
            game_core.data.history.pop();
            game_core.create_question(last_question)
        } else {

            //game_core.data.history.push(Math.floor(Math.random()*FILMS_AMOUNT))
            //var last_question = game_core.data.history[game_core.data.history.length-1]
            game_core.data.history.pop();
            var next_quest_num = get_random_elements(game_core.data.available_questions)[0]
            game_core.create_question(next_quest_num)
        }

        graph_core.update_progress_bar();
        graph_core.update_streak_counter();
        graph_core.update_strike_block();
        graph_core.update_step_text();
        graph_core.update_hearts();

        if (game_core.data.lifes < 1) {
            //graph_core.show_game_over_block();
            game_core.restart_game();
        }

        graph_core.resize_screen();
    },
    "create_question": function(film_num) {
        //console.log('->', film_num)
        graph_core.change_frame(film_num)

        var answers = tech_core.get_answers(film_num)

        graph_core.update_buttons(answers)
        game_core.data.history.push(film_num)
    },
    "get_next_answer": function() {
        

        
        
        if (game_core.data.lifes < 1) {
            // проиграли
            graph_core.update_game_over_block();
            graph_core.show_game_over_block();
            tech_core.save_progress();
        } else {

            if (game_core.data.streak == WINNER_STREAK) {
                graph_core.show_winner_block();
            } else {
                var next_quest_num = get_random_elements(game_core.data.available_questions)[0]
                // делаем предзагрузку
               
                setTimeout(function() {

                    //tech_core.show_interstitial_ad();
                    $('#game_viewport').fadeOut(FLASH_DELAY_1)
                    

                    setTimeout(function() { 
                        if (game_core.data.history.length < FILMS_AMOUNT) {
                            $('#game_viewport').fadeIn(FLASH_DELAY_2)
                            
                            game_core.create_question(next_quest_num);
                            graph_core.update_step_text();
                        } else {
                            $('#game_viewport').fadeIn(FLASH_DELAY_2)
                            game_core.create_question(next_quest_num);
                            graph_core.update_step_text();
                        }
                        tech_core.save_progress();
                        graph_core.activate_buttons();
                        graph_core.reset_buttons();
                    }, FLASH_DELAY_1)
                }, DELAY_BEFORE_FLASHING)
            }
        }
    },
    "answer_question": function(button_html) {
        var answer_text = button_html.innerText;
        var right_ans_id;
        for (var i=0; i < 4; i++) {
            if ($('#'+(i+1)).text() == films[game_core.data.history[game_core.data.history.length-1]][graph_core.lang]) {
                right_ans_id = i;
            }
        }

        if (films[game_core.data.history[game_core.data.history.length-1]][graph_core.lang] == answer_text) {
            graph_core.make_button_green(button_html.id)
            game_core.data.streak += 1
            game_core.data.right_answers +=1    
            var right_ans_film = game_core.data.history[game_core.data.history.length-1];
            if (game_core.data.mistakes_history.includes(right_ans_film)) {
                game_core.data.mistakes_history = delete_val(game_core.data.mistakes_history, right_ans_film)
            }
            game_core.data.available_questions = delete_val(game_core.data.available_questions, right_ans_film)
       
        } else {
            var right_ans_film = game_core.data.history[game_core.data.history.length-1];
            game_core.data.streak = 0
            game_core.data.lifes -= 1
            graph_core.destroy_heart();
            graph_core.make_button_red(button_html.id)
            if (MARK_RIGHT_ANS) {
                graph_core.make_button_green(right_ans_id+1)
            }
            if (game_core.data.mistakes_history.includes(right_ans_film) == false) {
                game_core.data.mistakes_history.push(right_ans_film)
            }
            
        }

        graph_core.deactivate_buttons();

        graph_core.update_progress_bar();
        graph_core.update_streak_counter();
        graph_core.update_strike_block();

        if ([1,3,5,10,15,20,30,50,99].includes(game_core.data.streak) && game_core.data.streak_history.includes(game_core.data.streak) == false && SHOW_STRIKE_BLOCK) {
            game_core.data.streak_history.push(game_core.data.streak)
            graph_core.update_strike_block();
            graph_core.show_strike_block();
        } else if ([1,3,5,10,15,20,30,50,99].includes(game_core.data.streak) == false && game_core.data.history.length > 8 && game_core.data.gotten_review == false && tech_core.user_type != 'tv') {
            game_core.data.gotten_review = true
            if (tech_core.platform != 'vk') {
                graph_core.show_get_review_block();
            } else {
                graph_core.show_join_group_block();
                game_core.data.joined_group = true;
                tech_core.save_progress();
            }
        } else if ([1,3,5,10,15,20,30,50,99].includes(game_core.data.streak) == false && game_core.data.history.length > 16 && game_core.data.joined_group == false && tech_core.user_type != 'tv') {
            if (tech_core.platform != 'vk') {
                game_core.data.joined_group = true
                graph_core.show_join_group_block();
                tech_core.save_progress();
            } else {
                game_core.get_next_answer();
            }
        } else {
            game_core.get_next_answer();
        }   
    },
    "restart_game": function() {
        var gotten_review = game_core.data.gotten_review;
        var joined_group = game_core.data.joined_group
        var streak_history = game_core.data.streak_history;
        game_core.data = {
            "history": [],
            "mistakes_history": [],
            "lifes": 3,
            "streak": 0,
            "streak_history": streak_history,
            "right_answers": 0,
            "gotten_review": gotten_review,
            "joined_group": joined_group,
            "available_questions": [],
        }
        for (var i = 0; i < FILMS_AMOUNT; i++) {
            game_core.data.available_questions.push(i+1)
        }

        graph_core.hide_game_over_block();
        game_core.create_question(Math.floor(Math.random()*FILMS_AMOUNT)+1)
        graph_core.reset_buttons();
        graph_core.update_progress_bar();
        graph_core.update_streak_counter();
        graph_core.update_strike_block();
        graph_core.update_step_text();

        graph_core.recover_all_hearts();

        tech_core.save_progress();
        graph_core.activate_buttons();

        if (tech_core.user_type == 'tv') {
            tech_core.tv_data.cur_window = 'game'
            graph_core.tv_update_cursor();
        }
    },
    "recover_heart": function() {

        tech_core.show_rewarded_video(function() {
            game_core.data.lifes += 1
            graph_core.recover_heart();
            graph_core.hide_game_over_block();
            graph_core.reset_buttons();
            graph_core.activate_buttons();
            if (tech_core.user_type == 'tv') {
                tech_core.tv_data.cur_window = 'game'
                graph_core.tv_update_cursor();
            }
        })
    },
    "go_to_hp_quiz": function() {
        
    },
    "get_review": function() {
        tech_core.send_ym_report('gotten_review')
        if (tech_core.platform == 'yandex') {
            tech_core.sdk.feedback.canReview()
                .then(({ value, reason }) => {
                    if (value) {
                        tech_core.sdk.feedback.requestReview()
                            .then(({ feedbackSent }) => {
                                console.log(feedbackSent);
                                graph_core.hide_get_review_block();
                                
                        })
                } else {
                    console.log(reason)
                }
            })

        } else if (tech_core.platform == 'sber') {
            var assistantRef = window.SberDevicesAdSDK.getAssistantRef();
            var assistant = assistantRef.current;
            assistant.sendData({ action: { action_id: 'SHOW_RATING_SUGGEST'} });
            graph_core.hide_get_review_block();
        } else if (tech_core.platform == 'vk') {
            window.open("https://vk.com/ingenium_games", "_blank");
            return false
        }
        game_core.data.gotten_review = true;
        tech_core.save_progress();
        game_core.get_next_answer();
    },

    "answer_question_right": function() {
        var right_ans_id;
        for (var i=0; i < 4; i++) {
            if ($('#'+(i+1)).text() == films[game_core.data.history[game_core.data.history.length-1]][graph_core.lang]) {
                right_ans_id = i;
            }
        }
        console.log($('#'+(right_ans_id+1)))
        game_core.answer_question(document.getElementById((right_ans_id+1)))
    },
    "exit_game": function() {
        if (tech_core.platform == 'yandex') {
            tech_core.sdk.dispatchEvent(tech_core.sdk.EVENTS.EXIT);
        }
    }
}

var make_screenshot = function() {
    console.log('making screen')
}