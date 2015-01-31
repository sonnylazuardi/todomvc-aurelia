/* */ 
System.register([], function (_export) {
  "use strict";

  var _prototypeProperties, CallExpression, Call;
  return {
    setters: [],
    execute: function () {
      _prototypeProperties = function (child, staticProps, instanceProps) {
        if (staticProps) Object.defineProperties(child, staticProps);
        if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
      };

      CallExpression = (function () {
        function CallExpression(observerLocator, targetProperty, sourceExpression, valueConverterLookupFunction) {
          this.observerLocator = observerLocator;
          this.targetProperty = targetProperty;
          this.sourceExpression = sourceExpression;
          this.valueConverterLookupFunction = valueConverterLookupFunction;
        }

        _prototypeProperties(CallExpression, null, {
          createBinding: {
            value: function createBinding(target) {
              return new Call(this.observerLocator, this.sourceExpression, target, this.targetProperty, this.valueConverterLookupFunction);
            },
            writable: true,
            enumerable: true,
            configurable: true
          }
        });

        return CallExpression;
      })();
      _export("CallExpression", CallExpression);

      Call = (function () {
        function Call(observerLocator, sourceExpression, target, targetProperty, valueConverterLookupFunction) {
          this.sourceExpression = sourceExpression;
          this.target = target;
          this.targetProperty = observerLocator.getObserver(target, targetProperty);
          this.valueConverterLookupFunction = valueConverterLookupFunction;
        }

        _prototypeProperties(Call, null, {
          bind: {
            value: function bind(source) {
              var _this = this;
              if (this.source === source) {
                return;
              }

              if (this.source) {
                this.unbind();
              }

              this.source = source;
              this.targetProperty.setValue(function () {
                for (var _len = arguments.length, rest = Array(_len), _key = 0; _key < _len; _key++) {
                  rest[_key] = arguments[_key];
                }

                return _this.sourceExpression.evaluate(source, _this.valueConverterLookupFunction, rest);
              });
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          unbind: {
            value: function unbind() {
              this.targetProperty.setValue(null);
            },
            writable: true,
            enumerable: true,
            configurable: true
          }
        });

        return Call;
      })();
    }
  };
});