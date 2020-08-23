var express = require("express");
var router = express.Router();
var middleware = require("../middleware");
var path = require("path");
var {Utilities} = require("../functions");

var multer = require("multer");

var storage = multer.diskStorage({
   destination: function (req, file, cb) {
      cb(null, path.resolve(__dirname, "../..", "resources/uploads"));
   },
   filename: function (req, file, cb) {
      let extension = file.mimetype.split("/")[1];
      cb(null, Date.now() + "." + extension) //Appending extension
   }
});

var upload = multer({ storage: storage });

var CMSController = require("../Controllers/CMSController");
var MediaController = require("../Controllers/MediaController");

router.use(middleware.authenticate);

router.use(function (req, res, next) {
   if (res.locals.user["cms_color"] !== "default") {

      Object.assign(res.locals, {
         extras: {
            textcss: `
               .main-color {
                   background: ${res.locals.user["cms_color"]} !important;
               }
               
               .action-btn {
                  color: ${res.locals.user["cms_color"]} !important;
                  border: 0.15rem solid ${res.locals.user["cms_color"]} !important;
               }
               
               .action-btn:hover {
                    background: ${res.locals.user["cms_color"]};
                    color: white !important;
                }
               
               .main-color-text, .main-color-text * {
                   color: ${res.locals.user["cms_color"]} !important;
               }
               
               .card-panel.create-listing-btn:hover {
                  background: ${res.locals.user["cms_color"]} !important;
               }
               
               .tabs .tab a:hover {
                   background: ${res.locals.user["cms_color"]} !important;
                   color: white !important;
               }
               
               .tabs .tab a.active {
                   background: ${res.locals.user["cms_color"]} !important;
                   color: white !important;
               }
               
               .tabs .indicator {
                   background: ${res.locals.user["cms_color"]} !important;
               } /*Color of underline*/
               
               .tabs .tab a:focus, .tabs .tab a:focus.active {
                   background: ${res.locals.user["cms_color"]} !important;
                   color: white !important;
               }
               
               .noUi-handle, .noUi-connect {
                   background: ${res.locals.user["cms_color"]} !important;
               }
           `
         }
      });
   }

   return next();
});

router.get("/listings", CMSController.getListings);
router.get("/listings/create/single-listing", CMSController.getListingsCreateSingle);
router.get("/listings/create/info-listing", CMSController.getListingsCreateInfo);
router.get("/listings/create/detailed-listing", CMSController.getListingsCreateDetailed);
router.post("/listings/create-single", CMSController.postListingsCreateSingle);
router.post("/listings/create-info", CMSController.postListingsCreateInfo);
router.post("/listings/create-detailed", CMSController.postListingsCreateDetailed);

router.get("/listings/edit/:projectId", CMSController.getListingsEditProject);
router.post("/listings/edit-project", CMSController.postListingsEditProject);

router.get("/listings/delete/:projectId", CMSController.getListingsDeleteProject);

router.get("/listings/modify/:projectId/tower/:towerCount", CMSController.getListingsModifyTower);
router.post("/listings/edit-tower", CMSController.postListingsModifyTower);
router.post("/listings/delete-tower", CMSController.postListingsDeleteTower);

router.get("/listings/modify/:projectId/tower/:towerCount/floors", CMSController.getListingsModifyFloors);
router.post("/listings/edit-floors", CMSController.postListingsModifyFloors);

router.get("/listings/modify/:projectId/tower/:towerCount/floors/:floorCount", CMSController.getListingsModifyUnits);
router.post("/listings/edit-units", CMSController.postListingsModifyUnits);

router.post("/listings/assign-to-agent", express.json(), CMSController.postListingsAssignAgent);
router.post("/listings/unassign-agent", express.json(), CMSController.postListingsUnassignAgent);

router.get("/listings/assigned-agents/:projectId", CMSController.getListingsAssignedAgents);

router.get("/listings/modify/tower-list/:projectId", CMSController.getListingsTowerList);

router.get("/listings/get-unit-type-data/:projectId/:unitName", CMSController.getUnitTypeInfo);

router.get("/listings/confirm-unit-change-action/:projectId", CMSController.getListingsConfirmUnitChangeAction);
router.post("/listings/change-unit-status", CMSController.postListingsChangeUnitStatus);

router.get("/user-settings", CMSController.getUserSettings);
router.get("/user-settings/edit-user-settings", CMSController.getUserSettingsEditInfo);
router.get("/user-settings/edit-user-password", CMSController.getUserSettingsEditPassword);
router.post("/user-settings/user-edit-info", upload.single("avatar"), CMSController.postUserSettingsEditInfo);
router.post("/user-settings/user-edit-password", CMSController.postUserSettingsEditPassword);

router.get("/edit-platform", CMSController.getPlatformEdit);
router.post("/edit-platform", CMSController.postPlatformEdit);

router.get("/appointments", CMSController.getAppointments);
router.get("/appointments/create", CMSController.getAppointmentsCreate);
router.get("/appointments/edit/:id", CMSController.getAppointmentsEdit);
router.post("/appointments/create", CMSController.postAppointmentsCreate);
router.post("/appointments/edit", CMSController.postAppointmentsEdit);
router.post("/appointments/delete", CMSController.postAppointmentsDelete);

router.get("/leads", CMSController.getLeads);
router.post("/leads/mark-as-read", express.json() ,CMSController.postLeadsMarkAsRead);

router.get("/gallery/modal-select", CMSController.getMediaInModal);
router.get("/gallery/get-categories", CMSController.getMediaCategories);

router.get("/media/:mediaId", MediaController.getMedia);
router.get("/video/:videoId", MediaController.getVideoStream);

router.post("/media/delete", express.json(), MediaController.postDeleteMedia);
router.post("/media/upload", upload.single('file'), MediaController.postMedia);
router.post("/media/express-upload", upload.array('files'), MediaController.expressPostMedia);

router.get("/logout", async function (req, res) {
   return res.clearCookie("authorized").render("cms/logout", {layout: "cms", data: {
      pageTitle: "Logging you out..."
   }});
});

module.exports = router;