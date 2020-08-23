const fs = require("fs");
const db = require("../mongodb-config");
const mongodb = require("mongodb");
const path = require("path");

module.exports = {
    getVideoStream: async function (req, res) {
        try {
            let videoId = req.params.videoId;

            // Search media in database
            let instance = await db.open();
            let video = await instance.collection("medias").findOne({_id: mongodb.ObjectId(videoId)});

            if(video) {
                const path = video.path;
                const stat = fs.statSync(path);
                const fileSize = stat.size;
                const range = req.headers.range;

                console.log(path);
                console.log(stat);
                console.log(fileSize);
                console.log(range);

                if (range) {
                    const parts = range.replace(/bytes=/, "").split("-");
                    const start = parseInt(parts[0], 10);
                    const end = parts[1] ? parseInt(parts[1], 10) : fileSize-1;
                    const chunkSize = (end-start)+1;
                    const file = fs.createReadStream(path, {start, end});
                    const head = {
                        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                        'Accept-Ranges': 'bytes',
                        'Content-Length': chunkSize,
                        'Content-Type': `video/${video.extension}`,
                    }
                    console.log(head);
                    res.writeHead(206, head);
                    file.pipe(res);
                } else {
                    const head = {
                        'Content-Length': fileSize,
                        'Content-Type': `video/${video.extension}`,
                    }
                    res.writeHead(200, head);
                    fs.createReadStream(path).pipe(res);
                }
            } else {
                return res.status(404);
            }

        } catch (err) {
            return res.status(500);
        }
    },
    getMedia: async function (req, res) {
        try {
            let mediaId = req.params.mediaId;

            let instance = await db.open();
            let media = await instance.collection("medias").findOne({_id: mongodb.ObjectId(mediaId)});

            if(media) {
                return res.sendFile(media.path);
            } else {
                res.status(404);
            }

        } catch (err) {
            console.log(err);
            return res.status(500);
        }
    },
    getMediaInfo: async function (req, res) {
        try {
            let mediaId = req.params.mediaId;

            let instance = await db.open();

            let media = await instance.collection("medias").findOne({
                _id: mongodb.ObjectId(mediaId),
                user_id: mongodb.ObjectId(res.locals.user["id"])
            });

            if(!media) res.send("<h3>Information not found</h3>");

            return res.render("cms/components/media-info", {layout: false, data: {media}});

        } catch (err) {
            return res.send("<h3>Information cannot be displayed at this moment</h3>");
        }
    },
    expressPostMedia: async function (req, res) {
        try {
            let body = req.body;
            let files = req.files;

            let instance = await db.open();
            let insertObject = [];

            files.forEach((file) => {
                let mimeType = file.mimetype.split("/");

                insertObject.push({
                    displayName: file.originalname,
                    caption: null,
                    fileType: mimeType[0],
                    extension: mimeType[1],
                    fileName: file.filename,
                    path: file.path,
                    user_id: mongodb.ObjectId(res.locals.user["id"]),
                    updatedAt: Date.now(),
                    createdAt: Date.now()
                });
            });

            await instance.collection("medias").insertMany(insertObject);

            return res.json({success: true});
        } catch (err) {
            return res.json({success: false});
        }
    },
    postMedia: async function (req, res) {
        try {
            let body = req.body;
            let file = req.file;

            let instance = await db.open();

            let mimeType = file.mimetype.split("/");

            let fileObject = {
                displayName: body.displayName,
                caption: body.caption,
                uploadedFor: body.category,
                fileType: mimeType[0],
                extension: mimeType[1],
                fileName: file.filename,
                path: file.path,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                user_id: mongodb.ObjectId(res.locals.user["id"])
            }

            await instance.collection("medias").insertOne(fileObject);

            return res.json({success: true});
        } catch (err) {
            console.log(err);
            return res.json({success: false, status: 500, message: "An error has occurred."});
        }
    },
    getMediaDownload: async function (req, res) {
        try {
            let mediaId = req.params.mediaId;
            let instance = await db.open();

            let media = await instance.collection("medias").findOne({_id: mongodb.ObjectId(mediaId)});

            return res.download(media.path, media.displayName, function (err) {
                if (err) {
                    console.log(err);
                    res.redirect("back");
                }
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json({status: 500, message: "An error has occurred."});
        }
    },
    postDeleteMedia: async function (req, res) {
        try {
            let body = req.body;
            console.log(body);

            let instance = await db.open();

            await instance.collection("medias").findOneAndDelete({_id: mongodb.ObjectId(body.mediaId), user_id: mongodb.ObjectId(res.locals.user["id"])});

            return res.json({success: true});
        } catch (err) {
            console.log(err);
            return res.json({success: false, status: 500, message: "An error has occurred."});
        }
    }
}