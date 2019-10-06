const util = require('util');
const path = require('path');
const fs = require('fs');
const Apify = require('apify')
const _ = require('underscore');;
const { Capabilities, Builder } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const proxy = require('selenium-webdriver/proxy');
const { anonymizeProxy } = require('proxy-chain');

const launchFirefoxWebdriver = async (proxyUrl) => {
    // logging.installConsoleHandler();
    // logging.getLogger('webdriver.http').setLevel(logging.Level.ALL);

    // See https://github.com/SeleniumHQ/selenium/wiki/DesiredCapabilities for reference.
    const capabilities = new Capabilities();
    capabilities.set('browserName', 'firefox');

    const builder = new Builder();

    const firefoxOptions = new firefox.Options();

    let firefoxPath;
    if (process.env.APIFY_XVFB === '1') {
        // Running on server
        firefoxPath = '/firefox/firefox-bin';
    } else {
        // Running locally on macOS
        firefoxPath = path.join(__dirname, './node_modules/custom_firefox/Nightly.app/Contents/MacOS/firefox-bin');
    }

    console.log(`Using Firefox executable: ${firefoxPath}`);
    firefoxOptions.setBinary(firefoxPath);

    const setup = builder
        .setFirefoxOptions(firefoxOptions)
        .withCapabilities(capabilities);

    if (proxyUrl) {
        console.log('Using provided proxyUrl');
        const anonProxyUrl = await anonymizeProxy(proxyUrl);
        const parsed = new URL(anonProxyUrl);
        setup.setProxy(proxy.manual({ http: parsed.host, https: parsed.host, ftp: parsed.host }));
    }

    const webDriver = setup.build();
    return webDriver;
};


Apify.main(async () => {
    const input = await Apify.getInput();

    const webDriver = await launchFirefoxWebdriver(input.proxyUrl);

    console.log(`Opening URL: ${input.url}`);
    const xxx = await webDriver.get(input.url);

    const url = await webDriver.getCurrentUrl();
    console.log(`Loaded URL ${url}`);

    // await Apify.utils.sleep(1000 * 1000);

    console.log('Saving HTML');
    const html = await webDriver.executeAsyncScript(function() {
        const callback = arguments[arguments.length - 1];
        callback(document.documentElement.innerHTML);
    });
    console.log(`HTML length: ${html.length} chars`);

    console.log('Taking screenshot');
    const screenshotBase64 = await webDriver.takeScreenshot();
    const buffer = Buffer.from(screenshotBase64, 'base64');
    console.log(`Screenshot size: ${buffer.length} bytes`);

    console.log('Saving data to key-value store');
    await Apify.setValue('content.html', html, { contentType: 'text/html' });
    await Apify.setValue('screenshot.png', buffer, { contentType: 'image/png' });

    await webDriver.quit();

    console.log('Done.');
});
