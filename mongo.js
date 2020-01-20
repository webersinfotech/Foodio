const cities = require('./models/cities.modal');
const areas = require('./models/areas.modal');
const restaurants = require('./models/restaurants.modal');

class Mongoose {
    createCities(data) {
        return cities.insertMany(data);
    }

    fetchCities(query) {
        return cities.find(query);
    }

    createAreas(data) {
        return areas.insertMany(data);
    }

    updateArea(query, data) {
        return areas.updateMany(query, data)
    }

    fetchAreas(query) {
        return areas.find(query).limit(900);
    }

    createRestaurants(data) {
        return restaurants.insertMany(data);
    }

    fetchRestaurantsAggregate(query) {
        return restaurants.aggregate(query);
    }

    updateRestaurant(query, data) {
        return restaurants.updateOne(query, data);
    }
}

module.exports = new Mongoose()