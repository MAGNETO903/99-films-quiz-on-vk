var add_script_to_head = function(script_src) {
       var script = document.createElement("script");
       script.src = script_src
       document.head.insertAdjacentElement("beforeend", script);
}

var add_script_to_body = function(script_src) {
       var script = document.createElement("script");
       script.src = script_src
       document.body.appendChild(script);
}

var add_inner_script_to_head = function(script_inner) {
       var script = document.createElement("script");
       script.innerHTML = script_inner
       document.head.insertAdjacentElement("beforeend", script);
}


// Подключим нужные библиотеки
if (PLATFORM_TYPE == 'yandex') {
       add_script_to_head('https://yandex.ru/games/sdk/v2')
} else if (PLATFORM_TYPE == 'vk') {
       /*
       add_script_to_head('https://cdn.jsdelivr.net/npm/@vkontakte/vkui@4.13.0/dist/cjs/index.min.js')
       add_script_to_head('https://unpkg.com/@vkontakte/vk-bridge/dist/browser.min.js')
       add_script_to_head('//vk.com/js/api/xd_connection.js?2')
       add_script_to_head('//ad.mail.ru/static/admanhtml/rbadman-html5.min.js')
       add_script_to_head('//vk.com/js/api/adman_init.js')
       */
} else if (PLATFORM_TYPE == 'sber') {
       add_script_to_head('https://unpkg.com/react@17/umd/react.production.min.js')
       add_script_to_head('https://unpkg.com/react-dom@17/umd/react-dom.production.min.js')
       add_script_to_head('https://unpkg.com/@sberdevices/assistant-client@4.5.0/umd/assistant.min.js')
       add_script_to_head('https://cdn-app.sberdevices.ru/shared-static/0.0.0/js/@sberdevices/ad-sdk/ad-sdk.min.js')
       add_script_to_head('https://cdn-app.sberdevices.ru/shared-static/0.0.0/polyfills/cookie-ls-polyfill.min.js')

       
}

              

// Платформы GameMonetize и GameDistribution не требуют подключение (оно осуществляется во время инициализации)

// Подключаем метрику
if (yandex_metrika) {

}


console.log('Сборка завершена')
