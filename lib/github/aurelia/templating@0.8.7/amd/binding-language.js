/* */ 
"format register";
define(["exports"], function (exports) {
  "use strict";

  var _prototypeProperties = function (child, staticProps, instanceProps) {
    if (staticProps) Object.defineProperties(child, staticProps);
    if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
  };

  var BindingLanguage = (function () {
    function BindingLanguage() {}

    _prototypeProperties(BindingLanguage, null, {
      inspectAttribute: {
        value: function inspectAttribute(resources, attrName, attrValue) {
          throw new Error("A BindingLanguage must implement inspectAttribute(...)");
        },
        writable: true,
        enumerable: true,
        configurable: true
      },
      createAttributeInstruction: {
        value: function createAttributeInstruction(resources, element, info, existingInstruction) {
          throw new Error("A BindingLanguage must implement createAttributeInstruction(...)");
        },
        writable: true,
        enumerable: true,
        configurable: true
      },
      parseText: {
        value: function parseText(resources, value) {
          throw new Error("A BindingLanguage must implement parseText(...)");
        },
        writable: true,
        enumerable: true,
        configurable: true
      }
    });

    return BindingLanguage;
  })();

  exports.BindingLanguage = BindingLanguage;
});