const mongoose = require('mongoose');
const mongo = require('./mongo');
const request = require('request');

(async () => {
    await mongoose.connect('mongodb://foodioadmin:11999966@15.206.164.241:27017/Foodio', { promiseLibrary: global.Promise, useNewUrlParser: true });

    const query = [{
        $match: {
            bIsDetailFetched: true
        }
    }];

    const data = await mongo.fetchRestaurantsAggregateCursor(query);

    let i = 0;
    
    data.eachAsync((res) => {
        console.log(i, res._id);
        await mongo.updateRestaurant({
            _id: res._id
        }, {
            phone_number_arr: res.phone_numbers.split(', ')
        })
        i++;
    });
})()

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}