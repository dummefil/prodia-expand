const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const {createPool} = require('generic-pool');
const compressImage = require("../compressImage");

const poolFactory = {
    create: async () => {
        const browser = await puppeteer.launch({headless: false});
        await browser
            .defaultBrowserContext()
            .overridePermissions('https://app.prodia.com', [
                'clipboard-read',
                'clipboard-write',
            ]);

        const page = await browser.newPage();
        await page.goto('https://app.prodia.com/', {waitUntil: 'networkidle2'});
        return page;
    },
    destroy: async (page) => {
        const browser = await page.browser();
        await page.close();
        await browser.close();
    },
}

const poolOpts = {
    max: 4, // Maximum number of Puppeteer instances in the pool
    min: 0, // Minimum number of Puppeteer instances in the pool
}

const pool = createPool(poolFactory, poolOpts);

async function elementExists(page, selector) {
    const element = await page.$(selector);
    return element !== null;
}

async function setValueIfDifferent(page, selector, value) {
    await page.evaluate((selector, value) => {
        const inputElement = document.querySelector(selector);
        if (inputElement.value !== value) {
            inputElement.value = value;
        }
    }, selector, value);
}

async function type(page, selector, value) {
    await page.waitForSelector(selector);

    await page.bringToFront();
    await page.evaluate(async () => {

        console.log(navigator.clipboard, value);
        await navigator.clipboard.writeText(value);
    });

    await page.focus(selector);
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyV');
    await page.keyboard.up('Control');
}

async function setupGeneratorSettings(page, negative, positive, cfgScale, steps, seed) {
    await type(page, '#prompt', positive);
    await type(page, '.generator-settings-search', negative);
    await setValueIfDifferent(page, '.generator-settings-cfg .c-slider__input', cfgScale);
    await setValueIfDifferent(page, '.generator-settings-steps .c-slider__input', steps);
    await type(page, '.generator-settings-seed input', seed);
}

async function selectModelVersion(page) {
    await page.evaluate(() => {
        const modelSelect = document.querySelector('select.select-model');
        const options = Array.from(modelSelect.options);
        const selectedOption = options.find(option => option.value.includes('anything-v4.5'));

        if (selectedOption) {
            modelSelect.value = selectedOption.value;

            const changeEvent = new Event('change');
            modelSelect.dispatchEvent(changeEvent);
        }
    });
}

async function waitForImageGeneration(page) {
    await page.waitForFunction(
        () => {
            const results = document.querySelector('.results .results-item .result');
            return results && results.classList.contains('loaded');
        },
        { timeout: 60000 }
    );
}

async function getImageUrl(page) {
    return await page.evaluate(() => {
        const loadedResults = document.querySelector('.result.loaded');
        const style = loadedResults.getAttribute('style');
        const match = style.match(/url\("(.*?)"/);
        return match ? match[1] : null;
    });
}

async function createImageDirectory() {
    const directory = path.join(__dirname, 'public', 'images');
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, {recursive: true});
    }
}

async function fetchImagesWithPuppeteer(negative, positive, cfgScale, steps, seed) {
    const page = await pool.acquire();

    try {
        if (!(await elementExists(page, '.generator-settings-search'))) {
            await page.click('.btn-settings');
        }

        await setupGeneratorSettings(page, negative, positive, cfgScale, steps, seed);
        await selectModelVersion(page);
        await page.click('.btn-generate');
        await waitForImageGeneration(page);

        const imageUrl = await getImageUrl(page);
        await createImageDirectory();

        return downloadAndSaveImage(page, imageUrl);
    } catch (error) {
        console.error('Error fetching images:', error);
        throw error;
    } finally {
        await pool.release(page);
    }
}
async function downloadAndSaveImage(page, imageUrl) {
    // Download the image as a buffer using Puppeteer
    const imageBuffer = await page.evaluate(async (url) => {
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        return Array.from(new Uint8Array(buffer));
    }, imageUrl);

    const filename = `${Date.now()}.png`;
    const folderPath = path.join('public', 'images')
    const imagePath = path.join(folderPath, filename);
    const filePath = `/images/${filename}`;

    // Save the buffer to a file
    await fs.promises.writeFile(imagePath, Buffer.from(imageBuffer));
    await compressImage(imagePath, imagePath, folderPath);
    return filePath;
}

module.exports = {
    fetchImagesWithPuppeteer
};
