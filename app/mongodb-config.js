const MongoClient = require("mongodb").MongoClient;
const mode = process.env.NODE_ENV;

var database = mode === "production" ? process.env.MONGODB_PROD_DATABASE : process.env.MONGODB_DEV_DATABASE;

const url = `mongodb://${process.env.MONGODB_USER}:${encodeURIComponent(process.env.MONGODB_PASS)}@${process.env.MONGODB_HOST}/?authSource=admin`;

var _db;

module.exports = {
    open: async function() {
        return new Promise(function (resolve, reject) {
            MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true}, function (err, connection) {
                if(err) return reject(err);
                return resolve(connection.db(database));
            });
        });
    }
}