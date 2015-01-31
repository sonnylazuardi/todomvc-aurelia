/* */ 
"format register";
define(["exports","./http-response-message"], function (exports, _httpResponseMessage) {
  "use strict";

  var _prototypeProperties = function (child, staticProps, instanceProps) {
    if (staticProps) Object.defineProperties(child, staticProps);
    if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
  };

  var HttpResponseMessage = _httpResponseMessage.HttpResponseMessage;
  var JSONPRequestMessage = (function () {
    function JSONPRequestMessage(uri, callbackParameterName) {
      this.uri = uri;
      this.callbackParameterName = callbackParameterName;
    }

    _prototypeProperties(JSONPRequestMessage, null, {
      send: {
        value: function send(client) {
          var _this = this;
          return new Promise(function (resolve, reject) {
            var callbackName = "jsonp_callback_" + Math.round(100000 * Math.random());
            var uri = _this.uri + (_this.uri.indexOf("?") >= 0 ? "&" : "?") + _this.callbackParameterName + "=" + callbackName;

            window[callbackName] = function (data) {
              delete window[callbackName];
              document.body.removeChild(script);
              resolve(new HttpResponseMessage(_this, {
                response: data,
                status: 200,
                statusText: "OK"
              }, "jsonp"));
            };

            var script = document.createElement("script");
            script.src = uri;
            document.body.appendChild(script);
          });
        },
        writable: true,
        enumerable: true,
        configurable: true
      }
    });

    return JSONPRequestMessage;
  })();

  exports.JSONPRequestMessage = JSONPRequestMessage;
});