const mongodbInstance = require("../mongodb-config");
const db = mongodbInstance.getDB();

const _ = require("lodash");

module.exports = {
    /**
     * @param {*} object 
     * Create a unit reports object
     * @fields recipient - The intended recepient to get these reports
     * @fields reference_id - The original project id
     * @fields reports - Array of collection {message, timestamp}
     * @fields document_issued - Whether PDF document is generated (true or false)
     * @fields issued_at - Timestamp of when PDF is generated
     * @fields created_at - Timestamp of when the collection was created
     */
    getFieldReference: "Reference only",
    /**
     * 
     * @param {object} collection 
     * Creates a unit report collection
     */
    create: async function(collection) {
        //Check whether passed parameter is an array or a single object
        return await db.collection("unit_reports").insertOne(collection);
    },
    /**
     * 
     * @param {object} field 
     * Fields to match
     */
    find: async function(field) {
        return await db.collection("unit_reports").find(field).toArray();
    },
    /**
     * 
     * @param {object} targetFields 
     * Match collection by fields
     * @param {object} updateFields
     * Fields to modify 
     */
    update: async function(targetFields, updateFields) {
        return await db.collection("unit_reports").updateOne(targetFields, {$set: updateFields});
    },
    /**
     * 
     * @param {object} field 
     * Fields to match
     */
    delete: async function(field) {
        return await db.collection("unit_reports").deleteOne(field);
    }
}