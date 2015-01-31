/* */ 
"format register";
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) {
  if (staticProps) Object.defineProperties(child, staticProps);
  if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
};

var _inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) subClass.__proto__ = superClass;
};

var ResourceType = require("aurelia-metadata").ResourceType;
var BehaviorInstance = require("./behavior-instance").BehaviorInstance;
var configureBehavior = require("./behaviors").configureBehavior;
var hyphenate = require("./util").hyphenate;
var AttachedBehavior = (function (ResourceType) {
  function AttachedBehavior(attribute) {
    this.name = attribute;
    this.properties = [];
    this.attributes = {};
  }

  _inherits(AttachedBehavior, ResourceType);

  _prototypeProperties(AttachedBehavior, {
    convention: {
      value: function convention(name) {
        if (name.endsWith("AttachedBehavior")) {
          return new AttachedBehavior(hyphenate(name.substring(0, name.length - 16)));
        }
      },
      writable: true,
      enumerable: true,
      configurable: true
    }
  }, {
    analyze: {
      value: function analyze(container, target) {
        configureBehavior(container, this, target);
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    load: {
      value: function load(container, target) {
        return Promise.resolve(this);
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    register: {
      value: function register(registry, name) {
        registry.registerAttribute(name || this.name, this, this.name);
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    compile: {
      value: function compile(compiler, resources, node, instruction) {
        instruction.suppressBind = true;
        return node;
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    create: {
      value: function create(container, instruction, element, bindings) {
        var executionContext = instruction.executionContext || container.get(this.target),
            behaviorInstance = new BehaviorInstance(this, executionContext, instruction);

        if (this.childExpression) {
          bindings.push(this.childExpression.createBinding(element, behaviorInstance.executionContext));
        }

        return behaviorInstance;
      },
      writable: true,
      enumerable: true,
      configurable: true
    }
  });

  return AttachedBehavior;
})(ResourceType);

exports.AttachedBehavior = AttachedBehavior;