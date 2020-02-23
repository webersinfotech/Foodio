const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');
const mongo = require('./mongo');

(async ()  => {
    try {
        await mongoose.connect('mongodb://foodioadmin:11999966@15.206.164.241:27017/Foodio', { promiseLibrary: global.Promise, useNewUrlParser: true });
    } catch(error) {
        console.log(error);
    }

    setInterval(async () => {
        const query = {
            inUse: true
        };
    
        const cloudacc = await mongo.fetchCloudinary(query);

        console.log(cloudacc);
    
        cloudinary.config({
            cloud_name: cloudacc[0].cloudName,
            api_key: cloudacc[0].apiKey,
            api_secret: cloudacc[0].apiSecret
        })

        cloudinary.api.usage(async (error, res) => {
            if (error) console.log(error);
            console.log(res);
            await mongo.updateOnceCloudinary({_id: cloudacc[0]._id}, {
                storageUsage: res.storage.usage / (1000 * 1000),
                creditUsage: res.credits.usage
            })
            if (res.credits.usage >= 23) {
                await mongo.updateOnceCloudinary({
                    inUse: false,
                    isUsed: false
                }, {
                    inUse: true,
                })
                await mongo.updateOnceCloudinary({_id: cloudacc[0]._id}, {
                    inUse: false,
                    isUsed: true
                })
            }
        })
    }, 8000)
})();