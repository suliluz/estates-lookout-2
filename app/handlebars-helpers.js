var Handlebars = require("handlebars");
var moment = require("moment");
var _ = require("lodash");

module.exports = {
    toString(value) {
        return value.toString();
    },
    count(array) {
        return array.length;
    },
    concat(value1, value2) {
        return new Handlebars.SafeString(`${value1} ${value2}`);
    },
    array() {
        let object = [];

        for(var i = 0; i < arguments.length - 1; ++i) {
            object.push(arguments[i]);
        }

        return object;
    },
    inverseEach(value) {
        if(!value || value.length === 0) {
            return options.inverse(this);
        }

        let data;

        if (options.data) {
            data = Handlebars.createFrame(options.data);
        }

        let result = [];

        for(let i = 0; i < value.length; ++i) {
            if (data) {
                data.index = i;
            }
            result.push(options.fn(value[i], {data: data}));
        }

        return result.reverse().join('');
    },
    and (value1, value2) {
        return value1 && value2;
    },
    add(value1, value2) {
        return value1 + value2;
    },
    subtract(value1, value2) {
        value1 = parseInt(value1);
        value2 = parseInt(value2);
        return value1 - value2;
    },
    equals(value1, value2) {
        return value1 == value2;
    },
    not(value) {
        return !value;
    },
    times(value, block) {
        let accum = '';
        for(let i = 0; i < value; ++i) accum += block.fn(i);
        return accum;
    },
    strToNumber(str) {
        return parseInt(str);
    },
    capitalize(value) {
        return value.toUpperCase();
    },
    inverseTimes(value, block) {
        let accum = '';
        for(let i = value; i > 0; --i) accum += block.fn(i);
        return accum;
    },
    isRange(variable) {
        return _.isObject(variable) && _.has(variable, ["min", "max"]);
    },
    makeRangeOrSingle(min, max) {
        if(min === max) {
            return min;
        } else {
            return `${min} - ${max}`;
        }
    },
    tinymceApiKey() {
        return process.env.TINYMCE_API_KEY;
    },
    encrypt(string) {
        let ciphers = {
            key: Buffer.from(process.env.CRYPTO_HEX_KEY, "hex"),
            iv: Buffer.from(process.env.CRYPTO_HEX_IV, "hex")
        };
        let cipher = crypto.createCipheriv('aes-256-cbc', ciphers.key, ciphers.iv);
        let encryptedToken = cipher.update(string);
        encryptedToken = Buffer.concat([encryptedToken, cipher.final()]);
        return encryptedToken.toString("hex");
    },
    root_url(value) {
        let httpMode = process.env.REQUIRES_HTTPS ? "https" : "http";
        return `${httpMode}://www.${process.env.SITE_DOMAIN}/${value}`;
    },
    stripePublishableKey() {
        return process.env.NODE_ENV === "production" ? process.env.STRIPE_LIVE_PUBLISHABLE_KEY : process.env.STRIPE_TEST_PUBLISHABLE_KEY;
    },
    moment_date(timestamp) {
        return moment(timestamp).format("dddd, DD MMMM YYYY");
    },
    moment_time(timestamp) {
        return moment(timestamp).format("HH:mm");
    },
    moment_format(timestamp, format) {
        return moment(timestamp).format(format);
    },
    moment_duration(timestamp1, timestamp2) {
        let time1 = moment(timestamp1);
        let time2 = moment(timestamp2);

        let duration = moment.duration(time2.diff(time1));

        return duration.humanize(true);
    },
    googleMapApiKey() {
        return process.env.GOOGLE_MAP_API_KEY;
    }
}