const mongoose = require('mongoose');
const request = require('request');
const mongo = require('./mongo');
const fs = require('fs');

// tor.TorControlPort.password = '11999966';

mongoose.connect('mongodb://localhost:27017/foodio', { promiseLibrary: global.Promise, useNewUrlParser: true }).then(() => {
    console.log('Connected to database.');
  }).catch((error) => {
    console.log('Connection to Database failed.');
});

class Area {
    constructor() {}

    async searchArea() {
        const areas = await mongo.fetchAreas({
            bIsDetailFetched: {
                $ne: true
            }
        })

        await asyncForEach(areas, async (area) => {
            try {
                const data = await this.fetchDetail(area.sName);
                if (data.location_suggestions.length >= 1) {
                    data.location_suggestions[0]._id = area._id;
                    data.location_suggestions[0].bIsDetailFetched = true;
                    
                    await mongo.updateArea({_id: area._id}, data.location_suggestions[0]);
                }
            } catch(Error) {
                console.log('Error occured: ', Error);
            }
        });
    }

    async fetchDetail(name) {
        return new Promise((res, rej) => {
            const options = {
                url: `https://developers.zomato.com/api/v2.1/locations?query=${encodeURI(name)}`,
                headers: {
                    'user-key': '3717835ae658ead76d31ab2b4535c8df'
                }
            };
    
            request(options, function (error, response, body) {
                if (error) rej(error);
                res(JSON.parse(body));
            });
        })
    }

    async importArea(){
        const areas = JSON.parse(fs.readFileSync('./areas.json', 'utf8'));
        await mongo.createAreas(areas);
    }
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

const area = new Area();
area.importArea();