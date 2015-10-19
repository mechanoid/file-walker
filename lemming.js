var fs = require('fs')
    , path = require('path')
    , Q = require('q')
    , lo = require('lodash');



module.exports = {
  resolveFile(dir, file) {
    file = path.resolve(dir, file);

    var d = Q.defer();

    fs.stat(file, (err, stat) => {
      if (err) {
        d.reject(err);
      } else {
        if (stat && stat.isDirectory()) {
          d.resolve(this.run(file));
        } else {
          d.resolve(file);
        }
      }
    });

    return d.promise;
  }

  , readDir(dir) {
    var d = Q.defer();

    fs.readdir(dir, function(err, files) {
      if (err) {
        d.reject(err);
      } else {
        d.resolve(files);
      }
    });
    return d.promise;
  }

  , run(dir, options) {
    var d = Q.defer();

    var opts = Object.assign({
      groupByPath: false
    }, options);

    this.readDir(dir)
    .then((files) => {
      var promises = files.map((file) => { return this.resolveFile(dir, file) });

      Q.all(promises)
      .then(function(files) {
        if (opts.groupByPath) {
          var res = {};
          res[dir] = lo.flatten(files);
          d.resolve(res);
        } else {
          d.resolve(lo.flatten(files));
        }
      })
      .catch((error) => d.reject(error));;
    })
    .catch((error) => d.reject(error));

    return d.promise;
  }

  , walk(dir, options) {
    return this.run(dir, options);
  }
};
