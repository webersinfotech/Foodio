const puppeteer = require('puppeteer');
const mongoose = require('mongoose');
const mongo = require('./mongo');
const { Cluster } = require('puppeteer-cluster');
const { record } = require('puppeteer-recorder');
const request = require('request');
const FS = require('fs');

(async () => {
    try {
        await mongoose.connect('mongodb://foodioadmin:11999966@15.206.164.241:27017/Foodio', { promiseLibrary: global.Promise, useNewUrlParser: true });
    } catch(error) {
        console.log(error);
    }

    const query = [{
        $match: {
            bIsIntroCaptured: {
                $ne: true
            },
            groupBy: await fetchGroupby()
        }
    }, {
        $limit: 1000
    }];

    const data = await mongo.fetchRestaurantsAggregate(query);

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--window-size=1600,1200', '--no-sandbox', '--enable-usermedia-screen-capturing', '--allow-http-screen-capture', '--auto-select-desktop-capture-source=Frost- Multipurpose Coming Soon', '--use-views']
    });

    asyncForEach(data, async (doc, index) => {
        const page = await browser.newPage();

        await recordScreen(`http://localhost:3001/${doc._id}`, doc._id, page);

        page.close();
    });
})();

async function recordScreen(url, id, page) {
    return new Promise(async (res, rej) => {
        try {
            await page.goto(url);

            await page.waitFor(60000);

            res();
        } catch(error) {
            rej(error);
        }
    });
}

async function fetchGroupby() {
    return new Promise((res, rej) => {
        if (FS.existsSync('groupby.txt')) {
            const groupBy = FS.readFileSync('groupby.txt', 'UTF-8');
            res(parseInt(groupBy));
        } else {
            request.get('http://15.206.164.241:3000', (error, response, body) => {
                if (error !== null) rej(error);
                FS.writeFileSync('groupby.txt', parseInt(body));
                res(parseInt(body));
            })
        }
    })
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}