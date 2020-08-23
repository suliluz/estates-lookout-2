const express = require("express");
const middleware = require("../middleware");
const router = express.Router();

router.use(middleware.searchAndDumpPlatform);
router.use(middleware.checkPlatformVisibility);

router.use(function (req, res, next) {
    if(res.locals.platform["theme_color"] !== "default") {
        Object.assign(res.locals, {extras: {
            textcss: `
            .main-color {
                background: ${res.locals.platform["theme_color"]} !important;
            }
            
            .main-color-text, .main-color-text * {
                color: ${res.locals.platform["theme_color"]} !important;
            }
            
            .tabs .tab a{
                background: ${res.locals.platform["theme_color"]}!important;
            } 
            
            .tabs .tab a:hover {
                background: ${res.locals.platform["theme_color"]} !important;
            }
            
            .tabs .tab a.active {
                background: ${res.locals.platform["theme_color"]} !important;
            }
            
            .tabs .indicator {
                background: ${res.locals.platform["theme_color"]} !important;
            } /*Color of underline*/
            
            .tabs .tab a:focus, .tabs .tab a:focus.active {
                background: ${res.locals.platform["theme_color"]} !important;
            }
            
            .noUi-handle, .noUi-connect {
                background: ${res.locals.platform["theme_color"]} !important;
            }
            
            .dropdown-content li > a, .dropdown-content li > span {
                color: ${res.locals.platform["theme_color"]} !important;
            }
            
            .noUi-handle, .noUi-connect {
                background: ${res.locals.platform["theme_color"]} !important;
            }
            input:not([type]):focus:not([readonly]),
            input[type=text]:not(.browser-default):focus:not([readonly]),
            input[type=password]:not(.browser-default):focus:not([readonly]),
            input[type=email]:not(.browser-default):focus:not([readonly]),
            input[type=url]:not(.browser-default):focus:not([readonly]),
            input[type=time]:not(.browser-default):focus:not([readonly]),
            input[type=date]:not(.browser-default):focus:not([readonly]),
            input[type=datetime]:not(.browser-default):focus:not([readonly]),
            input[type=datetime-local]:not(.browser-default):focus:not([readonly]),
            input[type=tel]:not(.browser-default):focus:not([readonly]),
            input[type=number]:not(.browser-default):focus:not([readonly]),
            input[type=search]:not(.browser-default):focus:not([readonly]),
            textarea.materialize-textarea:focus:not([readonly]) {
                 border-bottom:1px solid ${res.locals.platform["theme_color"]};
                 -webkit-box-shadow:0 1px 0 0 ${res.locals.platform["theme_color"]};
                 box-shadow:0 1px 0 0 ${res.locals.platform["theme_color"]};
            }
            
            `
        }});
    }

    return next();
});

const AgentLandingController = require("../Controllers/AgentLandingController");
const MediaController = require("../Controllers/MediaController");

// GET Routes
router.get("/", AgentLandingController.getIndex);
router.get("/view-property/:qualifiedName", AgentLandingController.getPropertyView);
router.get("/view-property/:qualifiedName/unit-preview", AgentLandingController.getUnitView);
router.get("/search", AgentLandingController.getPropertySearch);
router.post("/send-lead", AgentLandingController.postLead);

router.get("/video/:videoId", MediaController.getVideoStream);
router.get("/media/:mediaId", MediaController.getMedia);
router.get("/media/download/:mediaId", MediaController.getMediaDownload);

module.exports = router;