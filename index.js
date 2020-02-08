const puppeteer = require('puppeteer');
const mongoose = require('mongoose');
const mongo = require('./mongo');
const { Cluster } = require('puppeteer-cluster');

class zomato {
    constructor() {
        this.browser;
        this.cluster;
    }

    async launchBrowser() {
        this.cluster = await Cluster.launch({
            concurrency: Cluster.CONCURRENCY_CONTEXT,
            maxConcurrency: 2,
        });
        this.browser = await puppeteer.launch({
            // headless: false,
            // args: ['--no-sandbox']
            // executablePath: 'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe',
            // ignoreDefaultArgs: ['--disable-extensions']
        });
    }

    async scrapeCity() {
        await this.launchBrowser();

        const page = await this.browser.newPage();

        await page.goto('https://www.zomato.com/india');
        await page.waitFor(1000);

        const cities = await page.evaluate(function() {
            const cities = [];
            $('.mtop > ul.row:first li a').each(function() {
                cities.push({
                    sName: $(this).text().replace(' Restaurants', ''),
                    sLink: $(this).attr('href')
                });
            })
            return cities;
        });

        await mongo.createCities(cities);
    }

    async scrapeArea() {
        await this.launchBrowser();

        const errorCities = [];

        const cities = await mongo.fetchCities({});

        const page = await this.browser.newPage();

        await asyncForEach(cities, async (city) => {
        // cities.forEach(async (city) => {
            try {
                await page.goto(city.sLink);
                await page.waitFor(1000);

                const areas = await page.evaluate(function() {
                    const areas = [];
                    $('a.pbot0').each(function() {
                        areas.push({
                            sName: $(this).contents().get(0).nodeValue.replace(/(\r\n|\n|\r)/gm, "").trim(),
                            sLink: $(this).attr('href')
                            // iCityId: city._id
                        })
                    });
                    return areas;
                });

                areas.forEach((value, index) => {
                    areas[index].iCityId = city._id;
                })

                await mongo.createAreas(areas);
            } catch(error) {
                console.log(error);
                errorCities.push(city);
            }
        })

        console.log(errorCities);
    }

    async scrapeRestaurant() {
        const areas = await mongo.fetchAreas({
            bIsFetched: {
                $ne: true
            }
        });

        await this.launchBrowser();

        const page = await this.browser.newPage();

        await asyncForEach(areas, async (area) => {
        // areas.forEach(async (area) => {
            await page.goto(`${area.sLink}?nearby=0`);
            await page.waitFor(1000);

            let total_page = await page.evaluate(function() {
                return $('.pagination-number b:last').text();
            });

            total_page = [...Array(parseInt(total_page) + 1).keys()];
            total_page.splice(0, 2);

            let restaurants = [];
            
            const result = await page.evaluate(function() {
                const results = [];
                $('.result-title').each(function() {
                    results.push({
                        sName: $(this).contents().get(0).nodeValue.replace(/(\r\n|\n|\r)/gm, "").trim(),
                        sLink: $(this).attr('href')
                    })
                })
                return results;
            });

            restaurants = [...restaurants, ...result];

            await asyncForEach(total_page, async (i) => {
            // for(let i = 2; i <= 3; i++) { //replace static number with total_page
                await page.goto(`${area.sLink}?page=${i}&nearby=0`);
                await page.waitFor(1000)

                const result = await page.evaluate(function() {
                    const results = [];
                    $('.result-title').each(function() {
                        results.push({
                            sName: $(this).contents().get(0).nodeValue.replace(/(\r\n|\n|\r)/gm, "").trim(),
                            sLink: $(this).attr('href')
                        })
                    })
                    return results;
                });

                restaurants = [...restaurants, ...result];
            });

            restaurants.map((res, index) => {
                restaurants[index].iAreaId = area._id;
            })

            await mongo.createRestaurants(restaurants);
            await mongo.updateArea({_id: area._id}, {bIsFetched: true});
        });
    }

    async scrapeDetail() {
        await this.launchBrowser();

        const page = await this.browser.newPage();

        const restaurants = [{ 
            name: 'Chatore.e.e', 
            link: 'https://www.zomato.com/ncr/chatore-e-e-pitampura-new-delhi' 
        }];

        restaurants.forEach(async (restaurant) => {
            await page.goto(restaurant.link);
            await page.waitFor(1000);

            const detail = await page.evaluate(function() {
                const numbers = []
                $('#phoneNoString .zgreen').each(function() {
                    numbers.push($(this).find('span.tel').text().trim())
                })
                return {
                    number: numbers,
                    address: $('.res-main-address .resinfo-icon').text().replace(/(\r\n|\n|\r)/gm, "").trim()
                };
            });

            console.log(detail);
        });
    }

    async createeApi() {
        await this.launchBrowser();

        const page = await this.browser.newPage();

        await page.goto('https://developers.zomato.com/api');
        await page.waitFor(5000);

        await page.click('.get-api-key-bttn');
        await page.waitFor(5000);

        await page.click('#signup-email');
        await page.waitFor(500);
    }

    async fetchMenuCluster() {
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
            $limit: 2
        }];
        console.log(query);

        const data = await mongo.fetchRestaurantsAggregateCursor(query);
        data.eachAsync(async (doc) => {
            try {
                await this.launchBrowser();
                this.cluster.queue(`${doc.sLink.split('?')[0]}/order`);
                // this.retrieveMenu(`${doc.sLink.split('?')[0]}/order`, doc._id);
            } catch(error) {
                console.log(error);
            }
        })
    }

    async retrieveMenuCluster() {
        await this.cluster.task(async ({ page, data: url }) => {
            console.log(url);
        });
    }

    async fetchMenu() {
        try {
            const query = [{
                $match: {
                    bIsMenuFetched: {
                        $ne: true
                    },
                    bIsTried: {
                        $ne: true
                    }
                }
            }];
            const data = await mongo.fetchRestaurantsAggregateCursor(query);
            data.eachAsync(async (doc) => {
                try {
                    this.retrieveMenu(`${doc.sLink.split('?')[0]}/order`, doc._id);
                } catch(error) {
                    console.log(error);
                }
            })
        } catch(error) {
            console.log(error);
        }
    }

    async retrieveMenu(url, id) {
        return new Promise(async (res, rej) => {
            try {
                await this.launchBrowser();

                const page = await this.browser.newPage();
        
                const response = await page.goto(url);

                console.log(url);

                if (response.headers.status !== '200') {
                    this.browser.close();
                    rej();
                }

                await page.waitFor(2000);
        
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
                await asyncForEach(data.categories, async (category, index) => {
                    category.resId = id;
                    const category_data = await mongo.createCategory(category);
                    console.log(category_data);
                    await asyncForEach(data.items[index], async (item) => {
                        item.resId = id;
                        item.iCategoryId = category_data._id;
                        await mongo.createItem(item);
                    });
                    await mongo.updateRestaurant({_id: id}, {bIsMenuFetched: true});
                });
                this.browser.close();
                res();
            } catch(error) {
                await mongo.updateRestaurant({_id: id}, {bIsTried: true});
                this.browser.close();
                rej(error)
            }
        })
    }
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

async function start() {
    await connectDB();
    const scraper = new zomato();
    scraper.retrieveMenuCluster();
    scraper.fetchMenuCluster();
}

async function connectDB() {
    return new Promise((res, rej) => {
        mongoose.connect('mongodb://foodioadmin:11999966@15.206.164.241:27017/Foodio', { promiseLibrary: global.Promise, useNewUrlParser: true }).then(() => {
            console.log('Connected to database.');
            res();
        }).catch((error) => {
            console.log('Connection to Database failed.');
            rej();
        });
    })
}

start();