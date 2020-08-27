var Database = require("better-sqlite3");

var db = new Database("./_data.db", {fileMustExist: true});

module.exports = {
    getEnvironmentVariable(key) {
        let data = db.prepare('SELECT * FROM environment_variables WHERE key = ?').get(key);
        return data.value;
    }, setEnvironmentVariable(key, value) {
        let stmt = db.prepare('INSERT INTO environment_variables (key, value) VALUES (?,?)');
        let env = stmt.run(key, value);
        return env;
    },
    getLogByReferenceNumber(reference_number) {
        let data = db.prepare('SELECT * FROM logs WHERE reference_number = ?').get(reference_number);
        return data;
    },
    getLogsByType(type) {
        let data = db.prepare('SELECT * FROM logs WHERE type = ?').all(type);
        return data;
    },
    setLog(reference_number, type, log, createdAt) {
        let stmt = db.prepare('INSERT INTO logs (reference_number, type, log, createdAt) VALUES (?,?,?,?)');
        let logging = stmt.run(reference_number, type, log, createdAt);
        return logging;
    },
    getAllEnvironmentVariables() {
        let data = db.prepare('SELECT * FROM environment_variables').all();
        return data;
    },
    getAllLogs() {
        let data = db.prepare('SELECT * FROM logs').all();
        return data;
    },
    removeEnvironmentVariable(key) {
        let stmt = db.prepare('DELETE FROM environment_variables WHERE key = ?');
        let result = stmt.run(key);
        return result;
    },
    removeLogByReferenceNumber(reference_number) {
        let stmt = db.prepare('DELETE FROM logs WHERE reference_number = ?');
        let result = stmt.run(reference_number);
        return result;
    },
    removeLogsByType(reference_number) {
        let stmt = db.prepare('DELETE FROM logs WHERE type = ?');
        let result = stmt.run(reference_number);
        return result;
    },
    updateEnvironmentVariable(key, value) {
        let stmt = db.prepare('UPDATE environment_variables SET value = ? WHERE key = ?');
        let result = stmt.run(key, value);
        return result;
    }
}
