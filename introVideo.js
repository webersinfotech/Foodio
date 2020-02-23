const puppeteer = require('puppeteer');
const mongoose = require('mongoose');
const mongo = require('./mongo');
const { Cluster } = require('puppeteer-cluster');
const { record } = require('puppeteer-recorder');
const request = require('request');
const FS = require('fs');

(async () => {
    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: 1,
        timeout: 60000,
        puppeteerOptions: {
            headless: false,
            defaultViewport: null,
            args: ['--window-size=1600,1200', '--no-sandbox', '--enable-usermedia-screen-capturing', '--allow-http-screen-capture', '--auto-select-desktop-capture-source=Frost- Multipurpose Coming Soon', '--use-views'] // '--window-size=1366,768', 
        },
        monitor: false
    });

    await cluster.task(async ({ page, data }) => {
        const { url, ID } = data;
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3419.0 Safari/537.36');
        try {
            await recordScreen(url, ID, page);
        } catch(error) {
            console.error(error);
        }
    });

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

    const data = await mongo.fetchRestaurantsAggregateCursor(query);
    data.eachAsync(async (doc) => {
        try {
            console.log(`http://localhost:3001/${doc._id}`);
            cluster.queue({url: `http://localhost:3001/${doc._id}`, ID: doc._id});
        } catch(error) {
            console.log(error);
        }
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