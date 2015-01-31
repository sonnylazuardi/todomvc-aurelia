/* */ 
"format register";
"use strict";

var _interopRequireWildcard = function (obj) {
  return obj && obj.constructor === Object ? obj : {
    "default": obj
  };
};

var _defaults = function (obj, defaults) {
  for (var key in defaults) {
    if (obj[key] === undefined) {
      obj[key] = defaults[key];
    }
  }

  return obj;
};

var Metadata = require("aurelia-metadata").Metadata;
var ValueConverter = require("./value-converter").ValueConverter;
exports.EventManager = require("./event-manager").EventManager;
exports.ObserverLocator = require("./observer-locator").ObserverLocator;
exports.ValueConverter = require("./value-converter").ValueConverter;
exports.calcSplices = require("./array-change-records").calcSplices;
_defaults(exports, _interopRequireWildcard(require("./binding-modes")));

exports.Parser = require("./parser").Parser;
exports.BindingExpression = require("./binding-expression").BindingExpression;
exports.ListenerExpression = require("./listener-expression").ListenerExpression;
exports.NameExpression = require("./name-expression").NameExpression;
exports.CallExpression = require("./call-expression").CallExpression;
exports.DirtyChecker = require("./dirty-checking").DirtyChecker;


Metadata.configure.classHelper("valueConverter", ValueConverter);