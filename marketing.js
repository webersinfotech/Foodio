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
    
        restaurants.map((rest) => {
            if (typeof rest.phone_number_arr === 'undefined') return;

            const message = `Hello ${rest.sName},
            
Are you paying high commission for selling your food online?

Get your own app for the restaurant & that too by paying ₹100 only, Which includes 6 months of free service and free social media marketing.
            
So, What are you waiting for..? 
            
Call: +917990089984
Whatsapp: +919429058733
            
Check your restaurant video: `;

            const whatsapps = [];

            rest.phone_number_arr.map((whatsapp) => {
                whatsapps.push(`https://api.whatsapp.com/send?phone=${whatsapp.replace(/\s/g, "")}&text=${encodeURIComponent(message)}%20${encodeURIComponent(rest.cloudinaryUrl)}&source=&data=`);
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

// async function assignData() {
//     setTimeout(async () => {
//         const restQuery = [{
//             $match: {
//                 iAssignedTo: {
//                     $ne: mongoose.Types.ObjectId('5e9c264a03f77c5d35e68de4')
//                 },
//                 bContactViewed: {
//                     $ne: true
//                 },
//                 bVideoUploaded: true
//             }
//         }, {
//             $limit: 100
//         }];

//         const restaurants = await mongo.fetchRestaurantsAggregate(restQuery);

//         const IDS = [];

//         restaurants.map((rest) => {
//             IDS.push(rest._id);
//         });

//         const updateData = await mongo.updateManyRestaurant({
//             _id: {
//                 $in: IDS
//             }
//         }, {
//             iAssignedTo: mongoose.Types.ObjectId('5e9c2b4b2787385e6ccffae2')
//         });

//         console.log(updateData);
//     }, 1000);
//     console.log('assignData');
// }

// assignData();

// app.post('/assign/:user_id', async (req, res) => {
//     try {
//         const restQuery = [{}]
//         res.status(200).send({
//             message: 'Data assigned successfully'
//         });
//     } catch(error) {
//         res.status(400).send({
//             message: 'Failed to assign data'
//         }); 
//     }
// });

app.listen(4392, async () => {
    console.log('Listening on 4392');
})