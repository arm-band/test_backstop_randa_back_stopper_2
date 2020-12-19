const puppeteer = require('puppeteer');
const merge = require('merge-img');
const fs = require('fs');

const dirCounter = (path) => {
    let dirList = 0;
    fs.readdirSync(path, function(err, files){
        if (err) throw err;
        dirList = files.filter(function(file){
            return fs.statSync(file).isDirectory()
        });
    });

    return dirList;
}

async function scrollToBottom (page, viewport, config, dirNum, scenario) {
    await page.screenshot({path: 'tmp/fullscreen.png', fullPage: true});

    const getScrollHeight = () => {
        return Promise.resolve(document.documentElement.scrollHeight);
    }

    let scrollHeight = await page.evaluate(getScrollHeight);
    let currentPosition = 0;
    let scrollNumber = 0;

    let screens = [];
    let screenCurrPos = 0;
    let screenNextPos = viewport.height;
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
        console.log("Screen "+scrollNumber);

        screenCurrPos = currentPosition - viewport.height >= 0 ? currentPosition - viewport.height : 0;
        screenCurrPos = currentPosition - viewport.height > scrollHeight ? scrollHeight : currentPosition - viewport.height;
        screenNextPos = currentPosition > scrollHeight ? scrollHeight : currentPosition;

        let screen = await page.screenshot(
            {
                path: 'tmp/screen-' + scrollNumber + '.png',
                fullPage: false,
                clip: {
                    x: 0,
                    y: screenCurrPos,
                    width: viewport.width,
                    height: screenNextPos
                }
            }
        );
//        let screen = await page.screenshot({path: 'tmp/screen-'+scrollNumber+'.png', fullPage: false, clip: {x: 0, y:currentPosition-viewport.height >= 0 ? currentPosition-viewport.height : 0, width: viewport.width, height: currentPosition}});
////        let screen = await page.screenshot({path: 'tmp/screen-'+scrollNumber+'.png', fullPage: false, clip: {x: 0, y:scrollNumber*viewport.height, width: viewport.width, height: viewport.height}});
        screens.push(screen);
    }
    img = await merge(screens, {direction: true});
    let screenShotPath = `bitmaps_test/${dirNum + 1}`;
    if (config.randaflag === 'ref') {
        screenShotPath = `bitmaps_reference`;
    }
    img.write(`./backstop_data/${screenShotPath}/${config.id}_${scenario.label}_0_${scenario.selectors[0]}_${scenario.sIndex}_${viewport.name}.png`);
};

module.exports = async (page, scenario, vp, isReference, engine, config) => {
    console.log('SCENARIO > ' + scenario.label);
    await require('../backstop_data/engine_scripts/puppet/clickAndHoverHelper')(page, scenario);
    let dirNum = 0;
    if (config.randaflag !== 'ref') {
        dirNum = dirCounter('./backstop_data/');
    }
    const browser = await puppeteer.launch();
    page = await browser.newPage();

    await page.setViewport({width: vp.width, height: vp.height});
    await page.goto(scenario.url);

//    await page.waitForNavigation({'waitUntil' : 'networkidle'});
    await page.waitForNavigation({waitUntil: 'networkidle2', timeout: 10000})
            .catch(e => console.log('timeout exceed. proceed to next operation'));

    await scrollToBottom(page, vp, config, dirNum, scenario);

    await browser.close();
};
