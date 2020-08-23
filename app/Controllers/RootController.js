const {Password, Token, Stripe, Utilities} = require("../functions");
const mongodb = require("mongodb");
const db = require('../mongodb-config');

module.exports = {
    getIndex: async function(req, res) {
        return res.render("estateslookout-landing/index", {
            layout: "root-page"
        });
    },
    getLogin: async function(req, res) {
        return res.render("estateslookout-landing/login", {
            layout: "root-page"
        });
    },
    getSignup: async function(req, res) {
        try {
            let session_id = req.params.sessionId;
            let instance = await db.open();
            let user = await instance.collection('users').findOne({stripe_session_id: session_id, activated: false});

            let session = await Stripe.instance().checkout.sessions.retrieve(user.stripe_session_id);
            return res.render("estateslookout-landing/signup", {
                layout: "root-page",
                data: {user: user, type: session.metadata.account_type}
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json({status: 500, message: "Error has occurred", errorBody: err});
        }
    },
    getRedirectToCheckout: async function (req, res) {
        try {
            let product_type = req.params.productType;
            let session;

            if(product_type === "agent-my") {
                session = await Stripe.proceedToPaymentCheckout(process.env.PLAN_AGENT_MY, "individual");
            }
            else if(product_type === "developer-my") {
                session = await Stripe.proceedToPaymentCheckout(process.env.PLAN_DEVEL_MY, "company");
            }

            console.log(session);

            return res.render("estateslookout-landing/redirect-to-checkout", {
                layout: false,
                data: {session: session.id}
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json({message: err});
        }
    },
    get404: async function (req, res) {
        return res.json({status: 404, message: "Page not found"});
    },
    postLogin: async function(req, res) {
        try {
            let body = req.body;
            console.log(body);
            let instance = await db.open();
            let user = await instance.collection('users').findOne({username: body["username"]});

            if(user) {
                let passwordsMatch = await Password.comparePassword(body["password"], user["password"]);

                if(passwordsMatch) {
                    let platform = await instance.collection('platforms').findOne({user_id: user._id});

                    let tokenOptions = {issuer: "Estates Lookout"};

                    if(req.body["keepSignedIn"] && req.body["keepSignedIn"] === "on") {
                        tokenOptions = Object.assign(tokenOptions, {expiresIn: "7d"});
                    } else {
                        tokenOptions = Object.assign(tokenOptions, {expiresIn: "24h"});
                    }

                    let encryptedToken = await Token.create({
                        id: user._id.toString(),
                        username: user.username,
                        firstName: user.first_name,
                        lastName: user.last_name,
                        profile_pic: user.profile_photo,
                        accessed_ip: req.remoteIPAddress,
                        platform: platform._id.toString(),
                        platform_type: platform.platform_type,
                        cms_color: user.cms_color,
                        keepSigned: req.body["keepSignedIn"] && req.body["keepSignedIn"] === "on"
                    }, tokenOptions);

                    if(req.body["keepSignedIn"] && req.body["keepSignedIn"] === "on") {
                        console.log(true);
                        return res.cookie("authorized", encryptedToken, {httpOnly: true, secure: true, maxAge: 604800000}).redirect("/cms/listings");
                    } else {
                        return res.cookie("authorized", encryptedToken, {httpOnly: true, secure: true}).redirect("/cms/listings");
                    }
                } else {
                    res.locals.flash = {type: "error", message: ["Wrong username or password."]};
                    return res.redirect("/login");
                }
            } else {
                res.locals.flash = {type: "error", message: ["User does not exist"]};
                return res.redirect("/login");
            }
        } catch (err) {
            console.log(err);
            return res.status(500).send({status: 500, message: "An error has occurred."})
        }


    },
    postSignup: async function(req, res) {
        try {
            if(!(req.body["password"]["value"] === req.body["password"]["confirm"])) {
                return res.redirect("back");
            }

            let hashedPassword = await Password.hash(req.body["password"]["value"]);

            let instance = await db.open();

            let user_id = mongodb.ObjectId(req.body["user_id"]);

            await instance.collection("users").updateOne({_id: user_id}, {
                $set: {
                    first_name: req.body["firstName"],
                    last_name: req.body["lastName"],
                    username: req.body["username"],
                    password: hashedPassword,
                    ren_number: req.body["ren"],
                    company_number: req.body["companyNum"],
                    email: req.body["email"],
                    cms_color: "default",
                    activated: true
                }
            }, {upsert: true});

            await instance.collection("platforms").insertOne({
                user_id: user_id,
                qualifiedName: req.body["platform"]["qualifiedName"],
                theme_color: "default",
                platform_type: req.body["account_type"],
                owner_type: req.body["account_type"] === "individual" ? "agent" : "company",
                name: `Welcome to ${req.body["firstName"]} ${req.body["lastName"]}'s Real Estate`,
                contact_email: req.body["email"],
                visibility: {
                    isVisible: true,
                    reason: null
                }
            });

            return res.redirect(`https://www.${process.env.SITE_DOMAIN}/login`);
        } catch (err) {
            console.log(err);
            return res.status(500).json({status: 500, message: "Error has occurred."});
        }
    },
    postStripeWebhook: async function(req, res) {
        try {
            const sig = req.headers['stripe-signature'];

            let webhook = await Stripe.handleStripeWebhookResponse(req.body, sig);

            if(webhook.success) {
                console.log("Stripe webhook response is successful");
                return res.json({received: true});
            } else {
                console.log(`Error occurred: ${webhook.message}`);
            }
        } catch (err) {
            console.log(err);
        }
    }
}