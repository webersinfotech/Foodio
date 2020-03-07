const express = require('express');
const mongoose = require('mongoose');
const mongo = require('./mongo');
const app = express();

mongoose.connect('mongodb://foodioadmin:11999966@15.206.164.241:27017/Foodio', { promiseLibrary: global.Promise, useNewUrlParser: true }).then(() => {
    console.log('Connected Successfully')
}).catch(() => {
    console.log('Failed to connect');
});

app.get('/', async (req, res) => {
    const counter = await mongo.fetchCounter();
    res.send(`${counter[0].counter}`);
    await mongo.incCounter();
})

app.get('/current', async (req, res) => {
    const counter = await mongo.fetchCounter();
    res.send(`${counter[0].counter}`);
})

app.get('/:group', async (req, res) => {
    if (!isNaN(req.params.group)) {
        const counter = await mongo.incCounter(req.params.group);
        res.send(`${counter.counter}`);
    }
})

app.listen(3000, () => {
    console.log('Listening on 3000');
})