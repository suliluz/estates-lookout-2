const mongodbInstance = require("../mongodb-config");
const db = mongodbInstance.getDB();

const _ = require("lodash");

module.exports = {
    /**
     * @param {*} object 
     * Create a user object
     * @fields first_name - User's first name
     * @fields last_name - User's last name
     * @fields username - User's username
     * @fields password - User's password
     * @fields ren_number - User's REN number
     * @fields company_number - User's company number
     * @fields profile_photo - User profile photo
     * @fields email - User's email
     * @fields cms_color - Preferred CMS color
     * @fields notifications - Array of collection {notification, isRead, createdAt}
     * @fields activity_log - Array of collection {message, timestamp}
     * @fields stripe_customer_id - Stripe customer id
     * @fields stripe_subscription_id - Stripe associated subscription id
     * @fields stripe_session_id - Session id provided by Stripe (through webhooks)
     * @fields activated - Boolean to determine if user has successfully been created
     */
    getFieldReference: "Reference only",
    /**
     * 
     * @param {object} collection 
     * Creates a user collection
     */
    create: async function(collection) {
        //Check whether passed parameter is an array or a single object
        return await db.collection("users").insertOne(collection);
    },
    /**
     * 
     * @param {object} field 
     * Fields to match
     */
    find: async function(field) {
        return await db.collection("users").find(field).toArray();
    },
    /**
     * 
     * @param {object} targetFields 
     * Match collection by fields
     * @param {object} updateFields
     * Fields to modify 
     */
    update: async function(targetFields, updateFields) {
        return await db.collection("users").updateOne(targetFields, {$set: updateFields});
    },
    /**
     * 
     * @param {object} field 
     * Fields to match
     */
    delete: async function(field) {
        return await db.collection("users").deleteOne(field);
    }
}