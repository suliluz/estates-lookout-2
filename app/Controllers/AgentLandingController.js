var db = require("../mongodb-config");
var mongodb = require("mongodb");
var {Utilities} = require("../functions");
var _ = require("lodash");

module.exports = {
    getIndex: async function(req, res) {
        try {
            let instance = await db.open();

            let property_types, cities, bathroom, bedroom, parking, price, sqft;

            let listings = await instance.collection("projects").find({representative_platform: res.locals.platform._id}).toArray();

            if(listings) {
                property_types = Utilities.getSelections(listings, "property_type")
                cities = Utilities.getSelections(listings, "city");
                bathroom = Utilities.getMetadataRange(listings, "bathrooms");
                bedroom = Utilities.getMetadataRange(listings, "bedrooms");
                parking = Utilities.getMetadataRange(listings, "parkings");
                price = Utilities.getMetadataRange(listings, "price")
                sqft = Utilities.getMetadataRange(listings, "sqft")
            }

            let data = {
                listings,
                search: {
                    property_types,
                    cities,
                    bathroom,
                    bedroom,
                    parking,
                    price,
                    sqft
                }
            }

            console.log(data);

            return res.render("agent-landing/index", {layout: "agent-landing", data: data});
        } catch (err) {
            console.log(err);
            return res.status(500).json({status: 500, message: "An error has occurred"});
        }

    },
    getPropertyView: async function(req, res) {
        let qualifiedName = req.params.qualifiedName;

        let instance = await db.open();

        let listing = await instance.collection("projects").findOne({qualifiedName: qualifiedName, representative_platform: res.locals.platform["_id"]});

        if(!listing) return res.status(404).json({status: 404, message: "Property not found."});

        let owner = await instance.collection("users").findOne({_id: listing.distributor});

        if(listing["creation_type"] === "detailed-creation" && listing["towers"].length > 0) {
            listing["towers"].forEach((element, index) => {
                listing["towers"][index] = Object.assign(listing["towers"][index], {floorCount: element.floors.length});

                listing["towers"][index]["floors"].forEach((floor, floorIndex) => {
                    listing["towers"][index]["floors"][floorIndex] = Object.assign(listing["towers"][index]["floors"][floorIndex], {floorIndex: floorIndex});
                });

                listing["towers"][index]["floors"] = element["floors"].reverse();
            });
        }

        await Utilities.asyncForEach(listing["photos"], async function (id, index) {
            listing["photos"][index] = await instance.collection("medias").findOne({
                _id: id
            });
        });

        await Utilities.asyncForEach(listing["documents"], async function (id, index) {
            listing["documents"][index] = await instance.collection("medias").findOne({
                _id: id
            });
        });

        await Utilities.asyncForEach(listing["videos"], async function (id, index) {
            listing["videos"][index] = await instance.collection("medias").findOne({
                _id: id
            });
        });

        console.log(listing);

        res.locals.pageTitle = listing.name;

        return res.render("agent-landing/view-property", {
            layout: "view-property",
            data: {
                listing,
                owner
            }
        });
    },
    getPropertySearch: async function (req, res) {
        try {
            let query = req.query;
            let instance = await db.open();

            let searchObject = {};

            if(("number_of_bedrooms") in query && query.number_of_bedrooms !== "") {
                searchObject = Object.assign(searchObject, {
                   "metadata.bedrooms.min": {
                       $gte: parseInt(query.number_of_bedrooms)
                   }
                });
            }

            if(("number_of_bathrooms") in query && query.number_of_bathrooms !== "") {
                searchObject = Object.assign(searchObject, {
                    "metadata.bathrooms.min": {
                        $gte: parseInt(query.number_of_bathrooms)
                    }
                });
            }

            if(query.city !== "all") {
                searchObject = Object.assign(searchObject, {
                    "city": query.city
                });
            }

            if(query.property_type !== "all") {
                searchObject = Object.assign(searchObject, {
                    "property_type": query.property_type
                });
            }

            let listings = await instance.collection("projects").find(searchObject).toArray();
            

            return res.render("agent-landing/search", {layout: "agent-landing", data: {
                listings,
                matchCount: listings.length
            }});
        } catch (err) {
            console.log(err);
            return res.status(500).json({status: 500, message: "An error has occurred."});
        }
    },
    getUnitView: async function(req, res) {
        try {
            let propertyQualifiedName = req.params.qualifiedName;
            let query = req.query;

            let tower_position = query.tower;
            let floor_position = query.floor;
            let unit_position = query.unit;

            let instance = await db.open();

            let listing = await instance.collection("projects").findOne({
                qualifiedName: propertyQualifiedName,
                representative_platform: res.locals.platform._id
            });

            if(listing) {
                let unit = listing["towers"][tower_position]["floors"][floor_position]["units"][unit_position];

                console.log(unit);

                return res.render("agent-landing/view-unit", {layout: false, data: {
                    unit
                }});
            } else {
                return res.send("<h3>Information doesn't exist.</h3>");
            }
        } catch (err) {
            res.send("<h3>No information is available at this moment.</h3>");
        }
    },
    postLead: async function(req, res) {
        try {
            let body = req.body;

            let instance = await db.open();
            let listingQualified = await instance.collection("projects").findOne({qualifiedName: body.propertyQualifiedName, representative_platform: res.locals.platform._id});

            if(listingQualified) {
                await instance.collection("leads").insertOne({
                    full_name: body.name,
                    email: body.email,
                    phone: body.phone,
                    topic: listingQualified.name,
                    description: body.description,
                    platform: res.locals.platform._id,
                    createdAt: Date.now(),
                    read: false
                });

                return res.redirect("back");
            } else {
                return res.redirect("back");
            }
        } catch (err) {
            return res.redirect("back");
        }
    }, 
}