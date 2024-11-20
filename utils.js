const fs = require('fs');

const readJSON = (filePath, callback) => {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return callback(err);
    callback(null, JSON.parse(data));
  });
};

const writeJSON = (filePath, data, callback) => {
  fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8', callback);
};

module.exports = { readJSON, writeJSON };
