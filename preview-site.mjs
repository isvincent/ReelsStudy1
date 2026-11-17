import fs from 'node:fs';
import {chromium} from '../Reel文字手法解說/node_modules/playwright/index.mjs';
fs.mkdirSync('QA',{recursive:true});const browser=await chromium.launch({channel:'chrome',headless:true});try{const page=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1,reducedMotion:'reduce'});page.on('pageerror',e=>console.log('PAGE ERROR: '+e.message));await page.goto('http://localhost:4177');await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:'QA/首頁預覽.png'});console.log('Homepage preview captured.');}finally{await browser.close();}
