const mongoose = require('mongoose');
const mongo = require('./mongo');

(async () => {
    try {
        await mongoose.connect('mongodb://foodioadmin:11999966@15.206.164.241:27017/Foodio', { promiseLibrary: global.Promise, useNewUrlParser: true });
    } catch(error) {
        console.log(error);
    }

    const query = [{
        $match: {
            bIsIntroCaptured: true
        }
    }, {
        $limit: 1
    }];

    const data = await mongo.fetchRestaurantsAggregate(query);

    console.log(data);
})();