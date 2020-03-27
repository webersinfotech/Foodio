const mongoose = require('mongoose');
const mongo = require('./mongo');
const cloudinary = require('cloudinary').v2;
const publicIp = require('public-ip');

(async () => {
    try {
        await mongoose.connect('mongodb://foodioadmin:11999966@15.206.164.241:27017/Foodio', { promiseLibrary: global.Promise, useNewUrlParser: true });
    } catch(error) {
        console.log(error);
    }

    setInterval(async () => {
        const query = [{
            $match: {
                bIsIntroCaptured: true,
                bIsVideoReady: true,
                bVideoUploaded: {
                    $ne: true
                },
                bIsVideoFetched: {
                    $ne: true
                },
                videoUrl: new RegExp(`^${await publicIp.v4()}:3001`)
            }
        }];
    
        const data = await mongo.fetchRestaurantsAggregate(query);

        await mongo.updateRestaurant({
            bIsIntroCaptured: true,
            bIsVideoReady: true,
            bVideoUploaded: {
                $ne: true
            },
            bIsVideoFetched: {
                $ne: true
            },
            videoUrl: new RegExp(`^${await publicIp.v4()}:3001`)
        }, {
            bIsVideoFetched: true
        })
    
        asyncForEach(data, async (restaurant) => {
            const cloudinaryQuery = {
                inUse: true
            };
        
            const cloudacc = await mongo.fetchCloudinary(cloudinaryQuery);
        
            cloudinary.config({
                cloud_name: cloudacc[0].cloudName,
                api_key: cloudacc[0].apiKey,
                api_secret: cloudacc[0].apiSecret
            })
    
            await uploadVideo(restaurant);
        })
    }, 60000)
})();

async function uploadVideo(restaurant) {
    return new Promise((resolve, rej) => {
        cloudinary.uploader.upload(`http://${restaurant.readyVideoUrl}`, {resource_type: "video", format: 'mp4'}, async (err, res) => {
            if (err) {
                console.log(err);
                rej(err);
            }
    
            await mongo.updateRestaurant({_id: restaurant._id}, {
                bVideoUploaded: true,
                cloudinaryUrl: res.secure_url
            })
            
            console.log(res.secure_url);

            resolve();
        })
    })
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}
