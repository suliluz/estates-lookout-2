const mongodbInstance = require("../mongodb-config");

const _ = require("lodash");

module.exports = {
    /**
     * @param {*} object 
     * Create a platform object
     * @field name - Platform name
     * @field about_description - Platform about us description
     * @field about_image - Platform about us image
     * @field logo - Platform logo (media_id)
     * @field qualifiedName - Platform unique name (used for subdomain)
     * @field theme_color - Preferred platform color (single)
     * @field landing_page_title - Page title for platform landing page
     * @field platform_type - Platform type (individual, company)
     * @field owner_type - Platform owner type (agent, group, company)
     * @field contact_mobile - Platform contact number
     * @field contact_email - Platform contact email
     * @field business_hours - Array of collection {days, time}
     * @field business_address - Business location
     * @field useful_links - Array of collection {link_label, link_url}
     * @field footer_slider - Collection {header, slides [media_id]}
     * @field landing_page_slider - Array of Uuid [media_id]
     * @field properties_listing_section - Collection {header, header_sub}
     * @field visibility - Collection {isVisible, reason}
     * @field user_id - Platform owner Uuid
     */
    getFieldReference: "Reference only"
}