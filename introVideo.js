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

    const chunks = chunk(data, 3);

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--window-size=1600,1200', '--no-sandbox', '--enable-usermedia-screen-capturing', '--allow-http-screen-capture', '--auto-select-desktop-capture-source=Frost- Multipurpose Coming Soon', '--use-views']
    });

    const domains_in_blacklist = [
        'fonts.gstatic.com',
        'fonts.googleapis.com'
    ];

    asyncForEach(chunks, async (arr, index) => {
        const promises = [];

        arr.forEach(async (doc) => promises.push(recordPromise(doc, browser)))

        await Promise.all(promises)
    });
})();

async function recordPromise(doc, browser) {
    return new Promise(async (res, rej) => {
        const page = await browser.newPage();

        await page.setRequestInterception(true)

        page.on('request', interceptedRequest => {
            if (domains_in_blacklist.includes(new URL(interceptedRequest.url()).host)) {
                interceptedRequest.abort()
            } else {
                interceptedRequest.continue()
            }
        });

        await recordScreen(`http://localhost:3001/${doc._id}`, doc._id, page);

        page.close();

        res();
    });
}

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

const chunk = (arr, size) =>
  arr
    .reduce((acc, _, i) =>
      (i % size)
        ? acc
        : [...acc, arr.slice(i, i + size)]
    , [])