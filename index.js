var merge = require('lodash.merge');
var path = require('path');
var fio = require('file_io');
var fs = require('fs');

function AssetsReplaceVersion(options) {
	this.options = merge({}, {
		filename: 'webpack-assets.json',
		includePath: '.'
	}, options);
}

function obj2arr(obj) {
  var arr = [];
  if(obj instanceof Object) {
    for(let key in obj) {
      if(obj[key] instanceof Object) {
        arr = arr.concat(obj2arr(obj[key]));
      }else if(obj[key]){
        arr.push(obj[key]);
      }		
    }
  }
  return arr;
}

AssetsReplaceVersion.prototype = {
	constructor: AssetsReplaceVersion,

	apply: function(compiler) {
		var self = this;

		compiler.plugin('done', function() {
			// console.log('start AssetsReplaceVersion'); 

      var VER = self.options.filename; // the version file
      var DIR = self.options.includePath; // need to change

      fio.readFile(VER).then(function(data) {
        var obj = JSON.parse(data);
        let arr = obj2arr(obj);
        let tmp = arr.map(item => {
          return item.replace(/\?v=.*/, '');
        });
        // console.log(tmp, arr);

        // change include file
        var files = fs.readdirSync(DIR);
        // console.log(files);
        files.forEach(url => {
          var file = path.join(DIR,url);
          fio.readFile(file).then(function(data) {
            tmp.map((val, i) => {
              let reg = new RegExp(val.replace(/\//g, '\\/') + '\\?v=.*?[^"](?=")', 'g');
              data = data.replace(reg, arr[i]);
            });
            // console.log(data);
            fio.writeFile(file, data).then(function(data) {
              console.log('file: ' + file + ' write succ: ',data);
            }, function(err) {
              console.log('file: ' + file + 'write err: ', err);
            });
          }, function(err) {
            conosle.log(err);
          });
        });

      });
		});
	}
}

module.exports = AssetsReplaceVersion

