// просто для выкачивания списка всех игр

const path = require("path");
const fs = require('fs');

const puppeteer = require('puppeteer')
const cheerio = require('cheerio');

const {
  performance
} = require('perf_hooks');


const VERTICAL = false;
const HORIZONTAL = true;
const SBERPORTAL = true;

const DIR_URL = "snake_extra/screenshots"

async function save_all_links_to_file() {
    var json = JSON.stringify([...games_links]);
      
      fs.writeFile('data/game_links.json', json, 'utf8', function() {
        console.log("saved!")
      })
}

async function save_screenshot(page) {
    console.log('making')
    if (HORIZONTAL) {
        page.setViewport( { 'width' : 1600, 'height' : 900 } );
        await page.waitFor(1000)
        page.screenshot({path: DIR_URL+'/horizontal_'+performance.now()+'.png'});
    }
    await page.waitFor(1000)
    if (VERTICAL) {
        page.setViewport( { 'width' : 900, 'height' : 1600 } );
        await page.waitFor(1000)
        page.screenshot({path: DIR_URL+'/vertical_'+performance.now()+'.png'});
    }
    await page.waitFor(1000)
    if (SBERPORTAL) {
        page.setViewport( { 'width' : 1280, 'height' : 800 } );
        await page.waitFor(1000)
        page.screenshot({path: DIR_URL+'/sberportal_'+performance.now()+'.png'});
    }
    await page.waitFor(1000)
    page.setViewport({ 'width' : 800, 'height' : 600 })

    
}

(async () => {
    console.log('active');
    // запускаем puppeteer
    var browser = await puppeteer.launch({
        headless: false, 
        devtools: false,
        'defaultViewport' : { 'width' : 800, 'height' : 600 }
    });
    var page = await browser.newPage();

    //

    // переходим на сайт
    await page.goto('http://localhost:3000');

    //await page.setViewport( { 'width' : 1920, 'height' : 1080 } );
    //await page.screenshot({path: 'film_quiz_extra/screenshots/1.png'});


    await page.exposeFunction('make_screenshot', (async () => {
        console.log('Interesting function has been called. Taking a screenshot now.');
        return await save_screenshot(page);
    }));


    //await page.setViewport( { 'width' : 1280, 'height' : 720 } );
    await page.waitFor(200000)
  

    //await save_all_links_to_file();

    //await browser.close();
 })();