const puppeteer = require('puppeteer');
const merge = require('merge-img');

async function scrollToBottom (page, viewport, height) {
    await page.screenshot({path: 'tmp/fullscreen.png', fullPage: true});

    const getScrollHeight = () => {
        return Promise.resolve(document.documentElement.scrollHeight);
    }

    let scrollHeight = await page.evaluate(getScrollHeight);
    let currentPosition = 0;
    let scrollNumber = 0;

    while (currentPosition < scrollHeight) {
        scrollNumber += 1;
        const nextPosition = scrollNumber * viewport.height;
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

    let screens = [];
    for(let i = 0; (i*viewport.height) < height; i=i+1) {
        console.log("Screen "+i);
        let screen = await page.screenshot({path: 'tmp/screen-'+i+'.png', fullPage: false, clip: {x: 0, y:i*viewport.height, width: viewport.width, height: viewport.height}});
        screens.push(screen);
    }
    img = await merge(screens, {direction: true, offset: 20, margin: 10, color: 0xFF0000FF});
    img.write('tmp/out.png');
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
    await page.waitForNavigation({waitUntil: 'networkidle2', timeout: 10000})
            .catch(e => console.log('timeout exceed. proceed to next operation'));

    await scrollToBottom(page, vp, height);

    await browser.close();
};
