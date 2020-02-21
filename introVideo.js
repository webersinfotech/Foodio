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
        puppeteerOptions: {
            headless: true,
            args: ['--no-sandbox']
        },
        monitor: false
    });

    await cluster.task(async ({ page, data }) => {
        const { url, ID } = data;
        await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36');
        try {
            await recordScreen(url, ID, page);
            console.log(url, ID);
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
        $limit: 1
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

            await page.waitFor(5000);

            await record({
                page: page, // Optional: a puppeteer Page instance,
                output: 'output.webm',
                fps: 60,
                frames: 60 * 2, // 5 seconds at 60 fps
                pipeOutput: true,
                prepare: function () {}, // <-- add this line
                render: function () {} // <-- add this line
            });

            await page.waitFor(5000);

            await page.waitFor(5000);

            console.log('Finished');
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