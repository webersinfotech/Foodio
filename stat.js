const mongoose = require('mongoose');
const mongo = require('./mongo');

class Statatics {
    constructor() {}

    async countRest() {
        const ids = await mongo.MenuFetchedRestauarants();
        const restaurants = await mongo.updateManyRestaurant({_id: {$nin: ids}}, {"bIsMenuFetched": false});
        console.log(restaurants);
    }
}

async function start() {
    await mongoose.connect('mongodb://foodioadmin:11999966@15.206.164.241:27017/Foodio', { promiseLibrary: global.Promise, useNewUrlParser: true });
    const stat = new Statatics();
    stat.countRest();
}

start();
