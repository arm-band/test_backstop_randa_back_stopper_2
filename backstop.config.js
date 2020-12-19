const fs       = require('fs');
const yaml     = require('yaml');
const dir      = require('./bin/dir');

/**
 * generateConfig - BackstopJS 用の設定を生成する
 */
class generateConfig
{
    constructor ()
    {
        this.encoding = 'UTF-8';
    };
    /**
     * ファイル存在チェック
     *
     * @param {string} file - ファイルパス
     * @return {boolean} - 存在: true, 存在しない: false
     */
    isExistFile (file)
    {
        try {
            fs.statSync(file);
            return true;
        }
        catch (err) {
            if (err.code === 'ENOENT') {
                return false;
            }
        }
    };
    /**
     * JSONファイル読み込み
     *
     * @param {string} filename - JSONファイル
     * @param {string} path - ファイルパス (/終わり)
     * @return {string} - ファイルの内容
     */
    getJson (filename, path = dir.src.template)
    {
        const file = fs.readFileSync(`${path}${filename}`, this.encoding);
        return JSON.parse(file);
    };
    /**
     * YAMLファイル読み込み
     *
     * @param {string} filename - YAMLファイル
     * @param {string} path - ファイルパス (/終わり)
     * @return {string} - ファイルの内容
     */
    getYaml (filename, path = dir.src.config)
    {
        const file = fs.readFileSync(`${path}${filename}`, this.encoding);
        return yaml.parse(file);
    };
    /**
     * 設定を生成
     *
     * @param {string} jsonfile - JSONファイル
     * @param {string} yamlfile - YAMLファイル
     * @param {string} flag - 'ref' or 'test' / config.yml の commons.url からどちらの値を読み出すか
     * @return {string} - 設定の内容
     */
    setConfig (jsonfile, yamlfile, flag)
    {
        // 空っぽの config を用意
        let config = [];
        if (this.isExistFile(`${dir.src.template}${jsonfile}`)) {
            // テンプレートの JSON を読み込む
            const templateJson = this.getJson(jsonfile);
            config = templateJson;
            // テスト結果の出力先パスを書き換える
            config.paths.bitmaps_reference = `${dir.backstop_data.backstop_data}${dir.backstop_data.bitmaps_reference}`;
            config.paths.bitmaps_test = `${dir.backstop_data.backstop_data}${dir.backstop_data.bitmaps_test}`;
            config.paths.engine_scripts = `${dir.backstop_data.backstop_data}${dir.backstop_data.engine_scripts}`;
            config.paths.html_report = `${dir.backstop_data.backstop_data}${dir.backstop_data.html_report}`;
            config.paths.ci_report = `${dir.backstop_data.backstop_data}${dir.backstop_data.ci_report}`;

            if (this.isExistFile(`${dir.src.config}${yamlfile}`)) {
                // 設定の YAML を読み込む
                const configYaml = this.getYaml(yamlfile);
                // viewport 指定
                for (const viewport of configYaml.viewports) {
                    config.viewports.push(viewport);
                }
                if (configYaml.commons.scroll2bottom) {
                    // onReady イベント後に下端までスクロールするスクリプトを実行
                    config.onBeforeScript = `${__dirname}/backstop_data/engine_scripts/puppet/onBefore.js`;
                    config.onReadyScript = `${__dirname}/${dir.script.scroll}`;
                }
                // シナリオのテンプレートをセット
                const scenarioTemplate = templateJson.scenarios[0];
                // 設定からシナリオを削除 (初期化)
                config.scenarios = [];
                // flag の値でドメイン決定
                let domain = configYaml.commons.url.test;
                if (flag === 'ref') {
                    domain = configYaml.commons.url.ref;
                }
                // スクロールのスクリプトを追加する場合、シナリオの hideSelectors に追加する
                let scenarioHideSelectors = [].concat(scenarioTemplate.hideSelectors);
                console.log(scenarioHideSelectors)
                if (configYaml.commons.scroll2bottom) {
                    for (const hideSelector of configYaml.commons.hideSelectors) {
                        scenarioHideSelectors.push(hideSelector);
                    }
                    console.log(scenarioHideSelectors)
                }
                // シナリオを追加する
                for (const scenario of configYaml.scenarios) {
                    let scenarioParam = Object.assign({}, scenarioTemplate);
                    scenarioParam.label = scenario.label;
                    scenarioParam.url = `${domain}${scenario.url}`;
                    scenarioParam.hideSelectors = scenarioHideSelectors;
                    config.scenarios.push(scenarioParam);
                }
            }
            config.randaflag = flag;
        }
        return config;
    };
};

module.exports = generateConfig;
