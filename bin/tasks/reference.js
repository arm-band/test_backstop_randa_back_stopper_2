const backstop            = require('backstopjs');
//const generateConfigClass = require('../../backstop.config');
//const generateConfig      = new generateConfigClass();
//const config              = generateConfig.setConfig('template.json', 'config.yml', 'ref');

backstop('reference', {
//    config: config
    config: './backstop.json'
    }).then(() => {
        console.log('succeeded:  generating reference');
    }).catch(() => {
        console.log('failed:  generating reference');
    }
);
