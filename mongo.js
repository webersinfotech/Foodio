const cities = require('./models/cities.modal');
const areas = require('./models/areas.modal');
const restaurants = require('./models/restaurants.modal');
const menu = require('./models/menu.modal');
const categories = require('./models/categories.modal');
const items = require('./models/items.modal');

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

    fetchRestaurantsAggregateCursor(query) {
        return restaurants.aggregate(query).cursor({ batchSize: 10 }).exec();
    }

    updateRestaurant(query, data) {
        return restaurants.updateOne(query, data);
    }

    createMenu(data) {
        return menu.insertMany(data);
    }

    createCategory(data) {
        return categories.create(data);
    }

    createItem(data) {
        return items.insertMany(data);
    }
}

module.exports = new Mongoose()