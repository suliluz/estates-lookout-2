const _ = require("lodash");
const {Token} = require("./functions");
const db = require("./mongodb-config");
const mongodb = require("mongodb");

module.exports = {
    /**
     * Returns platform collection based on the first subdomain.
     */
    dumpPlatformInfo: function(req, res, next) {
        let subdomain = req.subdomains[0];
        
        //Search platform based on the subdomain, if found return collection, if not, return false
        
    },
    /**
     * Route all subdomains to the route callback
     * @param {string | string[]} not 
     * All except these subdomains
     * @param {callback} route 
     * Route function/object 
     * @param {callback} notRoute
     * Route function/object if not is true
     */
    subdomainNot: function(not, route, notRoute) {
        if(!route || typeof route !== "function" || route.length < 3) {
            throw new Error("Route parameter must be a express.Router type or a callback with (req, res, next).");
        }

        return function(req, res, next) {
            let subdomain = req.subdomains[1];

            console.log(req.subdomains);

            if(typeof not === "object") {
                let check =_.includes(not, subdomain);

                // If the subdomain is found in that array of not, next it
                if(check) {
                    return notRoute(req, res, next);
                } else {    //If not, then safe to direct to route
                    return route(req, res, next);
                }
            } 
            else if(typeof not === "string") {
                // If the subdomain matches the not string, next it
                if(not === subdomain) {
                    return notRoute(req, res, next);
                } else {    //If not, then safe to direct to route
                    return route(req, res, next);
                }
            } else {
                throw new Error(`Expected string or array for not parameter. Got ${typeof not} instead.`);
            }
        }
    },
    /**
     * Set extra scripts/stylesheets/code
     * @param {object[]} objects 
     * An array of objects {type: js | css | textjs | textcss, path: string}
     */
    setExtras: function(objects) {
        let extras = _.groupBy(objects, "type");

        return function (req, res, next) {
            res.locals.extras = extras;
            next();
        }
    },
    /**
     * Search if user exists, if it does dump platform information. If not pass 404.
     */
    searchAndDumpPlatform: async function(req, res, next) {
        try {
            let subdomain = req.subdomains[1];

            let instance = await db.open();

            let platform = await instance.collection("platforms").findOne({
               qualifiedName: subdomain
            });

            let user = await instance.collection("users").findOne({
                _id: platform.user_id
            });

            platform["owner"] = user;

            if(platform) {
                res.locals.platform = platform;
                next();
            } else {
                return res.redirect(`http://www.${process.env.SITE_DOMAIN}/404`);
            }
        } catch (err) {
            console.log(err);
            return res.status(500).json({status: 500, message: "An error has occurred."});
        }
    },
    /**
     * Check if platform should be visible
     */
    checkPlatformVisibility: async function(req, res, next) {
        try {
            if(!res.locals.platform.visibility.isVisible) {
                return res.send("<h3>Website is currently in maintenance. Stay tuned!</h3>");
            } else {
                next();
            }
        } catch (err) {
            console.log(err);
            return res.status(500).json({status: 500, message: "An error has occurred."});
        }
    },
    /**
     * Check if user is authenticated with an encrypted token
     */
    authenticate: async function(req, res, next) {
        try {
            let ip = req.ip;
            let cookie = req.cookies["authorized"];

            if (!cookie) {
                return res.status(400).redirect("/login");
            }

            let token = await Token.read(cookie);

            let instance = await db.open();

            let user = await instance.collection("users").findOne({_id: mongodb.ObjectId(token.id)});

            res.locals.user = token;
            res.locals.notifications = user["notifications"];

            return next();
        } catch (err) {
            console.log(err);
            return res.status(500).redirect("/login");
        }
    }
}