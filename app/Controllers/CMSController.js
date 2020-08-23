var moment = require("moment");
var db = require("../mongodb-config");
var mongodb = require("mongodb");
var {DBObject, Utilities, Password, Token} = require("../functions");
var _ = require("lodash");

module.exports = {
    getListings: async function (req, res) {
        let instance = await db.open();

        let controlledProjects = await instance.collection("projects").find({
            representative_platform: mongodb.ObjectId(res.locals.user["platform"])
        }).toArray();

        await Utilities.asyncForEach(controlledProjects, async function(project, index) {
            let distributor = await instance.collection("users").findOne({_id: project.distributor});
            controlledProjects[index]["distributor"] = distributor;

            if(distributor._id.toString() === res.locals.user["id"]) {
                controlledProjects[index] = Object.assign(controlledProjects[index], {modifyPermissions: true});

                if(res.locals.user["platform_type"] === "company") {
                    controlledProjects[index] = Object.assign(controlledProjects[index], {extendedAssignable: true});
                }
            }
        });

        console.log(controlledProjects);

        return res.render("cms/listings", {layout: "cms", data: {
            pageTitle: "Create & Assign Listings",
            pageIndex: 0,
            projects: controlledProjects
        }});
    },
    getAppointments: async function (req, res) {
        try {
            let instance = await db.open();

            let appointments = await instance.collection("appointments").find({
                user_id: mongodb.ObjectId(res.locals.user["id"])
            }).toArray();

            return res.render("cms/appointments", {layout: "cms", data: {
                pageTitle: "Appointments",
                pageIndex: 1,
                appointments: appointments
            }});
        } catch (err) {
            console.log(err);
            return res.status(500).json({status: 500, message: "Error has occurred."});
        }
    },
    getAppointmentsCreate: async function (req, res) {
        return res.render("cms/appointments-create", {layout: "cms", data: {
            pageTitle: "Create Appointment",
            pageIndex: 1
        }});
    },
    getAppointmentsEdit: async function (req, res) {
        try {
            let appointment_id = req.params.id;
            let instance = await db.open();
            let appointment = await instance.collection("appointments").findOne({
                _id: mongodb.ObjectId(appointment_id),
                user_id: mongodb.ObjectId(res.locals.user["id"])
            });

            return res.render("cms/appointments-edit", {layout: "cms", data: {
                pageTitle: "Edit Appointment",
                pageIndex: 1,
                appointment: appointment
            }});
        } catch (err) {
            console.log(err);
            return res.status(500).json({status: 500, message: "An error has occurred."});
        }
    },
    postAppointmentsCreate: async function (req, res) {
        try {
            let body = req.body;

            let date = moment(body.date, "MMM DD, YYYY").valueOf();

            let start_time = moment(`${body.date} ${body.start_time}`, "MMM DD, YYYY hh:mm A").valueOf();
            let end_time = moment(`${body.date} ${body.end_time}`, "MMM DD, YYYY hh:mm A").valueOf();

            let instance = await db.open();

            await instance.collection("appointments").insertOne({
                title: body.title,
                date: date,
                start_time: start_time,
                end_time: end_time,
                appointment_for: body.appointment_for,
                details: body.details,
                user_id: mongodb.ObjectId(res.locals.user["id"])
            });

            return res.redirect("/cms/appointments");

        } catch (err) {
            console.log(err);
            return res.status(500).send({status: 500, message: "An error has occurred."});
        }
    },
    postAppointmentsEdit: async function (req, res) {
        try {
            let body = req.body;

            let date = moment(body.date, "MMM DD, YYYY").valueOf();

            let start_time = moment(`${body.date} ${body.start_time}`, "MMM DD, YYYY hh:mm A").valueOf();
            let end_time = moment(`${body.date} ${body.end_time}`, "MMM DD, YYYY hh:mm A").valueOf();

            let instance = await db.open();

            await instance.collection("appointments").updateOne({_id: mongodb.ObjectId(body.appointmentId), user_id: mongodb.ObjectId(res.locals.user["id"])}, {
                $set: {
                    title: body.title,
                    date: date,
                    start_time: start_time,
                    end_time: end_time,
                    appointment_for: body.appointment_for,
                    details: body.details
                }
            });

            return res.redirect("/cms/appointments");
        } catch (err) {
            console.log(err);
            return res.status(500).send({status: 500, message: "An error has occurred."});
        }
    },
    postAppointmentsDelete: async function (req, res) {
        try {
            let body = req.body;
            let instance = await db.open();

            await instance.collection("appointments").deleteOne({_id: mongodb.ObjectId(body.appointmentId), user_id: mongodb.ObjectId(res.locals.user["id"])});

            res.redirect("/cms/appointments");
        } catch (err) {
            console.log(err);
            return res.status(500).send({status: 500, message: "An error has occurred."});
        }
    },
    getLeads: async function (req, res) {
        try {
            let instance = await db.open();
            let leads = await instance.collection("leads").find({platform: mongodb.ObjectId(res.locals.user["platform"])}).toArray();

            return res.render("cms/leads", {layout: "cms", data: {
                pageTitle: "Leads",
                pageIndex: 2,
                leads: leads
            }});
        } catch (err) {
            console.log(err);
            return res.status(500).send({status: 500, message: "An error has occurred."});
        }
    },
    postLeadsMarkAsRead: async function (req, res) {
        try {
            let body = req.body;

            console.log(body);

            let instance = await db.open();

            await instance.collection("leads").updateOne({_id: mongodb.ObjectId(body.leadId), platform: mongodb.ObjectId(res.locals.user["platform"])}, {
                $set: {read: true}
            });

            return res.json({success: true});
        } catch (err) {
            console.log(err);
            return res.status(500).json({status: 500, message: "An error has occurred."});
        }
    },
    getListingsCreateSingle: async function(req, res) {
        try {
            return res.render("cms/listings-create-single", {layout: "cms", data: {
                pageTitle: "Create Single Property Listing",
                pageIndex: 0
            }});
        } catch (err) {
            console.log(err);
            return res.status(500).json({status: 500, message: "An error has occurred."});
        }
    },
    getListingsCreateInfo: async function(req, res) {
        try {
            return res.render("cms/listings-create-info", {layout: "cms", data: {
                pageTitle: "Create Info Property Listing",
                pageIndex: 0
            }});
        } catch (err) {
            console.log(err);
            return res.status(500).json({status: 500, message: "An error has occurred."});
        }
    },
    getListingsCreateDetailed: async function(req, res) {
        try {
            return res.render("cms/listings-create-detailed", {layout: "cms", data: {
                pageTitle: "Create Detailed Property Listing",
                pageIndex: 0
            }});
        } catch (err) {
            console.log(err);
            return res.status(500).json({status: 500, message: "An error has occurred."});
        }
    },
    postListingsCreateSingle: async function(req, res) {
        try {
            let body = req.body;
            let platformBasic = DBObject.projectBasic(body);

            let _id = new mongodb.ObjectId();

            let platformObject = Object.assign(platformBasic, {
                _id: _id,
                creation_type: "single-property",
                distributor: mongodb.ObjectId(res.locals.user["id"]),
                representative_platform: mongodb.ObjectId(res.locals.user["platform"]),
                managing_for: body["managing_for"],
                metadata: {
                    bedrooms: Utilities.getSingleRange(body["bedrooms"]),
                    bathrooms: Utilities.getSingleRange(body["bathrooms"]),
                    parkings: Utilities.getSingleRange(body["parkings"]),
                    sqft: Utilities.getSingleRange(body["sqft"]),
                    price: body["price"],
                    status: Utilities.getSingleRange(body["status"]),
                    total: 1
                },
                reference_id: _id
            });

            let instance = await db.open();
            await instance.collection("projects").insertOne(platformObject);

            return res.redirect("/cms/listings");
        } catch (err) {
            console.log(err);
            return res.status(500).json({status: 500, message: "An error has occurred."});
        }
    },
    postListingsCreateInfo: async function (req, res) {
        try {
            let body = req.body;
            let platformBasic = DBObject.projectBasic(body);

            let _id = new mongodb.ObjectId();

            let platformObject = Object.assign(platformBasic, {
                _id: _id,
                creation_type: "info",
                distributor: mongodb.ObjectId(res.locals.user["id"]),
                representative_platform: mongodb.ObjectId(res.locals.user["platform"]),
                managing_for: body["managing_for"],
                metadata: {
                    bedrooms: Utilities.getRange(body["unit_type"], "bedrooms"),
                    bathrooms: Utilities.getRange(body["unit_type"], "bathrooms"),
                    parkings: Utilities.getRange(body["unit_type"], "parkings"),
                    sqft: Utilities.getRange(body["unit_type"], "sqft"),
                    unit_type: body["unit_type"],
                    tower_count: body.tower_count,
                    units_count: body.units_count,
                    reference_id: _id
            }});

            let instance = await db.open();
            await instance.collection("projects").insertOne(platformObject);

            return res.redirect("/cms/listings");
        } catch (err) {
            console.log(err);
            return res.status(500).json({status: 500, message: "An error has occurred."});
        }
    },
    postListingsCreateDetailed: async function (req, res) {
        try {
            let body = req.body;
            let platformBasic = DBObject.projectBasic(body);

            let _id = new mongodb.ObjectId();

            let platformObject = Object.assign(platformBasic, {
                _id: _id,
                creation_type: "detailed-creation",
                distributor: mongodb.ObjectId(res.locals.user["id"]),
                representative_platform: mongodb.ObjectId(res.locals.user["platform"]),
                managing_for: body["managing_for"],
                towers: [],
                metadata: {
                    unit_type: body["unit_type"],
                    price: body["price"]
                },
                reference_id: _id
            });

            let instance = await db.open();
            let project = await instance.collection("projects").insertOne(platformObject);

            if(body["submit"] === "save") {
                return res.redirect("/cms/listings");
            } else {
                let projectId = project.insertedId.toString();
                return res.redirect(`/cms/listings/modify/${projectId}/tower/0`);
            }
        } catch (err) {
            console.log(err);
            return res.status(500).json({status: 500, message: "An error has occurred."});
        }
    },
    getListingsEditProject: async function (req, res) {
        try {
            let projectId = req.params["projectId"];
            let instance = await db.open();

            let project = await instance.collection("projects").findOne({distributor: mongodb.ObjectId(res.locals.user["id"]), reference_id: mongodb.ObjectId(projectId)});

            if(!project) return res.redirect("/cms/listings");

            switch(project["creation_type"]) {
                case "single-property":
                    return res.render("cms/listings-create-single", {layout: "cms", data: {
                        pageTitle: "Edit Single Property Listing",
                        pageIndex: 0,
                        project: project
                    }});
                case "info":
                    return res.render("cms/listings-create-info", {layout: "cms", data: {
                        pageTitle: "Edit Info Property Listing",
                        pageIndex: 0,
                        project: project
                    }});
                case "detailed-creation":
                    return res.render("cms/listings-create-detailed", {layout: "cms", data: {
                        pageTitle: "Edit Detailed Property Listing",
                        pageIndex: 0,
                        project: project
                    }});
                default:
                    return res.redirect("/cms/listings");
            }
        } catch (err) {
            console.log(err);
            return res.status(500).json({status: 500, message: "An error has occurred."});
        }
    },
    postListingsEditProject: async function (req, res) {
        try {
            let body = req.body;
            let project_id = body.projectId;
            let instance = await db.open();

            let platformBasic = DBObject.projectBasic(body);
            let platformObject;

            if(body["createType"] === "single-property") {
                platformObject = Object.assign(platformBasic, {
                    managing_for: body["managing_for"],
                    metadata: {
                        bedrooms: Utilities.getSingleRange(body["bedrooms"]),
                        bathrooms: Utilities.getSingleRange(body["bathrooms"]),
                        parkings: Utilities.getSingleRange(body["parkings"]),
                        sqft: Utilities.getSingleRange(body["sqft"]),
                        price: body["price"],
                        status: Utilities.getSingleRange(body["status"]),
                        total: 1
                    }
                });
            } else {
                let bathrooms = Utilities.getRange(body["unit_type"], "bathrooms");
                let bedrooms = Utilities.getRange(body["unit_type"], "bedrooms");
                let parkings = Utilities.getRange(body["unit_type"], "parkings");
                let sqft = Utilities.getRange(body["unit_type"], "sqft", true);

                platformObject = Object.assign(platformBasic, {
                    managing_for: body["managing_for"],
                    metadata: {
                        unit_type: body["unit_type"],
                        bathrooms: bathrooms,
                        bedrooms: bedrooms,
                        parkings: parkings,
                        sqft: sqft,
                        price: body["price"]
                    },
                });
            }

            // Check if authorized to do so
            await instance.collection("projects").updateMany({reference_id: mongodb.ObjectId(project_id), distributor: mongodb.ObjectId(res.locals.user["id"])}, {
                $set: platformObject
            });

            if(body["createType"] === "detailed-creation") {
                if(body["submit"] === "save") {
                    return res.redirect("/cms/listings");
                } else {
                    return res.redirect(`/cms/listings/modify/${project_id}/tower/0`);
                }
            } else {
                return res.redirect("/cms/listings");
            }
        } catch (err) {
            console.log(err);
            return res.status(500).json({status: 500, message: "An error has occurred."});
        }
    },
    getListingsDeleteProject: async function (req, res) {
        try {
            let projectId = req.params.projectId;
            let instance = await db.open();

            await instance.collection("projects").findOneAndDelete({_id: mongodb.ObjectId(projectId)});

            return res.redirect("/cms/listings");
        } catch (err) {
            console.log(err);
            return res.status(500).json({status: 500, message: "An error has occurred."});
        }
    },
    postListingsChangeSingleListingState: async function (req, res) {
        try {
            let body = req.body;
            let projectId = body.projectId;

            let instance = await db.open();

            await instance.collection("projects").findOneAndUpdate({_id: mongodb.ObjectId(projectId)}, {
                $set: {
                    "metadata.status": body.status
                }
            });

            return res.redirect("/cms/listings");
        } catch (err) {
            console.log(err);
            return res.status(500).json({status: 500, message: "An error has occurred."});
        }
    },
    getListingsModifyTower: async function (req, res) {
        try {
            let projectId = req.params.projectId;
            let tower_number = req.params.towerCount;

            let instance = await db.open();
            let project = await instance.collection("projects").findOne({reference_id: mongodb.ObjectId(projectId), distributor: mongodb.ObjectId(res.locals.user["id"])});

            if(!project && project["creation_type"] !== "detailed_creation") return res.redirect("/cms/listings");

            if(tower_number > project["towers"].length) return res.redirect(`/cms/listings/modify/${projectId}/tower/${project["towers"].length}`);

            res.render("cms/listings-towers-edit", {layout: "cms", data: {
                pageTitle: "Edit Towers",
                pageIndex: 0,
                project: project,
                tower: project["towers"][tower_number],
                towerIndex: tower_number
            }});

        } catch (err) {
            console.log(err);
            return res.status(500).json({status: 500, message: "An error has occurred."});
        }
    },
    postListingsModifyTower: async function (req, res) {
        try {
            let body = req.body;

            let project_id = req.body.projectId;
            let tower_index = req.body.towerIndex;

            let instance = await db.open();
            let project = await instance.collection("projects").findOne({reference_id: mongodb.ObjectId(project_id), distributor: mongodb.ObjectId(res.locals.user["id"])});

            if(!project && project["creation_type"] !== "detailed-creation") return res.redirect("/cms/listings");

            let towers = project["towers"];

            if(tower_index > towers.length) return res.redirect("back");

            if(typeof towers[tower_index] === "undefined") {
                let floors = [];

                for(let i = 0; i < body.tower.floor_count; ++i) {
                    floors.push({
                       floor_name: null,
                       units_count: null,
                       units: null
                    });
                }

                towers.push({
                    tower_name: body.tower.name,
                    floor_count: body.tower.floor_count,
                    floors: floors
                });
            } else {
                towers[tower_index].tower_name = body.tower.name;
                towers[tower_index].floor_count = body.tower.floor_count;
            }

            await instance.collection("projects").updateMany({reference_id: mongodb.ObjectId(project_id), distributor: mongodb.ObjectId(res.locals.user["id"])}, {
                $set: {
                   towers: towers
                }
            });

            if(body["submit"] === "save") {
                return res.redirect("/cms/listings");
            } else {
                return res.redirect(`/cms/listings/modify/${project_id}/tower/${tower_index}/floors`);
            }
        } catch (err) {
            console.log(err);
            return res.status(500).json({status: 500, message: "An error has occurred."});
        }
    },
    postListingsDeleteTower: async function (req, res) {
        try {
            let body = req.body;
            let instance = await db.open();
            let project = await instance.collection("projects").findOne({_id: mongodb.ObjectId(body.projectId)});
            let towerIndexMarkedForDeletion = body.towerIndex;
            let towers = project["towers"];

            if(typeof towers[towerIndexMarkedForDeletion] === "undefined") {
                return res.redirect(`/cms/listings/modify/${body.projectId}/tower/${project["towers"].length - 1}`);
            }

            towers.splice(towerIndexMarkedForDeletion, 1);

            await instance.collection("projects").updateMany({reference_id: mongodb.ObjectId(body.projectId), distributor: mongodb.ObjectId(res.locals.user["id"])}, {
                $set: {
                    towers: towers
                }
            });

            if(towers.length > 0) {
                return res.redirect(`/cms/listings/modify/${body.projectId}/tower/${project["towers"].length - 1}`);
            } else {
                return res.redirect(`/cms/listings/modify/${body.projectId}/tower/0`);
            }
        } catch (err) {
            console.log(err);
            return res.status(500).json({status: 500, message: "An error has occurred."});
        }
    },
    getListingsModifyFloors: async function (req, res) {
        try {
            let projectId = req.params.projectId;
            let tower_number = req.params.towerCount;
            let instance = await db.open();
            let project = await instance.collection("projects").findOne({reference_id: mongodb.ObjectId(projectId), distributor: mongodb.ObjectId(res.locals.user["id"])});

            if(!project && project["creation_type"] !== "detailed_creation") return res.redirect("/cms/listings");

            if(project["towers"] && project["towers"].length > 0 && typeof project["towers"][tower_number] === "undefined") return res.redirect(`/cms/listings/modify/${projectId}/tower/${project["towers"].length - 1}/floors`);

            let tower = project["towers"][tower_number];
            let floors = tower["floors"];

            return res.render("cms/listings-floors-edit", {layout: "cms", data: {
                pageTitle: `Edit ${tower.tower_name} Floors`,
                pageIndex: 0,
                project: project,
                tower: tower,
                towerIndex: tower_number,
                floors: floors,
                floorCount: floors.length
            }});
        } catch (err) {
            console.log(err);
            return res.status(500).json({status: 500, message: "An error has occurred."});
        }
    },
    postListingsModifyFloors: async function (req, res) {
        try {
            let body = req.body;

            let project_id = req.body.projectId;
            let tower_index = req.body.towerIndex;
            let instance = await db.open();

            let project = await instance.collection("projects").findOne({
                reference_id: mongodb.ObjectId(project_id),
                distributor: mongodb.ObjectId(res.locals.user["id"])
            });

            if (!project && project["creation_type"] !== "detailed-creation") return res.redirect("/cms/listings");

            let towers = project["towers"];

            if (tower_index > towers.length) return res.redirect("back");

            let floors = project["towers"][tower_index]["floors"];

            body["floor"].forEach(function (element, index) {
                floors[index].floor_name = element.floor_name;
                floors[index].units_count = element.units_count;

            });

            await instance.collection("projects").updateMany({
                reference_id: mongodb.ObjectId(project_id),
                distributor: mongodb.ObjectId(res.locals.user["id"])
            }, {
                $set: {[`towers.${tower_index}.floors`]: floors}
            });

            if (body["submit"] === "save") {
                return res.redirect("/cms/listings");
            } else {
                return res.redirect(`/cms/listings/modify/${project_id}/tower/${tower_index}/floors/0`);
            }
        } catch (err) {
            console.log(err);
            return res.status(500).json({status: 500, message: "An error has occurred."});
        }
    },
    getListingsModifyUnits: async function (req, res) {
        try {
            let project_id = req.params.projectId;
            let tower_number = req.params.towerCount;
            let floor_number = req.params.floorCount;
            let instance = await db.open();

            let project = await instance.collection("projects").findOne({distributor: mongodb.ObjectId(res.locals.user["id"]), reference_id: mongodb.ObjectId(project_id)});

            if(!project && project["creation_type"] !== "detailed_creation") return res.redirect("/cms/listings");

            if(tower_number > project["towers"].length) return res.redirect(`/cms/listings/modify/${project_id}/tower/${project["towers"].length}`);
            if(floor_number > project["towers"][tower_number]["floors"][floor_number].length) return res.redirect(`/cms/listings/modify/${project_id}/tower/${project["towers"].length}/floors/${project["towers"][tower_number]["floors"][floor_number].length - 1}`);

            let tower = project["towers"][tower_number];
            let floor = tower["floors"][floor_number];
            let units = floor["units"];

            tower["floors"].forEach((floor, index) => {
                if(parseInt(floor_number) === index) tower["floors"][index] = Object.assign(tower["floors"][index], {floorIndex: index});
            });

            let unit_type_names =  _.map(project.metadata.unit_type, "name");

            let unit_type_object = {};

            unit_type_names.forEach(function (e) {
                Object.assign(unit_type_object, {[e]: null});
            });

            console.log(units);

            return res.render("cms/listings-units-edit", {layout: "cms", data: {
                pageTitle: `Edit ${tower.tower_name} Units on Floor ${floor.floor_name ? floor.floor_name : parseInt(floor_number) + 1}`,
                pageIndex: 0,
                project: project,
                tower: tower,
                towerIndex: tower_number,
                floor: floor,
                floorIndex: floor_number,
                units: units,
                unit_type: JSON.stringify(unit_type_object)
            }});
        } catch (err) {
            console.log(err);
            return res.status(500).json({status: 500, message: "An error has occurred."});
        }
    },
    postListingsModifyUnits: async function (req, res) {
        try {
            let body = req.body;

            let project_id = req.body.projectId;
            let tower_index = req.body.towerIndex;
            let floor_index = req.body.floorIndex;

            let instance = await db.open();

            let project = await instance.collection("projects").findOne({reference_id: mongodb.ObjectId(project_id), distributor: mongodb.ObjectId(res.locals.user["id"])});

            if (!project && project["creation_type"] !== "detailed-creation") return res.redirect("/cms/listings");

            let towers = project["towers"];

            if (tower_index > towers.length) return res.redirect("back");

            let unit_count = 0;

            towers.forEach((tower) => {
                tower["floors"].forEach((floor) => {
                    unit_count += floor.units_count;
                });
            });

            await instance.collection("projects").updateMany({
                reference_id: mongodb.ObjectId(project_id),
                distributor: mongodb.ObjectId(res.locals.user["id"])
            }, {
                $set: {
                    [`towers.${tower_index}.floors.${floor_index}.units`]: req.body.unit,
                    "metadata.total": unit_count
                }
            });

            return res.redirect("/cms/listings");
        } catch (err) {
            console.log(err);
            return res.status(500).json({status: 500, message: "An error has occurred."});
        }
    },
    getUnitTypeInfo: async function (req, res) {
        try {
            let projectId = req.params.projectId;
            let unitTypeName = req.params.unitName;

            let instance = await db.open();
            let project = await instance.collection("projects").findOne({_id: mongodb.ObjectId(projectId)});

            let project_unit_type = project.metadata.unit_type;

            let unit_type = _.find(project_unit_type, function (e) {
                return e.name === unitTypeName;
            });

            return res.json({
                success: true,
                unit_type_data: unit_type
            });
        } catch (err) {
            console.log(err);
            return res.json({
               success: false,
               message: "An error has occurred."
            });
        }
    },
    postListingsAssignAgent: async function (req, res) {
        try {
            let body = req.body;
            let project_id = body.projectId;
            let fqdn = body.fqdn;
            let qualifiedName = fqdn.split(".")[0];

            console.log(qualifiedName);

            let instance = await db.open();

            let project = await instance.collection("projects").findOne({distributor: mongodb.ObjectId(res.locals.user["id"]), reference_id: mongodb.ObjectId(project_id)});
            delete project._id;
            delete project.representative_platform;

            let platform = await instance.collection("platforms").findOne({qualifiedName: qualifiedName});

            console.log(platform);

            project = Object.assign(project, {
               representative_platform: platform._id
            });


            await instance.collection("projects").insertOne(project);

            return res.redirect("/cms/listings");
        } catch (err) {
            console.log(err);
            return res.redirect("/cms/listings");
        }
    },
    postListingsUnassignAgent: async function (req, res) {
        try {
            let body = req.body;
            let platform_id = body.platformId;

            let instance = await db.open();

            await instance.collection("projects").deleteOne({representative_platform: mongodb.ObjectId(platform_id)});

            return res.json({success: true});
        } catch (err) {
            return res.json({success: false});
        }
    },
    getListingsAssignedAgents: async function (req, res) {
        try {
            let projectId = req.params.projectId;

            let instance = await db.open();

            let projects = await instance.collection("projects").find({distributor: mongodb.ObjectId(res.locals.user["id"]), reference_id: mongodb.ObjectId(projectId)}).toArray();
            let users = [];

            await Utilities.asyncForEach(projects, async function(project, index) {
                let platform = await instance.collection("platforms").findOne({_id: project.representative_platform});
                let user = await instance.collection("users").findOne({_id: platform.user_id});

                user = Object.assign(user, {platform: platform});
                users.push(user);
            });

            console.log(users);

            return res.render("cms/components/assigned-user-list", {layout: false, data: {
                users: users
            }});
        } catch (err) {
            console.log(err);
            return res.send("<p>Error occurred while fetching data from server.</p>");
        }
    },
    getListingsTowerList: async function (req, res) {
        try {
            let project_id = req.params.projectId;

            let instance = await db.open();
            let project = await instance.collection("projects").findOne({representative_platform: mongodb.ObjectId(res.locals.user["platform"]), _id: mongodb.ObjectId(project_id)});

            let towers = project["towers"];

            towers.forEach((element, index) => {
                towers[index] = Object.assign(towers[index], {floorCount: element.floors.length});

                towers[index]["floors"].forEach((floor, floorIndex) => {
                    towers[index]["floors"][floorIndex] = Object.assign(towers[index]["floors"][floorIndex], {floorIndex: floorIndex});
                });

                towers[index]["floors"] = towers[index]["floors"].reverse();
            });

            return res.render("cms/components/unit-status-change", {layout: false, data: {
                project: project,
                towers: towers
            }});
        } catch (err) {
            console.log(err);
            return res.send("<p>Error occurred while fetching data from server.</p>");
        }
    },
    getListingsConfirmUnitChangeAction: async function (req, res) {
      try {
          let query = req.query;
          let project_id = req.params.projectId;

          let instance = await db.open();

          let project = await instance.collection("projects").findOne({
              _id: mongodb.ObjectId(project_id),
              representative_platform: mongodb.ObjectId(res.locals.user["platform"])
          });

          if (!project) return res.json({success: false, message: "No permission to modify units on this listing"});

          let unit = project["towers"][query.tower]["floors"][query.floor]["units"][query.unit];

          console.log(unit);

          if(unit["modifiedBy"] && unit["status"] !== "available") {
              // Check if the user has rights to modify
              if (!res.locals.user["id"] === unit["modifiedBy"].toString()) {
                  return res.json({success: false, message: "You cannot modify this unit."});
              } else {
                  return res.json({status: true, project_id: project_id, unit_data: unit, tower: query.tower, floor: query.floor, unit: query.unit});
              }
          } else {
              return res.json({success: true, project_id: project_id, unit_data: unit, tower: query.tower, floor: query.floor, unit: query.unit});
          }
      } catch (err) {
          console.log(err);
          return res.json({success: false, message: "An error has occurred"});
      }
    },
    postListingsChangeUnitStatus: async function (req, res) {
        try {
            let body = req.body;

            let instance = await db.open();

            let project = await instance.collection("projects").findOne({
                _id: mongodb.ObjectId(body.projectId),
                representative_platform: mongodb.ObjectId(res.locals.user["platform"])
            });

            if(!project) return res.redirect("/cms/listings");

            let unit = project["towers"][body.towerIndex]["floors"][body.floorIndex]["units"][body.unitIndex];

            let unit_name = unit.name;

            await instance.collection("projects").updateMany({reference_id: project.reference_id}, {
                $set: {
                    [`towers.${body.towerIndex}.floors.${body.floorIndex}.units.${body.unitIndex}.status`]: body.unit_status,
                    [`towers.${body.towerIndex}.floors.${body.floorIndex}.units.${body.unitIndex}.modifiedBy`]: mongodb.ObjectId(res.locals.user["id"])
                }
            });

            await instance.collection("unit_reports").updateOne({recipient: project.distributor, reference_id: project.reference_id, document_issued: false}, {
                $push: {
                    reports: {
                        message: `${res.locals.user["first_name"]} ${res.locals.user["last_name"]} has set unit ${unit_name} from ${unit.status} to ${body.unit_status}.`,
                        timestamp: Date.now()
                    }
                }
            }, {upsert: true});

            return res.redirect("/cms/listings");
        } catch (err) {
            console.log(err);
            return res.redirect("/cms/listings");
        }
    },
    getMediaInModal: async function (req, res) {
        try {
            let query = req.query;

            let instance = await db.open();

            let mediaObject = {user_id: mongodb.ObjectId(res.locals.user["id"])};

            if(query.fileType === "photo") {
                mediaObject = Object.assign(mediaObject, {fileType: "image"});
            } else if(query.fileType === "video") {
                mediaObject = Object.assign(mediaObject, {fileType: "video"});
            } else if (query.fileType === "any") {
                mediaObject = Object.assign(mediaObject, {uploadedFor: {$ne: "logo"}});
            } else {
                mediaObject = Object.assign(mediaObject, {uploadedFor: query.fileType});
            }

            if(("category" in query) && query.category !== "Uncategorised") {
                mediaObject = Object.assign(mediaObject, {uploadedFor: query.category});
            }

            let medias = await instance.collection("medias").find(mediaObject).toArray();

            return res.render("cms/components/media-gallery-modal", {layout: false, data: {medias}});
        } catch (err) {
            console.log(err);
            return res.send("<h3>Could not show anything at this moment</h3>");
        }
    },
    getMediaCategories: async function (req, res) {
        try {
            let fileType = req.query.fileType;
            let instance = await db.open();

            let mediaObject = {};

            if(fileType === "photo") {
                mediaObject = Object.assign(mediaObject, {fileType: "image"});
            } else if(fileType === "video") {
                mediaObject = Object.assign(mediaObject, {fileType: "video"});
            }

            let media = await instance.collection("medias").find(mediaObject).toArray();

            let categories = _.map(media, "uploadedFor");

            let categories_object = {};

            categories.forEach(function (e) {
                Object.assign(categories_object, {[e]: null});
            });

            Object.assign(categories_object, {"Uncategorised": null});

            return res.json({success: true, data: categories_object});
        } catch (err) {
            return res.json({success: false, message: "Unable to get categories at this moment."});
        }
    },
    getUserSettings: async function (req, res) {
        try {
            let instance = await db.open();

            let user = await instance.collection("users").findOne({
                _id: mongodb.ObjectId(res.locals.user["id"])
            });

            return res.render("cms/user-settings", {layout: "cms", data: {
                pageTitle: "User Information",
                user
            }});
        } catch (err) {
            console.log(err);
            return res.status(500).json({status: 500, message: "An error has occurred."});
        }
    },
    getUserSettingsEditInfo: async function (req, res) {
        try {
            let instance = await db.open();

            let user = await instance.collection("users").findOne({
                _id: mongodb.ObjectId(res.locals.user["id"])
            });

            return res.render("cms/user-settings-edit-info", {layout: "cms", data: {
                pageTitle: "Edit User Information",
                user
            }});
        } catch (err) {
            console.log(err);
            return res.status(500).json({status: 500, message: "An error has occurred."});
        }
    },
    getUserSettingsEditPassword: async function (req, res) {
        try {
            let instance = await db.open();

            let user = await instance.collection("users").findOne({
                _id: mongodb.ObjectId(res.locals.user["id"])
            });

            return res.render("cms/user-settings-edit-password", {layout: "cms", data: {
                    pageTitle: "Edit User Password",
                    user
                }});
        } catch (err) {
            console.log(err);
            return res.status(500).json({status: 500, message: "An error has occurred."});
        }
    },
    postUserSettingsEditInfo: async function (req, res) {
        try {
            let body = req.body;

            let instance = await db.open();

            let cms_color = "";

            if(!req.body.cms_color) {
                cms_color = "default"
            } else {
                cms_color = req.body.cms_color;
            }

            let updateObject = {
                first_name: body.first_name,
                last_name: body.last_name,
                username: body.username,
                cms_color: cms_color,
                email: body.email,
                ren_number: req.body.ren_number ? req.body.ren_number : null,
                company_number: req.body.company_number ? req.body.company_number : null,
            }

            let avatar;

            if(req.file) {
                avatar = await Utilities.registerAvatarIntoServer(res.locals.user["id"], req.file);
                updateObject = Object.assign(updateObject, {profile_photo: avatar});
            }

            await instance.collection("users").updateOne({_id: mongodb.ObjectId(res.locals.user["id"])}, {
                $set: updateObject
            });

            let cookie = req.cookies["authorized"];
            let token = await Token.read(cookie);

            token.username = body.username;
            token.firstName = body.first_name;
            token.lastName = body.last_name;
            token.profile_pic = req.file ? avatar : token.profile_pic;
            token.cms_color = cms_color;

            let encryptedToken = await Token.create(token);

            let cookieOptions;

            if(token.keepSigned) {
                cookieOptions = {httpOnly: true, secure: true, maxAge: 604800000, overwrite: true};
            } else {
                cookieOptions = {httpOnly: true, secure: true, overwrite: true};
            }

            return res.cookie("authorized", encryptedToken, cookieOptions).redirect("/cms/user-settings");
        } catch (err) {
            console.log(err);
            return res.redirect("/cms/listings");
        }
    },
    postUserSettingsEditPassword: async function (req, res) {
        try {
            let body = req.body;

            if(body.password["value"] !== body.password["confirm"]) return res.redirect("back");

            let instance = await db.open();

            let user = await instance.collection("users").findOne({
                _id: mongodb.ObjectId(res.locals.user["id"])
            });

            let passwordCompare = await Password.comparePassword(body.password["current"], user.password);

            if(passwordCompare) {
                let hash = Password.hash(body.password["value"]);

                await instance.collection('users').updateOne({_id: mongodb.ObjectId(res.locals.user["id"])}, {
                    $set: {
                        password: hash
                    }
                });

                return res.redirect("/cms/user-settings");
            } else {
                return res.redirect("back");
            }

        } catch (err) {
            console.log(err);
            return res.redirect("/cms/listings");
        }
    },
    getPlatformEdit: async function (req, res) {
        try {
            let instance = await db.open();
            let platform = await instance.collection("platforms").findOne({
               _id: mongodb.ObjectId(res.locals.user["platform"])
            });

            return res.render("cms/edit-platform", {layout: "cms", data: {
                pageTitle: "Edit Platform",
                platform
            }});
        } catch (err) {
            console.log(err);
            return res.status(500).json({status: 500, message: "An error has occurred."});
        }
    },
    postPlatformEdit: async function (req, res) {
        try {
            let body = req.body;
            let platform = body.platform;

            let instance = await db.open();

            await instance.collection("platforms").findOneAndUpdate({_id: mongodb.ObjectId(res.locals.user["platform"])}, {
                $set: {
                    name: platform.name,
                    qualifiedName: platform.qualifiedName,
                    theme_color: platform.theme_color,
                    landing_page_title: platform.landing_page_title,
                    landing_page_slider: ("landing_page_slider" in platform) ? _.map(platform.landing_page_slider, function(slide) {return mongodb.ObjectId(slide)}) : null,
                    owner_type: platform.owner_type,
                    about_description: platform.about_description,
                    about_image: ("about_image" in platform) ? mongodb.ObjectId(platform.about_image[0]) : null,
                    logo: ("logo" in platform) ? mongodb.ObjectId(platform.logo[0]) : null,
                    properties_listing_section: {
                        header: platform.properties_listing_section.header,
                        header_sub: platform.properties_listing_section.header_sub
                    },
                    footer_slider: {
                        header: platform.footer_slider.header,
                        slides: ("slides" in platform["footer_slider"]) ? _.map(platform.footer_slider.slides, function (slide) { return mongodb.ObjectId(slide);}) : null
                    },
                    contact_mobile: platform.contact_mobile,
                    contact_email: platform.contact_email,
                    business_address: platform.business_address,
                    business_hours: platform.business_hours,
                    useful_links: platform.useful_links,
                    visibility: {
                        isVisible: ("visibility" in platform),
                        reason: null
                    },
                    completed: true
                }
            });

            return res.redirect("/cms/listings");
        } catch (err) {
            console.log(err);
            return res.status(500).json({status: 500, message: "An error has occurred."});
        }
    }
}