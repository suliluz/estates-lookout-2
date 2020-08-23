var cron = require("cron").CronJob;
var {Transactions} = require("./functions");

var daytime_report = new cron("0 9 * * *", async function () {
    await Transactions.generateReport();
}, null, true, 'Asia/Kuching');

var nightly_report = new cron("0 21 * * *", async function () {
    await Transactions.generateReport();
}, null, true, 'Asia/Kuching');

daytime_report.start();
nightly_report.start();

