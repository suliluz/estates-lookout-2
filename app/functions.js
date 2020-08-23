var stripe = require('stripe')(process.env.NODE_ENV === "development" ? process.env.STRIPE_TEST_SECRET_KEY : process.env.STRIPE_LIVE_SECRET_KEY);
var db = require('./mongodb-config');
var _ = require("lodash");
var bcrypt = require("bcrypt");
var jwt = require('jsonwebtoken');
var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
var mongodb = require("mongodb");
var Handlebars = require("handlebars");
var Puppeteer = require("puppeteer");

var Utilities = {
    flash(response, type = "warning", messages = []) {
        response.locals.flash = {type: type, messages: messages};
    },
    async processTemplate(viewFilename, data) {
        try {
            let views_path = path.resolve(__dirname, "..", "resources/views", `${viewFilename}.hbs`);
            let view = fs.readFileSync(views_path);

            let template = Handlebars.compile(view);
            let compiledHTML = template(data);

            return compiledHTML;
        } catch (err) {
            return new Error(err);
        }
        let view = fs.readFile
    },
    async encrypt(str) {
        return new Promise(function(resolve, reject) {
            try {
                let ciphers = {
                    key: Buffer.from(process.env.CRYPTO_HEX_KEY, "hex"),
                    iv: Buffer.from(process.env.CRYPTO_HEX_IV, "hex")
                };
                let cipher = crypto.createCipheriv('aes-256-cbc', ciphers.key, ciphers.iv);
                let encryptedToken = cipher.update(str);
                encryptedToken = Buffer.concat([encryptedToken, cipher.final()]);
                resolve(encryptedToken.toString("hex"));
            } catch (err) {
                reject(err);
            }

        });
    },
    async decrypt(encryptedStr) {
        return new Promise(function(resolve, reject) {
            try {
                let ciphers = {
                    key: Buffer.from(process.env.CRYPTO_HEX_KEY, "hex"),
                    iv: Buffer.from(process.env.CRYPTO_HEX_IV, "hex")
                };
                let encryptedToken = Buffer.from(encryptedStr, "hex");
                let decipher = crypto.createDecipheriv('aes-256-cbc', ciphers.key, ciphers.iv);
                let decryptedToken = decipher.update(encryptedToken);
                decryptedToken = Buffer.concat([decryptedToken, decipher.final()]);
                decryptedToken = decryptedToken.toString();
                resolve(decryptedToken);
            } catch (err) {
                reject(err);
            }
        });
    },
    getMetadataRange(arrayBody, targetKey) {
        let metadata = _.map(arrayBody, function(e) { return e.metadata});
        let metadata_elements = _.map(metadata, targetKey);

        let elements_min = _.map(metadata_elements, "min");
        let elements_max = _.map(metadata_elements, "max");

        return {min: _.min(elements_min), max: _.max(elements_max)};
    },
    getMin(arrayBody, targetKey) {
        let elements = _.map(arrayBody, targetKey)
        return _.min(elements);
    },
    getMax(arrayBody, targetKey) {
        let elements = _.map(arrayBody, targetKey);
        return _.max(elements);
    },
    getRange(arrayBody, targetKey, isDecimal = false) {
        let elements = _.map(arrayBody, targetKey);

        if(isDecimal) {
            elements = _.map(elements, function(element) {
                return parseFloat(element)
            });
        }

        return {
            min: _.min(elements),
            max: _.max(elements)
        }
    },
    getSingleRange(number) {
        let value = parseInt(number);

        return {
            min: value,
            max: value
        }
    },
    getSelections(arrayBody, targetKey) {
        let elements = _.map(arrayBody, targetKey);
        return _.uniq(elements);
    },
    getQualifiedName(string) {
        return string.replace(/\W+/g, '-').toLowerCase();
    },
    async asyncForEach(array, cb) {
        for (let index = 0; index < array.length; index++) {
            await cb(array[index], index, array);
        }
    },
    async registerAvatarIntoServer(user_id, file) {

        if(file) {
            let instance = await db.open();
            let avatar = await instance.collection("medias").findOne({user_id: mongodb.ObjectId(user_id), uploadedFor: "avatar"});

            let mimeType = file.mimetype.split("/");

            let media_id;

            if(avatar) {
                media_id = avatar._id.toString();

                await instance.collection("medias").updateOne({user_id: mongodb.ObjectId(user_id), uploadedFor: "avatar"}, {
                    $set: {
                        displayName: file.originalname,
                        caption: null,
                        fileType: mimeType[0],
                        extension: mimeType[1],
                        fileName: file.filename,
                        path: file.path,
                        updatedAt: Date.now()
                    }
                });
            } else {
                let transaction = await instance.collection("medias").insertOne({
                    displayName: file.originalname,
                    caption: null,
                    fileType: mimeType[0],
                    extension: mimeType[1],
                    fileName: file.filename,
                    path: file.path,
                    user_id: mongodb.ObjectId(user_id),
                    updatedAt: Date.now(),
                    uploadedFor: "avatar"
                });

                media_id = transaction.insertedId.toString();
            }

            return media_id;
        } else {
            return null;
        }
    }
}

var Token = {
    async create(object, tokenOptions = {}) {
        return new Promise(function (resolve, reject) {
            fs.readFile(path.resolve(__dirname, "jwtsign.key"), function (fileErr, jwtSigningKey) {
                if (fileErr) return reject(fileErr);
                tokenOptions = Object.assign(tokenOptions, {algorithm: "RS256"});
                jwt.sign(object, jwtSigningKey, tokenOptions, async function(tokenErr, token) {
                    if (tokenErr) return reject(tokenErr);

                    try {
                        let encrypted = await Utilities.encrypt(token);
                        return resolve(encrypted);
                    } catch (err) {
                        reject(err);
                    }
                });
            });
        });
    },
    async read(token, verify = true) {
        return new Promise(async function(resolve, reject) {
            // Decrypt the token
            let decryptedToken = await Utilities.decrypt(token);

            fs.readFile(path.resolve(__dirname, "jwtsign.key"), function (fileErr, jwtSigningKey) {
                if (fileErr) return reject(fileErr);

                // Based on preference, either verify token or just read
                if(verify) {
                    jwt.verify(decryptedToken, jwtSigningKey, {algorithms: 'RS256'}, function(tokenErr, decoded) {
                        if(tokenErr) return reject(tokenErr);
                        return resolve(decoded);
                    });
                } else {
                    jwt.decode(decryptedToken, jwtSigningKey, {algorithms: 'RS256'}, function(tokenErr, decoded) {
                        if(tokenErr) return reject(tokenErr);
                        return resolve(decoded);
                    });
                }
            });
        });
    }
}

var Password = {
    async hash(password) {
        return new Promise(function (resolve, reject) {
            bcrypt.genSalt(_.parseInt(process.env.SALT_FACTOR), function (error, salt) {
                if(error) return reject(error);

                bcrypt.hash(password, salt, function(err, hash) {
                    if (err) return reject(err);
                    return resolve(hash);
                });
            });
        });
    },
    async comparePassword(password, hash) {
        return new Promise(function(resolve, reject) {
            bcrypt.compare(password, hash, function(err, result) {
                if(err) return reject(err);
                return resolve(result);
            });
        });
    }
}

var Stripe = {
    instance() {
        return stripe;
    },
    async proceedToPaymentCheckout(plan_id, package_type) {
        try {
            let stripe_parameters = {
                payment_method_types: ['card'],
                line_items: [{
                    price: plan_id,
                    quantity: 1
                }],
                metadata: {
                    account_type: package_type
                },
                mode: 'subscription',
                success_url: `https://www.${process.env.SITE_DOMAIN}/signup/{CHECKOUT_SESSION_ID}`,
                cancel_url: `https://www.${process.env.SITE_DOMAIN}/`,
            };

            //Create a checkout session
            const session = await stripe.checkout.sessions.create(stripe_parameters);
            return session;
        } catch (err) {

        }

    },
    async handleStripeWebhookResponse(body, signature) {
        try {
            let event = await stripe.webhooks.constructEvent(body, signature, process.env.NODE_ENV === "development" ? process.env.STRIPE_TEST_WEBHOOK_SECRET : process.env.STRIPE_LIVE_WEBHOOK_SECRET);

            // Handle the checkout.session.completed event
            if (event.type === 'checkout.session.completed') {
                const session = event.data.object;

                console.log(session);

                let instance = await db.open();

                let result = await instance.collection("users").insertOne({
                    stripe_session_id: session.id,
                    stripe_customer_id: session.customer,
                    stripe_subscription_id: session.subscription,
                    activated: false
                });

                console.log(`Session created: ${session.id}, User created: ${result.insertedId}`);
            }

            return {success: true};

        } catch (err) {
            return {success: false, message: err};
        }

    }
}

var DBObject = {
    projectBasic(body) {
        return {
            name: body["name"],
            qualifiedName: Utilities.getQualifiedName(body["name"]),
            description: body.description,
            property_type: body.type,
            street_address: body.address,
            coordinates: {
                latitude: body.coordinates.latitude,
                longitude: body.coordinates.longitude
            },
            postcode: body.postcode,
            city: body.city,
            state: body.state,
            country: body.country,
            slider_photos: _.map(body.slider_photos, function(stringId) {return mongodb.ObjectId(stringId)}),
            photos: _.map(body.photos, function(stringId) {return mongodb.ObjectId(stringId)}),
            videos: _.map(body.videos, function(stringId) {return mongodb.ObjectId(stringId)}),
            documents: _.map(body.documents, function(stringId) {return mongodb.ObjectId(stringId)}),
            additional_info: body.additional_info
        }
    }
}

var Transactions = {
    async generateReport() {
        let instance = await db.open();
        let reports = await instance.collection("unit_reports").find({document_issued: false}).toArray();

        await Utilities.asyncForEach(reports, async function (report, index) {
            let reportObjects = report.reports;
            let project = await instance.collection("projects").findOne({_id: report.reference_id});

            if(reportObjects.length > 0) {
                let project_report = _.map(reportObjects, function (element) {
                    return {
                        message: element.message,
                        time: moment(element.timestamp).format("dd-mm-yyyy HH:mm [UTC]")
                    }
                });

                let document = await Utilities.processTemplate("templates/report", {
                    project_name: project.name,
                    project_report: project_report
                });

                let browser = await Puppeteer.launch();
                let page = await browser.newPage();
                await page.setContent(document);

                let pdfPath = path.resolve(__dirname, "..", "resources/reports", `${project.name}-${Date.now()}.pdf`);

                await page.pdf({path: pdfPath, format: "A4"});
                await browser.close();

                await instance.collection("unit_reports").updateOne({_id: report._id}, {
                    $set: {
                        path: pdfPath,
                        document_issued: true,
                        issued_at: Date.now()
                    }
                });

                let platform = await instance.collection("platform").findOne({user_id: report.recipient});

                if(platform && platform.platform_type === "company") {
                    await instance.collection("users").updateOne({_id: report.recipient}, {
                        $push: {
                            notifications: {
                                notification: `A report for ${project.name} has been generated for you. You may download it <a href="/cms/reports/download/${report._id.toString()}">here</a>.`,
                                createdAt: Date.now()
                            }
                        }
                    });
                }
            } else {
                await instance.collection("unit_reports").deleteOne({_id: report._id});
            }

            await instance.collection("unit_reports").insertOne({
                recipient: project.distributor,
                reference_id: project.reference_id,
                reports: [],
                document_issued: false,
                issued_at: null,
                created_at: Date.now()
            });
        });
    }
}
module.exports = {Utilities, Token, Password, Stripe, DBObject, Transactions};