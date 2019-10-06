const util = require('util');
const path = require('path');
const fs = require('fs');
const Apify = require('apify');
const { Capabilities, Builder } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const proxy = require('selenium-webdriver/proxy');
const { anonymizeProxy } = require('proxy-chain');

const launchFirefoxWebdriver = async () => {
    // logging.installConsoleHandler();
    // logging.getLogger('webdriver.http').setLevel(logging.Level.ALL);

    // See https://github.com/SeleniumHQ/selenium/wiki/DesiredCapabilities for reference.
    const capabilities = new Capabilities();
    capabilities.set('browserName', 'firefox');

    const builder = new Builder();

    const firefoxOptions = new firefox.Options();

    const firefoxPath = path.join(__dirname, './node_modules/custom_firefox/Nightly.app/Contents/MacOS/firefox-bin');

    console.log(`Using Firefox executable: ${firefoxPath}`);
    firefoxOptions.setBinary(firefoxPath);

    // firefoxOptions.setBinary('/firefox/firefox-bin');

    const proxyUrl = await anonymizeProxy(`http://groups-RESIDENTIAL,country-US,session-123234:${process.env.APIFY_PROXY_PASSWORD}@proxy.apify.com:8000`);
    const parsedUrl = new URL(proxyUrl);

    const webDriver = builder
        .setFirefoxOptions(firefoxOptions)
        .withCapabilities(capabilities)
        .setProxy(proxy.manual({ http: parsedUrl.host, https: parsedUrl.host, ftp: parsedUrl.host }))
        .build();

    return webDriver;
};


Apify.main(async () => {
    // Get input of the actor (here only for demonstration purposes).
    // If you'd like to have your input checked and have Apify display
    // a user interface for it, add INPUT_SCHEMA.json file to your actor.
    // For more information, see https://apify.com/docs/actor/input-schema
    const input = await Apify.getInput();
    console.log('Input:');
    console.dir(input);

    const webDriver = await launchFirefoxWebdriver();

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
