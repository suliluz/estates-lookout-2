const mongodbInstance = require("../mongodb-config");
const db = mongodbInstance.getDB();

const _ = require("lodash");

module.exports = {
    /**
     * @param {*} object 
     * Create a project object
     * @fields name - Project name
     * @fields description - Project description
     * @fields property_type - Project property type
     * @fields street_address - Project street address
     * @fields coordinates - Collection type (latitude, longitude)
     * @fields postcode - Project postcode
     * @fields city - Project city
     * @fields state - Project state
     * @fields country - Project country
     * @fields slider_photos - Project slider photos
     * @fields photos - Array of media id (image)
     * @fields videos - Array of media id (video)
     * @fields reports - Array of media id (all)
     * @fields additional_info - Additional information optional to be added by creator
     * @fields managing_for - Project created on behalf of who
     * @fields towers - Array of collections ({tower_name, floor_count, floors: {floor_name, units_count, units: {name, description, unit_type, videos, photos, reports, bathrooms, bedrooms, parkings, sqft, price, status, negotiable}}}
     * @fields creation_type - Project creation type (single-property, info, detailed-creation)
     * @fields metadata - Collection (bedrooms {min, max}, bathrooms {min, max}, parkings {min, max}, sqft {min, max}, sold, available, reserved, total, unit_types)
     * @fields distributor - The user who distributes the listing to agents
     * @fields representative_platform - The platform to host the listing
     * @fields reference_id - Original project id
     */
    getFieldReference: "Reference only"
}