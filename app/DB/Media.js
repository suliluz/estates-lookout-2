const mongodbInstance = require("../mongodb-config");
const db = mongodbInstance.getDB();

const _ = require("lodash");

module.exports = {
    /**
     * @param {*} object 
     * Create a media object
     * @fields displayName - File display name
     * @fields caption - Image/video caption
     * @fields fileType - video/image/document
     * @fields extension - File extension
     * @fields fileName - File name
     * @fields uploadedFor - Intended functionality of the file
     * @fields updatedAt - Timestamp of when file is updated
     * @fields createdAt - Timestamp of when the file is first created
     * @fields user_id - User Id
     */
    getFieldReference: "Reference only"
}