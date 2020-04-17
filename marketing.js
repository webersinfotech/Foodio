const express = require('express');
const mongo = require('./mongo');
const mongoose = require('mongoose');
const cors = require('cors')
const app = express();

app.use(express.json());
app.use(cors());

mongoose.connect('mongodb://foodioadmin:11999966@15.206.164.241:27017/Foodio', { promiseLibrary: global.Promise, useNewUrlParser: true }).then(() => {
    console.log('Connected successfully')
}).catch((error) => {
    console.log('Error in connection');
})

app.post('/signup', async (req, res) => {
    try {
        await mongo.createUser(req.body);
        return res.status(201).send({
            message: 'User signed up successfully'
        })
    } catch(error) {
        return res.status(400).send({
            message: 'Failed to create user account'
        })
    }
});

app.get('/contacts', async (req, res) => {
    try {
        const query = {
            uuid: req.query.uuid
        }
    
        const users = await mongo.fetchUser(query);

        console.log(users);
    
        const restQuery = [{
            $match: {
                iAssignedTo: mongoose.Types.ObjectId(users[0]._id),
                bContactViewed: {
                    $ne: true
                },
                bVideoUploaded: true
            }
        }, {
            $limit: 10
        }]

        console.log(restQuery);
    
        const restaurants = JSON.parse(JSON.stringify(await mongo.fetchRestaurantsAggregate(restQuery)));
    
        const contacts = [];
    
        const message = 'Are%20you%20paying%20high%20commission%20for%20selling%20your%20food%20online%3F%0A%0AGet%20your%20own%20restaurant%20app%20that%20also%20on%20paying%20%E2%82%B9100%20only.%20Then%20after%20free%20for%206%20months.%20%0A%0ASo%20what%20are%20you%20waiting%20for%3F%20%0A%0ACall%3A%20%2B917990089984%0AWhatsapp%3A%20%2B919429058733%0A%0Acheck%20video%3A';
    
        restaurants.map((rest) => {
            const whatsapps = [];
            rest.phone_number_arr.map((whatsapp) => {
                whatsapps.push(`https://api.whatsapp.com/send?phone=${whatsapp.replace(/\s/g, "")}&text=${message}%20${encodeURIComponent(rest.cloudinaryUrl)}&source=&data=`);
            })
            contacts.push({
                _id: rest._id,
                sName: rest.sName,
                aWhatsapps: whatsapps,
                sVideo: rest.cloudinaryUrl
            })
        })
    
        res.status(200).send({
            message: 'Restaurant fetched successfully',
            data: contacts
        });
    } catch(error) {
        console.log(error);
        res.status(400).send({
            message: 'Failed to fetch data'
        });
    }
})

app.put('/viewed', async (req, res) => {
    try {
        const query = {
            _id: req.body._id
        };

        await mongo.updateRestaurant(query, {
            bContactViewed: true,
            dContactViewedDate: new Date()
        });

        res.status(200).send({
            message: 'Contact viewed operation success'
        });
    } catch(error) {
        console.log(error);
        res.status(400).send({
            message: 'Failed to update view status'
        });
    }
});

app.listen(4392, async () => {
    console.log('Listening on 4392');
})