require("dotenv").config();

const path = require('path');
const express = require("express");
const expressHandlebars = require("express-handlebars");
const handlebarsHelpers = require("./app/handlebars-helpers");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const mongodb = require("./app/mongodb-config");
const middleware = require("./app/middleware");
const cron = require("./app/cronjob");

var app = express();
var mode = process.env.NODE_ENV;

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

app.use(function(req, res, next) {
   let real_ip = req.headers["x-forwarded-for"];
   req.remoteIPAddress = real_ip;
   res.setHeader("Access-Control-Allow-Origin", `www.${process.env.SITE_DOMAIN}`);
   return next();
});

app.use(express.static(path.resolve(__dirname, "resources/static")));

app.set("env", mode);
app.set("trust proxy", true);
app.set("x-powered-by", false);
app.set("subdomain offset", 1);

app.set('root_path', __dirname);
app.set('upload_path', path.resolve(__dirname, "resources/uploads"));

app.set("views", path.resolve(__dirname, "resources/views"));

app.engine("hbs", expressHandlebars({extname: ".hbs", helpers: handlebarsHelpers}));
app.set("view engine", "hbs");

var estateslookout_landing = require("./app/Routes/estateslookout");
var agent_landing = require("./app/Routes/agent-landing");

app.use(middleware.subdomainNot("www", agent_landing, estateslookout_landing));

app.listen(process.env.PORT, function() {
    console.log(`Connected to port ${process.env.PORT}`);
});

