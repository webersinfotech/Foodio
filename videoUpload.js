const mongoose = require('mongoose');
const mongo = require('./mongo');
const cloudinary = require('cloudinary').v2;

(async () => {
    try {
        await mongoose.connect('mongodb://foodioadmin:11999966@15.206.164.241:27017/Foodio', { promiseLibrary: global.Promise, useNewUrlParser: true });
    } catch(error) {
        console.log(error);
    }

    const query = [{
        $match: {
            bIsIntroCaptured: true,
            bIsVideoReady: true
        }
    }];

    const data = await mongo.fetchRestaurantsAggregate(query);

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
    
        cloudinary.uploader.upload(`http://${restaurant.readyVideoUrl}`, {resource_type: "video", format: 'mp4'}, async (err, res) => {
            if (err) {
                console.log(err);
                return;
            }
    
            await mongo.updateRestaurant({_id: restaurant._id}, {
                bVideoUploaded: true,
                cloudinaryUrl: res.secure_url
            })
            
            console.log(res.secure_url);
        })
    })
})()

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}