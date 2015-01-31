/* */ 
"format register";
define(["exports","./binding-modes"], function (exports, _bindingModes) {
  "use strict";

  var _prototypeProperties = function (child, staticProps, instanceProps) {
    if (staticProps) Object.defineProperties(child, staticProps);
    if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
  };

  var ONE_WAY = _bindingModes.ONE_WAY;
  var TWO_WAY = _bindingModes.TWO_WAY;
  var BindingExpression = (function () {
    function BindingExpression(observerLocator, targetProperty, sourceExpression, mode, valueConverterLookupFunction, attribute) {
      this.observerLocator = observerLocator;
      this.targetProperty = targetProperty;
      this.sourceExpression = sourceExpression;
      this.mode = mode;
      this.valueConverterLookupFunction = valueConverterLookupFunction;
      this.attribute = attribute;
      this.discrete = false;
    }

    _prototypeProperties(BindingExpression, null, {
      createBinding: {
        value: function createBinding(target) {
          return new Binding(this.observerLocator, this.sourceExpression, target, this.targetProperty, this.mode, this.valueConverterLookupFunction);
        },
        writable: true,
        enumerable: true,
        configurable: true
      }
    });

    return BindingExpression;
  })();

  exports.BindingExpression = BindingExpression;
  var Binding = (function () {
    function Binding(observerLocator, sourceExpression, target, targetProperty, mode, valueConverterLookupFunction) {
      this.observerLocator = observerLocator;
      this.sourceExpression = sourceExpression;
      this.targetProperty = observerLocator.getObserver(target, targetProperty);
      this.mode = mode;
      this.valueConverterLookupFunction = valueConverterLookupFunction;
    }

    _prototypeProperties(Binding, null, {
      getObserver: {
        value: function getObserver(obj, propertyName) {
          return this.observerLocator.getObserver(obj, propertyName);
        },
        writable: true,
        enumerable: true,
        configurable: true
      },
      bind: {
        value: function bind(source) {
          var _this = this;
          var targetProperty = this.targetProperty,
              info;

          if (this.mode == ONE_WAY || this.mode == TWO_WAY) {
            if (this._disposeObserver) {
              if (this.source === source) {
                return;
              }

              this.unbind();
            }

            info = this.sourceExpression.connect(this, source);

            if (info.observer) {
              this._disposeObserver = info.observer.subscribe(function (newValue) {
                var existing = targetProperty.getValue();
                if (newValue !== existing) {
                  targetProperty.setValue(newValue);
                }
              });
            }

            if (info.value !== undefined) {
              targetProperty.setValue(info.value);
            }

            if (this.mode == TWO_WAY) {
              this._disposeListener = targetProperty.subscribe(function (newValue) {
                _this.sourceExpression.assign(source, newValue, _this.valueConverterLookupFunction);
              });
            }

            this.source = source;
          } else {
            var value = this.sourceExpression.evaluate(source, this.valueConverterLookupFunction);

            if (value !== undefined) {
              targetProperty.setValue(value);
            }
          }
        },
        writable: true,
        enumerable: true,
        configurable: true
      },
      unbind: {
        value: function unbind() {
          if (this._disposeObserver) {
            this._disposeObserver();
            this._disposeObserver = null;
          }

          if (this._disposeListener) {
            this._disposeListener();
            this._disposeListener = null;
          }
        },
        writable: true,
        enumerable: true,
        configurable: true
      }
    });

    return Binding;
  })();
});