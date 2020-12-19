const backstop            = require('backstopjs');
const generateConfigClass = require('../../backstop.config');
const generateConfig      = new generateConfigClass();
//const refConfig           = generateConfig.setConfig('template.json', 'config.yml', 'test');
const testConfig          = generateConfig.setConfig('template.json', 'config.yml', 'ref');

//backstop('reference', {
//    config: refConfig
//})
//    .then(() => {
//        console.log('succeeded:  generating reference');
//        backstop('test', {
//            config: testConfig
//            }).then(() => {
//                console.log('succeeded:  generating reference');
//            }).catch(() => {
//                console.log('failed:  generating reference');
//            }
//        );
//    }).catch(() => {
//        console.log('failed:  generating reference');
//    }
//);
backstop('test', {
    config: testConfig
    }).then(() => {
        console.log('succeeded:  generating reference');
    }).catch(() => {
        console.log('failed:  generating reference');
    }
);
