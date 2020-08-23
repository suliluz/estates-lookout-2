const mongodbInstance = require("../mongodb-config");
const db = mongodbInstance.getDB();

const _ = require("lodash");

module.exports = {
    /**
     * @param {*} object 
     * Create a leads object
     * @fields full_name - Customer full name
     * @fields email - Customer email
     * @fields phone - Customer phone
     * @fields topic - Property interested in
     * @fields description - Description of their topic
     * @fields platform - Platform id
     * @fields createdAt - Date the lead is created in timestamp
     * @fields read - Is the lead read
     */
    getFieldReference: "Reference only"
}