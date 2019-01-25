const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
const fs = require('fs');
const Promise = require('bluebird');
const readFileAsync = Promise.promisify(fs.readFile);
const readdirAsync = Promise.promisify(fs.readdir);


// var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {

  counter.getNextUniqueId(function(err, uniqueId) {
    if (err) {
      console.log('could not get id');
    } else {
      fs.writeFile(exports.dataDir + '/' + uniqueId + '.txt', text, function(err) {
        if (err) {
          throw (err);
        }
        callback(null, { id: uniqueId, text: text });
      });
    }
  });
};

exports.readOne = (id, callback) => {
  fs.readFile(`${exports.dataDir}/${id}.txt`, 'utf8', function(err, text) {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      callback(null, {id: id, text: text});
    }
  });
};

const readOneAsync = Promise.promisify(exports.readOne);

exports.readAll = (callback) => {
  fs.readdir(exports.dataDir + '/', function(err, files) {
    if (err) {
      callback(err, null);
    }
    let trimmedFiles = files.map(function(file) {
      var id = file.slice(0, 5);
      return readFileAsync(`${exports.dataDir}/${file}`).then(text => {
        return {id: id, text: text.toString()};
      });
    });
    Promise.all(trimmedFiles).then(function(trimmedFiles) {
      callback(null, trimmedFiles);
    });
  });
};

exports.update = (id, text, callback) => {
  fs.readdir(`${exports.dataDir}/`, function(err, files) {
    if (err) {
      throw err;
    } else if (!files.includes(`${id}.txt`)) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      fs.writeFile(`${exports.dataDir}/${id}.txt`, text, function(err) {
        if (err) {
          callback(new Error(`No item with id: ${id}`));
        } else {
          callback(null, {id: id, text: text});
        }
      });
    }
  });
};

exports.delete = (id, callback) => {
  fs.unlink(`${exports.dataDir}/${id}.txt`, function(err) {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      callback();
    }
  });
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};

