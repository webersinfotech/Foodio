const mongoose = require('mongoose');
const mongo = require('./mongo');
const ffmpeg = require('fluent-ffmpeg');
const publicIp = require('public-ip');

const chunk = (arr, size) => arr .reduce((acc, _, i) => (i % size) ? acc : [...acc, arr.slice(i, i + size)] , []);

(async () => {
    try {
        await mongoose.connect('mongodb://foodioadmin:11999966@15.206.164.241:27017/Foodio', { promiseLibrary: global.Promise, useNewUrlParser: true });
    } catch(error) {
        console.log(error);
    }

    const query = [{
        $match: {
            bIsIntroCaptured: true,
            bIsVideoReady: {
                $ne: true
            },
            videoUrl: new RegExp(`^${await publicIp.v4()}:3001`)
        }
    }];

    const data = await mongo.fetchRestaurantsAggregate(query);

    const chunkedData = chunk(data, 4);

    asyncForEach(chunkedData, async (restaurants) => {
        restaurants.forEach((res) => {
            try {
                const name = res.videoUrl.split('/')[1];
                prepareVideo(name).then(async () => {
                    console.log(`${res.videoUrl.split('/')[0]}/ready/${name.split('.')[0]}-ready.mp4`, res._id);
                    await mongo.updateRestaurant({_id: res._id}, {
                        bIsVideoReady: true,
                        readyVideoUrl: `${res.videoUrl.split('/')[0]}/ready/${name.split('.')[0]}-ready.mp4`
                    });
                }).catch((error) => {
                    console.log(error);
                });
            } catch(error) {
                console.log(error);
            }
        })
        await new Promise(resolve => setTimeout(resolve, 39000));
    });
})();

async function prepareVideo(name) {
    return new Promise((res, rej) => {
        new ffmpeg()
        .addInput(`${__dirname}/assets/${name}`)
        .addInput(`${__dirname}/assets/bensound-perception.mp3`)
        .outputOptions(['-shortest'])
        .saveToFile(`${__dirname}/assets/ready/${name.split('.')[0]}-ready.mp4`)
        .on('progress', (progress) => console.log(progress))
        .on('end', () => res())
        .on('error', (error) => rej(error));
    })
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}