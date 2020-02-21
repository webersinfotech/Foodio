const express = require('express');
const mongoose = require('mongoose');
const mongo = require('./mongo');
const app = express();

mongoose.connect('mongodb://foodioadmin:11999966@15.206.164.241:27017/Foodio', { promiseLibrary: global.Promise, useNewUrlParser: true }).then(() => {
    console.log('Connected successfully')
}).catch((error) => {
    console.log('Error in connection');
})

app.use(express.static('assets'));

app.get('/:id', async (req, res) => {
    const resurant = await mongo.findRestaurants({_id: req.params.id});
    res.render(`${__dirname}/theme/index.ejs`, { sName : resurant[0].sName });
})

app.listen(3001, () => {
    console.log('Listening on 3000');
})