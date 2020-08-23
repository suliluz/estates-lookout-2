var express = require("express");
var router = express.Router();
var bodyParser = require("body-parser");
var path = require("path");

var RootController = require("../Controllers/RootController");

router.use("/cms", require(path.resolve(__dirname, "cms")));

// GET routes
router.get("/", RootController.getIndex);
router.get("/login", RootController.getLogin);
router.get("/signup/:sessionId", RootController.getSignup);
router.get("/checkout/:productType", RootController.getRedirectToCheckout);

router.get("/404", RootController.get404);

// POST routes
router.post("/login", RootController.postLogin);
router.post("/register", RootController.postSignup);

router.post("/wh", bodyParser.raw({type: 'application/json'}), RootController.postStripeWebhook);

module.exports = router;