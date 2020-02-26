const express = require('express');
const mongoose = require('mongoose');
const mongo = require('./mongo');
const FS = require('fs');
const multer  = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const publicIp = require('public-ip');
const app = express();

app.use(express.urlencoded({
    extended: true,
    limit: "1000mb",
    parameterLimit: 100000
}));
app.use(express.json({
    limit: "1000mb"
}));

mongoose.connect('mongodb://foodioadmin:11999966@15.206.164.241:27017/Foodio', { promiseLibrary: global.Promise, useNewUrlParser: true }).then(() => {
    console.log('Connected successfully')
}).catch((error) => {
    console.log('Error in connection');
})

app.use(express.static('assets'));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, __dirname)
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname)) //Appending extension
    }
})

const upload = multer({ storage: storage });

const type = upload.single('video');

app.get('/:id', async (req, res) => {
    const resurant = await mongo.findRestaurants({_id: req.params.id});
    res.render(`${__dirname}/theme/index.ejs`, { sName : resurant[0].sName, _id: req.params.id });
})

app.post('/video/:id', type, (req, res) => {
    console.log('I am fired');
    console.log(req.file, req.params.id);
    uploadVideo(req.file.filename, req.params.id);
})

async function uploadVideo(filename, id) {
    const query = {
        inUse: true
    };

    const cloudacc = await mongo.fetchCloudinary(query);

    cloudinary.config({
        cloud_name: cloudacc[0].cloudName,
        api_key: cloudacc[0].apiKey,
        api_secret: cloudacc[0].apiSecret
    })

    cloudinary.uploader.upload(filename, {resource_type: "video", format: 'webm'}, async (err, res) => {
        if (err) {
            console.log(err);
            return;
        }

        await mongo.updateRestaurant({_id: id}, {
            bIsIntroCaptured: true,
            videoUrl: res.secure_url
        })

        setTimeout(() => {
            FS.unlinkSync(filename);
        }, 10000)
        
        console.log(res.secure_url);
    })
}

app.listen(3001, async () => {
    console.log(await publicIp.v4());
    console.log('Listening on 3000');
})