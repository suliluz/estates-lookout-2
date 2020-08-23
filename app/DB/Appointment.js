const mongodbInstance = require("../mongodb-config");
const db = mongodbInstance.getDB();

const _ = require("lodash");

module.exports = {
    /**
     * @param {*} object 
     * Create a appointment object
     * @fields title - Appointment title
     * @fields date - Appointment date
     * @fields start_date - When the appointment starts
     * @fields end_date - When the appointment ends
     * @fields appointment_for - The invitee
     * @fields details - Details of the appointment
     * @fields user_id - User id
     */
    getFieldReference: "Reference only"
}