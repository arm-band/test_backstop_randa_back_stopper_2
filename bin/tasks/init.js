const fs                  = require('fs');
const dir                 = require('../dir');
const generateConfigClass = require('../../backstop.config');
const generateConfig      = new generateConfigClass();
const refConfig           = generateConfig.setConfig('template.json', 'config.yml', 'ref');

fs.writeFileSync(dir.dist.initjson, JSON.stringify(refConfig));
