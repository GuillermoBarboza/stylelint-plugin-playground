// require the file system module
var fs = require('fs');
var path = require('path');

// delete white space from the beginning and end of a string
// delete any ' characters in the string
function trim(str) {
  return str.replace(/^\s+|\s+$/g, '');
}

function getMixins(file) {
  var mixinsArray = file.split('\n');
  var mixins = [];
  var propsAndValuesMixin = {};
  var propsAndValuesList = [];
  let mixin = {};
  // loop through mixinsArray and find mixin names
  for (var i = 0; i < mixinsArray.length; i++) {

    //if the line has an opening comment, skip it until the closing comment
    if (mixinsArray[i].indexOf('/*') >= 0) {
      while (mixinsArray[i].indexOf('*/') < 0) {
        i++;
      }
    }

    // if the line contains a mixin get its name
    if (mixinsArray[i].indexOf('@mixin') >= 0) {
      // split the line by spaces
      var lineArray = mixinsArray[i].split(' ');
      //here, lineArray == [ '@mixin', 'flex-column-between', '{\r' ]
      // the mixin name is the second item in the array
      var mixinName = lineArray.slice(1, lineArray.length - 1).join(' ');
      // remove the opening parenthesis
      mixinName = mixinName;
      // add the mixin name to the mixinNames array
      mixin.mixin = mixinName;
    }

    // if the line contains a css property
    if (mixinsArray[i].indexOf(':') >= 0) {
      // split the line by colons
      var lineArray = mixinsArray[i].split(':');
      // the property name is the first item in the array
      var propertyName = lineArray[0].trim();
      // the property value is the second item in the array
      var propertyValue = lineArray[1].trim();
      // remove the semicolon
      propertyValue = propertyValue.replace(';', '');
      // add the property name and value to the propsAndValuesMixin array
      propsAndValuesMixin = { prop: propertyName, value: propertyValue };
      propsAndValuesList.push(propsAndValuesMixin);
    }

    // if the line contains a '}' character, add the propsAndValuesMixin array to the propsAndValuesList array
    if (mixinsArray[i].indexOf('}') >= 0 && mixin.mixin) {
      mixin.propsAndValues = propsAndValuesList;

      mixins.push(mixin)

      propsAndValuesMixin = {};
      propsAndValuesList = [];
      mixin = {};
    }

  }
  return mixins;
}

function fromDir(startPath, filter, callback) {
  if (!fs.existsSync(startPath)) {
    console.log("no dir ", startPath);
    return;
  }

  var files = fs.readdirSync(startPath);
  for (var i = 0; i < files.length; i++) {
    var filename = path.join(startPath, files[i]);
    var stat = fs.lstatSync(filename);
    if (stat.isDirectory()) {
      fromDir(filename, filter, callback);
    } else if (filter.test(filename)) callback(filename);
  };
};

//write a promise that searches through this project's files for a mixins.scss file and returns its contents

let getMixinsFile = new Promise(function (resolve, reject) {
  fromDir('./', /mixins.scss$/, function (filename) {
    let path = ('.\\' + filename).replace(/\\/g, '/');
    fs.readFile(path, 'utf8', function (err, data) {
      if (err) {
        reject('errrr', err);
      } else {
        var mixins = getMixins(data);
        resolve(mixins);
      }
    });
  });
});

module.exports = getMixinsFile;

/* // call the getMixinsFile promise
getMixinsFile.then(function (data) {
  console.log('data del mixx', data);
  return data;
}
).catch(function (err) {
  console.log(err);
}); */

