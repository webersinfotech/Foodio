const puppeteer = require('puppeteer');
const mongoose = require('mongoose');
const mongo = require('./mongo');
const { Cluster } = require('puppeteer-cluster');

(async () => {
    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: 10,
        puppeteerOptions: {
            headless: true
        },
        // monitor: true
    });

    await cluster.task(async ({ page, data }) => {
        const { url, ID } = data;
        await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36');
        try {
            await retrieveMenu(url, ID, page);
        } catch(error) {
            console.error(error);
        }

    });
    
    await mongoose.connect('mongodb://foodioadmin:11999966@15.206.164.241:27017/Foodio', { promiseLibrary: global.Promise, useNewUrlParser: true });

    const query = [{
        $match: {
            bIsMenuFetched: {
                $ne: true
            },
            bIsTried: {
                $ne: true
            }
        }
    }, {
        $limit: 10
    }];

    const data = await mongo.fetchRestaurantsAggregateCursor(query);
    data.eachAsync(async (doc) => {
        try {
            cluster.queue({url: `${doc.sLink.split('?')[0]}/order`, ID: doc._id});
        } catch(error) {
            console.log(error);
        }
    })

    setInterval(async () => {
        await cluster.idle();
        await cluster.close();
    }, 5000)
})();

async function retrieveMenu(url, id, page) {
    return new Promise(async (res, rej) => {
        try {
            const response = await page.goto(url);
            console.log(response._status);
            console.log(url);
            if (response._status !== 200) rej();
    
            await page.waitFor(10000);
    
            const data = await page.evaluate(function() {
                const items = [];
                const categories = [];
                $('.category-container').each(function(elem, index) {
                    const item = [];
                    categories.push({
                        sName: $(this).find('h3').text()
                    });
                    $(this).find('.item').each(function() {
                        item.push({
                            eType: getType(this),
                            sName: $(this).find('.header').text(),
                            sPrice: $(this).find('.description').text()
                        })
                    });
                    items.push(item);
                    function getType(that) {
                        if ($(that).find('.tag').hasClass('veg')) return 'veg';
                        else if ($(that).find('.tag').hasClass('nveg')) return 'non-veg';
                        else return 'undefined'
                    }
                });
                return {
                    items: items,
                    categories: categories
                }
            });
            console.log(data);
            await asyncForEach(data.categories, async (category, index) => {
                category.resId = id;
                const category_data = await mongo.createCategory(category);
                await asyncForEach(data.items[index], async (item) => {
                    item.resId = id;
                    item.iCategoryId = category_data._id;
                    await mongo.createItem(item);
                });
            });
            await mongo.updateRestaurant({_id: id}, {bIsMenuFetched: true});
            res();
        } catch(error) {
            rej();
        }
    })
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}