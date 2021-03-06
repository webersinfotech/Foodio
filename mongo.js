const cities = require('./models/cities.modal');
const areas = require('./models/areas.modal');
const restaurants = require('./models/restaurants.modal');
const menu = require('./models/menu.modal');
const categories = require('./models/categories.modal');
const items = require('./models/items.modal');
const counter = require('./models/counter.modal');
const cloudinary = require('./models/cloudinary.modal');
const users = require('./models/users.modal');

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

    findRestaurants(query) {
        return restaurants.find(query);
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

    updateManyRestaurant(query, data) {
        return restaurants.updateMany(query, data);
    }

    // fetchRestaurant(query) {
    //     return restaurants.find(query).count();
    // }

    createMenu(data) {
        return menu.insertMany(data);
    }

    createCategory(data) {
        return categories.create(data);
    }

    createItem(data) {
        return items.insertMany(data);
    }

    MenuFetchedRestauarants() {
        return items.distinct('resId');
    }

    fetchCounter() {
        return counter.find({});
    }

    incCounter(counterData) {
        const updateData = typeof counterData === 'undefined' ? {$inc: { counter: 1 }} : {counter: Number(counterData)};
        return counter.findOneAndUpdate({}, updateData, {new: true});
    }

    fetchCloudinary(query) {
        return cloudinary.find(query);
    }

    updateOnceCloudinary(query, data) {
        return cloudinary.findOneAndUpdate(query, data);
    }

    createUser(data) {
        return users.create(data);
    }

    fetchUser(query) {
        return users.find(query);
    }
}

module.exports = new Mongoose()