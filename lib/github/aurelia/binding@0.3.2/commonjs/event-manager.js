/* */ 
"format register";
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) {
  if (staticProps) Object.defineProperties(child, staticProps);
  if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
};

var DefaultEventStrategy = (function () {
  function DefaultEventStrategy() {
    this.delegatedEvents = {};
  }

  _prototypeProperties(DefaultEventStrategy, null, {
    ensureDelegatedEvent: {
      value: function ensureDelegatedEvent(eventName) {
        if (this.delegatedEvents[eventName]) {
          return;
        }

        this.delegatedEvents[eventName] = true;
        document.addEventListener(eventName, this.handleDelegatedEvent.bind(this), false);
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    handleCallbackResult: {
      value: function handleCallbackResult(result) {},
      writable: true,
      enumerable: true,
      configurable: true
    },
    handleDelegatedEvent: {
      value: function handleDelegatedEvent(event) {
        event = event || window.event;
        var target = event.target || event.srcElement,
            callback;

        while (target && !callback) {
          if (target.delegatedEvents) {
            callback = target.delegatedEvents[event.type];
          }

          if (!callback) {
            target = target.parentNode;
          }
        }

        if (callback) {
          this.handleCallbackResult(callback(event));
        }
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    createDirectEventCallback: {
      value: function createDirectEventCallback(callback) {
        var _this = this;
        return function (event) {
          _this.handleCallbackResult(callback(event));
        };
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    subscribeToDelegatedEvent: {
      value: function subscribeToDelegatedEvent(target, targetEvent, callback) {
        var lookup = target.delegatedEvents || (target.delegatedEvents = {});

        this.ensureDelegatedEvent(targetEvent);
        lookup[targetEvent] = callback;

        return function () {
          lookup[targetEvent] = null;
        };
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    subscribeToDirectEvent: {
      value: function subscribeToDirectEvent(target, targetEvent, callback) {
        var directEventCallback = this.createDirectEventCallback(callback);
        target.addEventListener(targetEvent, directEventCallback, false);

        return function () {
          target.removeEventListener(targetEvent, directEventCallback);
        };
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    subscribe: {
      value: function subscribe(target, targetEvent, callback, delegate) {
        if (delegate) {
          return this.subscribeToDirectEvent(target, targetEvent, callback);
        } else {
          return this.subscribeToDelegatedEvent(target, targetEvent, callback);
        }
      },
      writable: true,
      enumerable: true,
      configurable: true
    }
  });

  return DefaultEventStrategy;
})();

var EventManager = (function () {
  function EventManager() {
    this.elementHandlerLookup = {};
    this.eventStrategyLookup = {};

    this.registerElementConfig({
      tagName: "input",
      properties: {
        value: ["change", "input"],
        checked: ["change", "input"]
      }
    });

    this.registerElementConfig({
      tagName: "textarea",
      properties: {
        value: ["change", "input"]
      }
    });

    this.registerElementConfig({
      tagName: "select",
      properties: {
        value: ["change"]
      }
    });

    this.defaultEventStrategy = new DefaultEventStrategy();
  }

  _prototypeProperties(EventManager, null, {
    registerElementConfig: {
      value: function registerElementConfig(config) {
        this.elementHandlerLookup[config.tagName.toLowerCase()] = {
          subscribe: function subscribe(target, property, callback) {
            var events = config.properties[property];
            if (events) {
              events.forEach(function (changeEvent) {
                target.addEventListener(changeEvent, callback, false);
              });

              return function () {
                events.forEach(function (changeEvent) {
                  target.removeEventListener(changeEvent, callback);
                });
              };
            } else {
              throw new Error("Cannot observe property " + property + " of " + config.tagName + ". No events found.");
            }
          }
        };
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    registerElementHandler: {
      value: function registerElementHandler(tagName, handler) {
        this.elementHandlerLookup[tagName.toLowerCase()] = handler;
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    registerEventStrategy: {
      value: function registerEventStrategy(eventName, strategy) {
        this.eventStrategyLookup[eventName] = strategy;
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    getElementHandler: {
      value: function getElementHandler(target) {
        if (target.tagName) {
          var handler = this.elementHandlerLookup[target.tagName.toLowerCase()];
          if (handler) {
            return handler;
          }
        }

        return null;
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    addEventListener: {
      value: function addEventListener(target, targetEvent, callback, delegate) {
        return (this.eventStrategyLookup[targetEvent] || this.defaultEventStrategy).subscribe(target, targetEvent, callback, delegate);
      },
      writable: true,
      enumerable: true,
      configurable: true
    }
  });

  return EventManager;
})();

exports.EventManager = EventManager;