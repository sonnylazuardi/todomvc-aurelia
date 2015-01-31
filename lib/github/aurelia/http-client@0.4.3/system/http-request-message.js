/* */ 
System.register(["./headers", "./http-response-message"], function (_export) {
  "use strict";

  var Headers, HttpResponseMessage, _prototypeProperties, HttpRequestMessage;
  return {
    setters: [function (_headers) {
      Headers = _headers.Headers;
    }, function (_httpResponseMessage) {
      HttpResponseMessage = _httpResponseMessage.HttpResponseMessage;
    }],
    execute: function () {
      _prototypeProperties = function (child, staticProps, instanceProps) {
        if (staticProps) Object.defineProperties(child, staticProps);
        if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
      };

      HttpRequestMessage = (function () {
        function HttpRequestMessage(method, uri, content, replacer) {
          this.method = method;
          this.uri = uri;
          this.content = content;
          this.headers = new Headers();
          this.responseType = "json";
          this.replacer = replacer;
        }

        _prototypeProperties(HttpRequestMessage, null, {
          withHeaders: {
            value: function withHeaders(headers) {
              this.headers = headers;
              return this;
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          configureXHR: {
            value: function configureXHR(xhr) {
              xhr.open(this.method, this.uri, true);
              xhr.responseType = this.responseType;
              this.headers.configureXHR(xhr);
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          formatContent: {
            value: function formatContent() {
              var content = this.content;

              if (window.FormData && content instanceof FormData) {
                return content;
              }

              if (window.Blob && content instanceof Blob) {
                return content;
              }

              if (window.ArrayBufferView && content instanceof ArrayBufferView) {
                return content;
              }

              if (content instanceof Document) {
                return content;
              }

              if (typeof content === "string") {
                return content;
              }

              return JSON.stringify(content, this.replacer);
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          send: {
            value: function send(client, progressCallback) {
              var _this = this;
              return new Promise(function (resolve, reject) {
                var xhr = new XMLHttpRequest(),
                    responseType = _this.responseType;

                if (responseType === "json") {
                  _this.responseType = "text";
                }

                if (client.timeout !== undefined) {
                  xhr.timeout = client.timeout;
                }

                _this.configureXHR(xhr);

                xhr.onload = function (e) {
                  resolve(new HttpResponseMessage(_this, xhr, responseType, client.reviver));
                };

                xhr.ontimeout = function (e) {
                  reject(new Error(e));
                };

                xhr.onerror = function (e) {
                  reject(new Error(e));
                };

                if (progressCallback) {
                  xhr.upload.onprogress = progressCallback;
                }

                xhr.send(_this.formatContent());
              });
            },
            writable: true,
            enumerable: true,
            configurable: true
          }
        });

        return HttpRequestMessage;
      })();
      _export("HttpRequestMessage", HttpRequestMessage);
    }
  };
});