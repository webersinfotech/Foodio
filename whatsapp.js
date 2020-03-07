const mongoose = require('mongoose');
const mongo = require('./mongo');
const request = require('request');
const { Cluster } = require('puppeteer-cluster');

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
        const { url, ID, phNumber } = data;
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36');
        try {
            await retrieveWhatsapp(url, ID, phNumber, page);
        } catch(error) {
            console.error(error);
        }
    });

    await mongoose.connect('mongodb://foodioadmin:11999966@15.206.164.241:27017/Foodio', { promiseLibrary: global.Promise, useNewUrlParser: true });

    // const query = [{
    //     $match: {
    //         bIsDetailFetched: true,
    //         bIsWhatsappTried: {
    //             $ne: true
    //         },
    //         groupBy: await fetchGroupby()
    //     }
    // }, {
    //     $limit: 1
    // }];

    // const restaurents = await mongo.fetchRestaurantsAggregateCursor(query);

    // restaurents.eachAsync(async (doc) => {
    //     try {
    //         doc.phone_number_arr.map((number) => {
    //             if (!number.startsWith('+91')) return;
    //             const phNumber = number.replace('+91 ', '');
    //             cluster.queue({url: `https://wa.me/091${phNumber.replace(' ', '')}`, ID: doc._id, phNumber: phNumber.replace(' ', '')});
    //         })
    //     } catch(error) {
    //         console.log(error);
    //     }
    // });

    cluster.queue({url: `https://wa.me/0917990089984`, ID: 12345, phNumber: 0917990089984}); //091877025791

    setInterval(async () => {
        await cluster.idle();
        await cluster.close();
    }, 5000)
})()

async function retrieveWhatsapp(url, id, phNumber, page) {
    console.log(phNumber, id);
    return new Promise(async (res, rej) => {
        try {
            const response = await page.goto(url, { waitUntil: "domcontentloaded" });
            if (response._status !== 200) rej();

            await page.waitFor(5000);

            const result = await page.evaluate(function() {
                const text = document.querySelector('#main_block > div._2yyk._85kd > h1').innerText;
                return text.endsWith('on WhatsApp');
            });

            await page.screenshot({path: 'whatsapp.png'});

            console.log(result);

            // if (result) {
            //     await mongo.updateRestaurant({_id: id}, {bIsWhatsappTried: true, $push: {
            //         whatsappNumbers: phNumber,
            //         scanned: phNumber
            //     }});
            // } else {
            //     await mongo.updateRestaurant({_id: id}, {bIsWhatsappTried: true, $push: {
            //         scanned: phNumber
            //     }});
            // }
            res();
        } catch(error) {
            // await mongo.updateRestaurant({_id: id}, {bIsWhatsappTried: true, $push: {
            //     scanned: phNumber
            // }});
            rej(error);
        }
    });
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
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