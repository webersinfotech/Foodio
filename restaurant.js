const mongoose = require('mongoose');
const request = require('request');
const mongo = require('./mongo');

mongoose.connect('mongodb://localhost:27017/foodio', { promiseLibrary: global.Promise, useNewUrlParser: true }).then(() => {
    console.log('Connected to database.');
  }).catch((error) => {
    console.log('Connection to Database failed.');
});

class Resturant {
    constructor() {}

    async searchResturant() {
        const resturants = await mongo.fetchRestaurantsAggregate([{
            $match: {
                bIsDetailFetched: {
                    $ne: true
                } 
            }
        }, {
            $lookup: {
                from: 'areas',
                localField: 'iAreaId',
                foreignField: '_id',
                as: 'area'
            } 
        }, {
            $unwind: {
                path: '$area'
            }
        }, {
            $limit: 1
        }]);

        await asyncForEach(resturants, async (resturant) => {
            try {
                const data = await this.fetchDetail(resturant.sName, resturant.area.entity_id, resturant.area.entity_type);
                if (data.restaurants.length >= 1) {
                    const urls = [];
                    data.restaurants.map((res) => {
                        console.log(res.restaurant.url);
                    })
                }
                console.log(data.restaurants.length);
            } catch(Error) {
                console.log('Error occured: ', Error);
            }
        });
    }

    async fetchDetail(query, area, area_type) {
        console.log(`https://developers.zomato.com/api/v2.1/search?q=${encodeURI(query)}&entity_id=${area}&entity_type=${area_type}`);
        return new Promise((res, rej) => {
            const options = {
                url: `https://developers.zomato.com/api/v2.1/search?q=${encodeURI(query)}&entity_id=${area}&entity_type=${area_type}`,
                headers: {
                    'user-key': '3717835ae658ead76d31ab2b4535c8df'
                }
            };

            request(options, function (error, response, body) {
                if (error) rej(error);
                res(JSON.parse(body));
            });
        });
        console.log(query, area);
    }
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

const resturant = new Resturant();
resturant.searchResturant();