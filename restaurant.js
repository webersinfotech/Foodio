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

    async searchRestaurant() {
        const resturants = await mongo.fetchRestaurantsAggregate([{
            $match: {
                /*bIsDetailFetched: {
                    $ne: true
                },*/
                bErrorOccured: {
                    $eq: true
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
                if (typeof data.results_found === 'undefined') return;
                console.log(data);
                try {
                    const urls = [];
                    
                    const resturant_data = data.restaurants.find((res) => {
                        return res.restaurant.url.split('?')[0] === resturant.sLink;
                    })

                    resturant_data.restaurant.bIsDetailFetched = true;
                    await mongo.updateRestaurant({_id: resturant._id}, resturant_data.restaurant);
                } catch(Error) {
                    await mongo.updateRestaurant({_id: resturant._id}, {
                        bErrorOccured: true,
                        bIsRetried: true
                    });
                }
            } catch(Error) {
                console.log('Error occured: ', Error);
            }
        })
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

            // 3717835ae658ead76d31ab2b4535c8df
            // 4cbd22ad6953d19f5ee877615a7c9cc5

            request(options, function (error, response, body) {
                if (error) rej(error);
                res(JSON.parse(body));
            });
        });
    }
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

const resturant = new Resturant();
resturant.searchRestaurant();