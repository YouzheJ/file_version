var merge = require('lodash.merge');
var path = require('path');
var fio = require('file_io');
var fs = require('fs');

var hasCheck = false;

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

function filterString(rule, path) { // 根据字符串过滤
  return new RegExp(rule).test(path);
}

function filterArray(rule, path) { // 根据数组过滤
  for(var i = 0; i < rule.length; i++) {
    var reg = new RegExp(rule[i]);
    if(reg.test(path)) {
      return true;
    }
  }
  return false;
}

function filterDefault() { // 过滤的默认处理
  if(!hasCheck) {
    hasCheck = true;
    console.log('file_version: the filter rule type is not String or Array');
  }
  return false;
}

function getType(val) { // 获取类型
  var type = Object.prototype.toString.call(val);
  return type.slice(8).replace(/\[object|\]|\s*/g, '');
}

function filterFile(rule, path) { // 过滤, 返回true时, 说明匹配上了
  switch(getType(rule)) {
    case 'String': return filterString(rule, path);
    case 'Array': return filterArray(rule, path);
    case 'Undefined': return false;
    default: return filterDefault();
  }
}

AssetsReplaceVersion.prototype = {
	constructor: AssetsReplaceVersion,

	apply: function(compiler) {
		var self = this;

		compiler.plugin('done', function() {

      var VER = self.options.filename; // the version file
      var DIR = self.options.includePath; // need to change
      var FILTER = self.options.filter; // the filter rule

      fio.readFile(VER).then(function(data) {
        var obj = JSON.parse(data);
        let arr = obj2arr(obj); // the new version path array
        let tmp = arr.map(item => { // path array that not have version info
          return item.replace(/\?v=.*/, '');
        });
        // console.log(tmp, arr);

        // change include file
	console.log('=================================\n');
	console.log('change file version: ');
  console.log('--------------------\n');
	
        var files = fs.readdirSync(DIR);
        // console.log(files);
        files.forEach(url => {
          var file = path.join(DIR, url);
          fio.readFile(file).then(function(data) {
            tmp.map((val, i) => {
              if(filterFile(FILTER, val)) { // filter this data
                console.log(' file: ' + file + ' \n\thad filter: ' + val);
                console.log('--------------------\n');
              }else { // repalce this path
                let reg = new RegExp(val.replace(/\//g, '\\/') + '\\?v=.*?[^"](?=")', 'g');
                data = data.replace(reg, arr[i]);
              }
            });
            // console.log(data);
            fio.writeFile(file, data).then(function(data) {
              console.log(' file: ' + file + ' succ');
            }, function(err) {
              console.log(' file: ' + file + ' err: ', err);
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

