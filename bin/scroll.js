const puppeteer = require('puppeteer');
const merge = require('merge-img');

module.exports = async (page, scenario, vp) => {
    console.log('SCENARIO > ' + scenario.label);
    await require('../backstop_data/engine_scripts/puppet/clickAndHoverHelper')(page, scenario);
    const vpw = vp.width;
    const vph = vp.height;
    const browser = await puppeteer.launch();
    page = await browser.newPage();

    await page.goto(scenario.url);
    await page.setViewport({width: vpw, height: vph});

    const $ele = await page.$('body');
    const { width, height } = await $ele.boundingBox();
    console.log("W="+width+" H="+height);
//    await page.waitForNavigation({'waitUntil' : 'networkidle'});

    await page.screenshot({path: 'tmp/fullscreen.png', fullPage: true});

    var screens = [];
    for(var i = 0; (i*vph) < height; i=i+1) {
        console.log("Screen "+i);
        var screen = await page.screenshot({path: 'tmp/screen-'+i+'.png', fullPage: false, clip: {x: 0, y:i*vph, width: vpw, height: vph}});
        screens.push(screen);
    }

    img = await merge(screens, {direction: true, offset: 20, margin: 10, color: 0xFF0000FF});
    img.write('tmp/out.png');

    await browser.close();
};
