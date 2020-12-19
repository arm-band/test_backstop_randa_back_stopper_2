const puppeteer = require('puppeteer');
const merge = require('merge-img');

async function scrollToBottom (page, viewportHeight) {
    const getScrollHeight = () => {
        return Promise.resolve(document.documentElement.scrollHeight);
    }

    let scrollHeight = await page.evaluate(getScrollHeight);
    let currentPosition = 0;
    let scrollNumber = 0;

    while (currentPosition < scrollHeight) {
        scrollNumber += 1;
        const nextPosition = scrollNumber * viewportHeight;
        await page.evaluate(function (scrollTo) {
            return Promise.resolve(window.scrollTo(0, scrollTo))
        }, nextPosition);
        await page.waitForNavigation({waitUntil: 'networkidle2', timeout: 10000})
                .catch(e => console.log('timeout exceed. proceed to next operation'));

        currentPosition = nextPosition;
        console.log(`scrollNumber: ${scrollNumber}`);
        console.log(`currentPosition: ${currentPosition}`);

        scrollHeight = await page.evaluate(getScrollHeight);
        console.log(`ScrollHeight ${scrollHeight}`);
    }
};

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
    await page.waitForNavigation({waitUntil: 'networkidle2', timeout: 5000})
            .catch(e => console.log('timeout exceed. proceed to next operation'));

    await scrollToBottom(page, vp.height);


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
