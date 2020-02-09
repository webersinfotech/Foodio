const express = require('express');
const app = express();
let group = 0;

app.get('/', (req, res) => {
    res.send(`${group}`);
    group++;
})

app.get('/current', (req, res) => {
    res.send(`${group}`);
})

app.get('/:group', (req, res) => {
    group = parseInt(req.params.group);
    res.send(`${group}`);
})

app.listen(3000, () => {
    console.log('Listening on 3000');
})