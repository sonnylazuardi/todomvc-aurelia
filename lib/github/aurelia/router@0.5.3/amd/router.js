/* */ 
"format register";
define(["exports","aurelia-route-recognizer","aurelia-path","./navigation-context","./navigation-instruction","./router-configuration","./util"], function (exports, _aureliaRouteRecognizer, _aureliaPath, _navigationContext, _navigationInstruction, _routerConfiguration, _util) {
  "use strict";

  var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

  var RouteRecognizer = _aureliaRouteRecognizer.RouteRecognizer;
  var join = _aureliaPath.join;
  var NavigationContext = _navigationContext.NavigationContext;
  var NavigationInstruction = _navigationInstruction.NavigationInstruction;
  var RouterConfiguration = _routerConfiguration.RouterConfiguration;
  var processPotential = _util.processPotential;
  var Router = exports.Router = (function () {
    function Router(container, history) {
      this.container = container;
      this.history = history;
      this.viewPorts = {};
      this.reset();
      this.baseUrl = "";
    }

    _prototypeProperties(Router, null, {
      registerViewPort: {
        value: function registerViewPort(viewPort, name) {
          name = name || "default";
          this.viewPorts[name] = viewPort;
        },
        writable: true,
        configurable: true
      },
      refreshBaseUrl: {
        value: function refreshBaseUrl() {
          if (this.parent) {
            var baseUrl = this.parent.currentInstruction.getBaseUrl();
            this.baseUrl = this.parent.baseUrl + baseUrl;
          }
        },
        writable: true,
        configurable: true
      },
      refreshNavigation: {
        value: function refreshNavigation() {
          var nav = this.navigation;

          for (var i = 0, length = nav.length; i < length; i++) {
            var current = nav[i];

            if (!this.history._hasPushState) {
              if (this.baseUrl[0] == "/") {
                current.href = "#" + this.baseUrl;
              } else {
                current.href = "#/" + this.baseUrl;
              }
            } else {
              current.href = "/" + this.baseUrl;
            }

            if (current.href[current.href.length - 1] != "/") {
              current.href += "/";
            }

            current.href += current.relativeHref;
          }
        },
        writable: true,
        configurable: true
      },
      configure: {
        value: function configure(callbackOrConfig) {
          if (typeof callbackOrConfig == "function") {
            var config = new RouterConfiguration();
            callbackOrConfig(config);
            config.exportToRouter(this);
          } else {
            callbackOrConfig.exportToRouter(this);
          }

          return this;
        },
        writable: true,
        configurable: true
      },
      navigate: {
        value: function navigate(fragment, options) {
          fragment = join(this.baseUrl, fragment);
          return this.history.navigate(fragment, options);
        },
        writable: true,
        configurable: true
      },
      navigateBack: {
        value: function navigateBack() {
          this.history.navigateBack();
        },
        writable: true,
        configurable: true
      },
      createChild: {
        value: function createChild(container) {
          var childRouter = new Router(container || this.container.createChild(), this.history);
          childRouter.parent = this;
          return childRouter;
        },
        writable: true,
        configurable: true
      },
      createNavigationInstruction: {
        value: function createNavigationInstruction() {
          var url = arguments[0] === undefined ? "" : arguments[0];
          var parentInstruction = arguments[1] === undefined ? null : arguments[1];
          var results = this.recognizer.recognize(url);
          var fragment, queryIndex, queryString;

          if (!results || !results.length) {
            results = this.childRecognizer.recognize(url);
          }

          fragment = url;
          queryIndex = fragment.indexOf("?");

          if (queryIndex != -1) {
            fragment = url.substr(0, queryIndex);
            queryString = url.substr(queryIndex + 1);
          }

          if ((!results || !results.length) && this.catchAllHandler) {
            results = [{
              config: {
                navModel: {}
              },
              handler: this.catchAllHandler,
              params: {
                path: fragment
              }
            }];
          }

          if (results && results.length) {
            var first = results[0],
                fragment = url,
                queryIndex = fragment.indexOf("?"),
                queryString;

            if (queryIndex != -1) {
              fragment = url.substr(0, queryIndex);
              queryString = url.substr(queryIndex + 1);
            }

            var instruction = new NavigationInstruction(fragment, queryString, first.params, first.queryParams || results.queryParams, first.config || first.handler, parentInstruction);

            if (typeof first.handler == "function") {
              return first.handler(instruction).then(function (instruction) {
                if (!("viewPorts" in instruction.config)) {
                  instruction.config.viewPorts = {
                    "default": {
                      moduleId: instruction.config.moduleId
                    }
                  };
                }

                return instruction;
              });
            }

            return Promise.resolve(instruction);
          } else {
            return Promise.reject(new Error("Route Not Found: " + url));
          }
        },
        writable: true,
        configurable: true
      },
      createNavigationContext: {
        value: function createNavigationContext(instruction) {
          return new NavigationContext(this, instruction);
        },
        writable: true,
        configurable: true
      },
      generate: {
        value: function generate(name, params) {
          return this.recognizer.generate(name, params);
        },
        writable: true,
        configurable: true
      },
      addRoute: {
        value: function addRoute(config) {
          var navModel = arguments[1] === undefined ? {} : arguments[1];
          if (!("viewPorts" in config)) {
            config.viewPorts = {
              "default": {
                moduleId: config.moduleId,
                view: config.view
              }
            };
          }

          navModel.title = navModel.title || config.title;

          this.routes.push(config);
          this.recognizer.add([{ path: config.route, handler: config }]);

          if (config.route) {
            var withChild = JSON.parse(JSON.stringify(config));
            withChild.route += "/*childRoute";
            withChild.hasChildRouter = true;
            this.childRecognizer.add([{
              path: withChild.route,
              handler: withChild
            }]);

            withChild.navModel = navModel;
          }

          config.navModel = navModel;

          if ((config.nav || "order" in navModel) && this.navigation.indexOf(navModel) === -1) {
            navModel.order = navModel.order || config.nav;
            navModel.href = navModel.href || config.href;
            navModel.isActive = false;
            navModel.config = config;

            if (!config.href) {
              navModel.relativeHref = config.route;
              navModel.href = "";
            }

            if (typeof navModel.order != "number") {
              navModel.order = ++this.fallbackOrder;
            }

            this.navigation.push(navModel);
            this.navigation = this.navigation.sort(function (a, b) {
              return a.order - b.order;
            });
          }
        },
        writable: true,
        configurable: true
      },
      handleUnknownRoutes: {
        value: function handleUnknownRoutes(config) {
          var callback = function (instruction) {
            return new Promise(function (resolve, reject) {
              function done(inst) {
                inst = inst || instruction;
                inst.config.route = inst.params.path;
                resolve(inst);
              }

              if (!config) {
                instruction.config.moduleId = instruction.fragment;
                done(instruction);
              } else if (typeof config == "string") {
                instruction.config.moduleId = config;
                done(instruction);
              } else if (typeof config == "function") {
                processPotential(config(instruction), done, reject);
              } else {
                instruction.config = config;
                done(instruction);
              }
            });
          };

          this.catchAllHandler = callback;
        },
        writable: true,
        configurable: true
      },
      reset: {
        value: function reset() {
          this.fallbackOrder = 100;
          this.recognizer = new RouteRecognizer();
          this.childRecognizer = new RouteRecognizer();
          this.routes = [];
          this.isNavigating = false;
          this.navigation = [];
        },
        writable: true,
        configurable: true
      }
    });

    return Router;
  })();
  exports.__esModule = true;
});