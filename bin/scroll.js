async function scrollToBottom (page, viewport, scenario) {
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
                .catch(e => console.log(`scrolling ${scenario.label}-${viewport.name}-${scrollNumber}: timeout exceed. proceed to next operation`));

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

    // added
    await page.waitForNavigation({waitUntil: 'networkidle2', timeout: 10000})
            .catch(e => console.log('before scroll:: timeout exceed. proceed to next operation'));

    const $ele = await page.$('body');
    const { width, height } = await $ele.boundingBox();
    console.log(`${scenario.label}-${vp.name}: w=${width} h=${height}`);


    await scrollToBottom(page, vp, scenario);
};
