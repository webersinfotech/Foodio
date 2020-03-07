const mongoose = require('mongoose');
const mongo = require('./mongo');
const ffmpeg = require('fluent-ffmpeg');


(async () => {
    new ffmpeg()
    .addInput(`${__dirname}/assets/1582904095539.webm`)
    .addInput(`${__dirname}/assets/bensound-perception.mp3`)
    .saveToFile(`${__dirname}/assets/output.mp4`);
    // try {
    //     await mongoose.connect('mongodb://foodioadmin:11999966@15.206.164.241:27017/Foodio', { promiseLibrary: global.Promise, useNewUrlParser: true });
    // } catch(error) {
    //     console.log(error);
    // }

    // const query = [{
    //     $match: {
    //         bIsIntroCaptured: true
    //     }
    // }, {
    //     $limit: 1
    // }];

    // const data = await mongo.fetchRestaurantsAggregate(query);

    console.log(data);
})();