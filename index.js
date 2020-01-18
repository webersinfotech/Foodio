const puppeteer = require('puppeteer');
const mongoose = require('mongoose');
const mongo = require('./mongo')

mongoose.connect('mongodb://localhost:27017/foodio', { promiseLibrary: global.Promise, useNewUrlParser: true }).then(() => {
    console.log('Connected to database.');
  }).catch((error) => {
    console.log('Connection to Database failed.');
});

class zomato {
    constructor() {
        this.browser;
    }

    async launchBrowser() {
        this.browser = await puppeteer.launch({
            headless: false,
            args: ['--no-sandbox']
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
                await page.waitFor(1000);

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
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

const scraper = new zomato();
scraper.createeApi();