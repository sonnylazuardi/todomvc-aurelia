/* */ 
"format register";
define(["exports"], function (exports) {
  "use strict";

  var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

  exports.isNavigationCommand = isNavigationCommand;
  function isNavigationCommand(obj) {
    return obj && typeof obj.navigate === "function";
  }

  var Redirect = exports.Redirect = (function () {
    function Redirect(url) {
      this.url = url;
      this.shouldContinueProcessing = false;
    }

    _prototypeProperties(Redirect, null, {
      navigate: {
        value: function navigate(appRouter) {
          (this.router || appRouter).navigate(this.url, { trigger: true, replace: true });
        },
        writable: true,
        configurable: true
      }
    });

    return Redirect;
  })();
  exports.__esModule = true;
});