//const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');




const puppeteer = require('puppeteer')
const fs = require("fs");

const {performance} = require('perf_hooks');

const DIR_URL = "extra/frames"

const FPS = 50;
const PORT = 3000;

//const file = fs.createWriteStream(DIR_URL + "/"+performance.now()+".mp4");
var streaming = false;

var size = {
	width: 1080,
	height: 1920
}

const MARGIN_Y = 131;



async function run() {
	/*
	const browser = await launch({
		devtools: false,
		headless: false,
		ignoreHTTPSErrors: true,
    args: [`--window-size=400,400`], // new option
    defaultViewport: size,
	});
	*/
		


	 var browser = await puppeteer.launch({
        headless: true, 
        devtools: false,
        
        ignoreHTTPSErrors: true,
        args: [`--window-size=`+size.width+`,`+(size.height+MARGIN_Y)] // new option
    });

	
	const page = await browser.newPage();
	await page.setViewport({
		"width": size.width,
		"height": size.height,
		deviceScaleFactor: 1
	})
	await page.goto("http://localhost:"+PORT);

	

	await page.exposeFunction('make_screenshot', (async () => {
			var interval;
     	if (streaming == false) {
     			console.log('started')
        	interval = setInterval(function() {
        		page.screenshot({path: DIR_URL+'/'+performance.now()+'.png'});
        	}, 1000/FPS);
	      	streaming = true

  		} else {
  			clearInterval(interval);
				console.log("finished");
				streaming = false
				
  		}
      
  }));

	
	
}

run();