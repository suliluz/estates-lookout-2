const path = require("path");
const fs = require("fs");
const {spawn} = require("child_process");

function getDestination (req, file, cb) {
    cb(null, "/dev/null");
}

function VideoStorage (opts) {
    this.getDestination = (opts.destination || getDestination);
}

VideoStorage.prototype._handleFile = function _handleFile (req, file, cb) {
    this.getDestination(req, file, function (err, path) {
        if (err) return cb(err);

        let ffmpeg = spawn("ffmpeg", [
            "-i", "pipe:0", "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "30", "-pass", "1", "-an", "-f", "webm", "/dev/null",
            "&&",
            "ffmpeg", "-i", "pipe:0", "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "30", "-pass", "2", "-c:a", "libopus", "pipe:1",
        ]);

        let outStream = fs.createWriteStream(path);

        ffmpeg.stdin.pipe(file.stream, {end: false});
        ffmpeg.stdout.pipe(outStream, {end: false});

        outStream.on('error', cb);
        outStream.on('finish', function () {
            cb(null, {
                path: path,
                size: outStream.bytesWritten
            });
        });
    });
}

VideoStorage.prototype._removeFile = function _removeFile (req, file, cb) {
    fs.unlink(file.path, cb);
}

module.exports = function (opts) {
    return new VideoStorage(opts);
}