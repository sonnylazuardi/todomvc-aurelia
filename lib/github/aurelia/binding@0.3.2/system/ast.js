/* */ 
System.register(["./path-observer", "./composite-observer"], function (_export) {
  "use strict";

  var PathObserver, CompositeObserver, _get, _inherits, _prototypeProperties, Expression, Chain, ValueConverter, Assign, Conditional, AccessScope, AccessMember, AccessKeyed, CallScope, CallMember, CallFunction, Binary, PrefixNot, LiteralPrimitive, LiteralString, LiteralArray, LiteralObject, Unparser, evalListCache;
  function evalList(scope, list, valueConverters) {
    var length = list.length,
        cacheLength,
        i;

    for (cacheLength = evalListCache.length; cacheLength <= length; ++cacheLength) {
      _evalListCache.push([]);
    }

    var result = evalListCache[length];

    for (i = 0; i < length; ++i) {
      result[i] = list[i].evaluate(scope, valueConverters);
    }

    return result;
  }

  function autoConvertAdd(a, b) {
    if (a != null && b != null) {
      if (typeof a == "string" && typeof b != "string") {
        return a + b.toString();
      }

      if (typeof a != "string" && typeof b == "string") {
        return a.toString() + b;
      }

      return a + b;
    }

    if (a != null) {
      return a;
    }

    if (b != null) {
      return b;
    }

    return 0;
  }

  function ensureFunctionFromMap(obj, name) {
    var func = obj[name];

    if (typeof func === "function") {
      return func;
    }

    if (func === null) {
      throw new Error("Undefined function " + name);
    } else {
      throw new Error("" + name + " is not a function");
    }
  }

  function getKeyed(obj, key) {
    if (Array.isArray(obj)) {
      return obj[parseInt(key)];
    } else if (obj) {
      return obj[key];
    } else if (obj === null) {
      throw new Error("Accessing null object");
    } else {
      return obj[key];
    }
  }

  function setKeyed(obj, key, value) {
    if (Array.isArray(obj)) {
      var index = parseInt(key);

      if (obj.length <= index) {
        obj.length = index + 1;
      }

      obj[index] = value;
    } else {
      obj[key] = value;
    }

    return value;
  }
  return {
    setters: [function (_pathObserver) {
      PathObserver = _pathObserver.PathObserver;
    }, function (_compositeObserver) {
      CompositeObserver = _compositeObserver.CompositeObserver;
    }],
    execute: function () {
      _get = function get(object, property, receiver) {
        var desc = Object.getOwnPropertyDescriptor(object, property);

        if (desc === undefined) {
          var parent = Object.getPrototypeOf(object);

          if (parent === null) {
            return undefined;
          } else {
            return get(parent, property, receiver);
          }
        } else if ("value" in desc && desc.writable) {
          return desc.value;
        } else {
          var getter = desc.get;
          if (getter === undefined) {
            return undefined;
          }
          return getter.call(receiver);
        }
      };

      _inherits = function (subClass, superClass) {
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

      _prototypeProperties = function (child, staticProps, instanceProps) {
        if (staticProps) Object.defineProperties(child, staticProps);
        if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
      };

      Expression = (function () {
        function Expression() {
          this.isChain = false;
          this.isAssignable = false;
        }

        _prototypeProperties(Expression, null, {
          evaluate: {
            value: function evaluate() {
              throw new Error("Cannot evaluate " + this);
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          assign: {
            value: function assign() {
              throw new Error("Cannot assign to " + this);
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          toString: {
            value: function toString() {
              return Unparser.unparse(this);
            },
            writable: true,
            enumerable: true,
            configurable: true
          }
        });

        return Expression;
      })();
      _export("Expression", Expression);

      Chain = (function (Expression) {
        function Chain(expressions) {
          _get(Object.getPrototypeOf(Chain.prototype), "constructor", this).call(this);

          this.expressions = expressions;
          this.isChain = true;
        }

        _inherits(Chain, Expression);

        _prototypeProperties(Chain, null, {
          evaluate: {
            value: function evaluate(scope, valueConverters) {
              var result,
                  expressions = this.expressions,
                  length = expressions.length,
                  i,
                  last;

              for (i = 0; i < length; ++i) {
                last = expressions[i].evaluate(scope, valueConverters);

                if (last !== null) {
                  result = last;
                }
              }

              return result;
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          accept: {
            value: function accept(visitor) {
              visitor.visitChain(this);
            },
            writable: true,
            enumerable: true,
            configurable: true
          }
        });

        return Chain;
      })(Expression);
      _export("Chain", Chain);

      ValueConverter = (function (Expression) {
        function ValueConverter(expression, name, args, allArgs) {
          _get(Object.getPrototypeOf(ValueConverter.prototype), "constructor", this).call(this);

          this.expression = expression;
          this.name = name;
          this.args = args;
          this.allArgs = allArgs;
        }

        _inherits(ValueConverter, Expression);

        _prototypeProperties(ValueConverter, null, {
          evaluate: {
            value: function evaluate(scope, valueConverters) {
              var converter = valueConverters(this.name);
              if (!converter) {
                throw new Error("No ValueConverter named \"" + this.name + "\" was found!");
              }

              if ("toView" in converter) {
                return converter.toView.apply(converter, evalList(scope, this.allArgs, valueConverters));
              }

              return this.allArgs[0].evaluate(scope, valueConverters);
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          assign: {
            value: function assign(scope, value, valueConverters) {
              var converter = valueConverters(this.name);
              if (!converter) {
                throw new Error("No ValueConverter named \"" + this.name + "\" was found!");
              }

              if ("fromView" in converter) {
                value = converter.fromView.apply(converter, [value].concat(evalList(scope, this.args, valueConverters)));
              }

              return this.allArgs[0].assign(scope, value, valueConverters);
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          accept: {
            value: function accept(visitor) {
              visitor.visitValueConverter(this);
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          connect: {
            value: function connect(binding, scope) {
              var _this = this;
              var observer,
                  childObservers = [],
                  i,
                  ii,
                  exp,
                  expInfo;

              for (i = 0, ii = this.allArgs.length; i < ii; ++i) {
                exp = this.allArgs[i];
                expInfo = exp.connect(binding, scope);

                if (expInfo.observer) {
                  childObservers.push(expInfo.observer);
                }
              }

              if (childObservers.length) {
                observer = new CompositeObserver(childObservers, function () {
                  return _this.evaluate(scope, binding.valueConverterLookupFunction);
                });
              }

              return {
                value: this.evaluate(scope, binding.valueConverterLookupFunction),
                observer: observer
              };
            },
            writable: true,
            enumerable: true,
            configurable: true
          }
        });

        return ValueConverter;
      })(Expression);
      _export("ValueConverter", ValueConverter);

      Assign = (function (Expression) {
        function Assign(target, value) {
          _get(Object.getPrototypeOf(Assign.prototype), "constructor", this).call(this);

          this.target = target;
          this.value = value;
        }

        _inherits(Assign, Expression);

        _prototypeProperties(Assign, null, {
          evaluate: {
            value: function evaluate(scope, valueConverters) {
              return this.target.assign(scope, this.value.evaluate(scope, valueConverters));
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          accept: {
            value: function accept(vistor) {
              vistor.visitAssign(this);
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          connect: {
            value: function connect(binding, scope) {
              return { value: this.evaluate(scope, binding.valueConverterLookupFunction) };
            },
            writable: true,
            enumerable: true,
            configurable: true
          }
        });

        return Assign;
      })(Expression);
      _export("Assign", Assign);

      Conditional = (function (Expression) {
        function Conditional(condition, yes, no) {
          _get(Object.getPrototypeOf(Conditional.prototype), "constructor", this).call(this);

          this.condition = condition;
          this.yes = yes;
          this.no = no;
        }

        _inherits(Conditional, Expression);

        _prototypeProperties(Conditional, null, {
          evaluate: {
            value: function evaluate(scope, valueConverters) {
              return !!this.condition.evaluate(scope) ? this.yes.evaluate(scope) : this.no.evaluate(scope);
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          accept: {
            value: function accept(visitor) {
              visitor.visitConditional(this);
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          connect: {
            value: function connect(binding, scope) {
              var _this2 = this;
              var conditionInfo = this.condition.connect(binding, scope),
                  yesInfo = this.yes.connect(binding, scope),
                  noInfo = this.no.connect(binding, scope),
                  childObservers = [],
                  observer;

              if (conditionInfo.observer) {
                childObservers.push(conditionInfo.observer);
              }

              if (yesInfo.observer) {
                childObservers.push(yesInfo.observer);
              }

              if (noInfo.observer) {
                childObservers.push(noInfo.observer);
              }

              if (childObservers.length) {
                observer = new CompositeObserver(childObservers, function () {
                  return _this2.evaluate(scope, binding.valueConverterLookupFunction);
                });
              }

              return {
                value: !!conditionInfo.value ? yesInfo.value : noInfo.value,
                observer: observer
              };
            },
            writable: true,
            enumerable: true,
            configurable: true
          }
        });

        return Conditional;
      })(Expression);
      _export("Conditional", Conditional);

      AccessScope = (function (Expression) {
        function AccessScope(name) {
          _get(Object.getPrototypeOf(AccessScope.prototype), "constructor", this).call(this);

          this.name = name;
          this.isAssignable = true;
        }

        _inherits(AccessScope, Expression);

        _prototypeProperties(AccessScope, null, {
          evaluate: {
            value: function evaluate(scope, valueConverters) {
              return scope[this.name];
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          assign: {
            value: function assign(scope, value) {
              return scope[this.name] = value;
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          accept: {
            value: function accept(visitor) {
              visitor.visitAccessScope(this);
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          connect: {
            value: function connect(binding, scope) {
              var observer = binding.getObserver(scope, this.name);

              return {
                value: observer.getValue(),
                observer: observer
              };
            },
            writable: true,
            enumerable: true,
            configurable: true
          }
        });

        return AccessScope;
      })(Expression);
      _export("AccessScope", AccessScope);

      AccessMember = (function (Expression) {
        function AccessMember(object, name) {
          _get(Object.getPrototypeOf(AccessMember.prototype), "constructor", this).call(this);

          this.object = object;
          this.name = name;
          this.isAssignable = true;
        }

        _inherits(AccessMember, Expression);

        _prototypeProperties(AccessMember, null, {
          evaluate: {
            value: function evaluate(scope, valueConverters) {
              var instance = this.object.evaluate(scope, valueConverters);
              return instance === null ? null : instance[this.name];
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          assign: {
            value: function assign(scope, value) {
              var instance = this.object.evaluate(scope);

              if (!instance) {
                instance = {};
                this.object.assign(scope, instance);
              }

              return instance[this.name] = value;
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          accept: {
            value: function accept(visitor) {
              visitor.visitAccessMember(this);
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          connect: {
            value: function connect(binding, scope) {
              var _this3 = this;
              var info = this.object.connect(binding, scope),
                  objectInstance = info.value,
                  objectObserver = info.observer,
                  observer;

              if (objectObserver) {
                observer = new PathObserver(objectObserver, function (value) {
                  if (value == null) {
                    return null;
                  }

                  return binding.getObserver(value, _this3.name);
                }, objectInstance);
              } else {
                observer = binding.getObserver(objectInstance, this.name);
              }

              return {
                value: objectInstance == null ? null : objectInstance[this.name],
                observer: observer
              };
            },
            writable: true,
            enumerable: true,
            configurable: true
          }
        });

        return AccessMember;
      })(Expression);
      _export("AccessMember", AccessMember);

      AccessKeyed = (function (Expression) {
        function AccessKeyed(object, key) {
          _get(Object.getPrototypeOf(AccessKeyed.prototype), "constructor", this).call(this);

          this.object = object;
          this.key = key;
          this.isAssignable = true;
        }

        _inherits(AccessKeyed, Expression);

        _prototypeProperties(AccessKeyed, null, {
          evaluate: {
            value: function evaluate(scope, valueConverters) {
              var instance = this.object.evaluate(scope, valueConverters);
              var lookup = this.key.evaluate(scope, valueConverters);
              return getKeyed(instance, lookup);
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          assign: {
            value: function assign(scope, value) {
              var instance = this.object.evaluate(scope);
              var lookup = this.key.evaluate(scope);
              return setKeyed(instance, lookup, value);
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          accept: {
            value: function accept(visitor) {
              visitor.visitAccessKeyed(this);
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          connect: {
            value: function connect(binding, scope) {
              var _this4 = this;
              var objectInfo = this.object.connect(binding, scope),
                  keyInfo = this.key.connect(binding, scope),
                  childObservers = [],
                  observer;

              if (objectInfo.observer) {
                childObservers.push(objectInfo.observer);
              }

              if (keyInfo.observer) {
                childObservers.push(keyInfo.observer);
              }

              if (childObservers.length) {
                observer = new CompositeObserver(childObservers, function () {
                  return _this4.evaluate(scope, binding.valueConverterLookupFunction);
                });
              }

              return {
                value: this.evaluate(scope, binding.valueConverterLookupFunction),
                observer: observer
              };
            },
            writable: true,
            enumerable: true,
            configurable: true
          }
        });

        return AccessKeyed;
      })(Expression);
      _export("AccessKeyed", AccessKeyed);

      CallScope = (function (Expression) {
        function CallScope(name, args) {
          _get(Object.getPrototypeOf(CallScope.prototype), "constructor", this).call(this);

          this.name = name;
          this.args = args;
        }

        _inherits(CallScope, Expression);

        _prototypeProperties(CallScope, null, {
          evaluate: {
            value: function evaluate(scope, valueConverters, args) {
              args = args || evalList(scope, this.args, valueConverters);
              return ensureFunctionFromMap(scope, this.name).apply(scope, args);
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          accept: {
            value: function accept(visitor) {
              visitor.visitCallScope(this);
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          connect: {
            value: function connect(binding, scope) {
              var _this5 = this;
              var observer,
                  childObservers = [],
                  i,
                  ii,
                  exp,
                  expInfo;

              for (i = 0, ii = this.args.length; i < ii; ++i) {
                exp = this.args[i];
                expInfo = exp.connect(binding, scope);

                if (expInfo.observer) {
                  childObservers.push(expInfo.observer);
                }
              }

              if (childObservers.length) {
                observer = new CompositeObserver(childObservers, function () {
                  return _this5.evaluate(scope, binding.valueConverterLookupFunction);
                });
              }

              return {
                value: this.evaluate(scope, binding.valueConverterLookupFunction),
                observer: observer
              };
            },
            writable: true,
            enumerable: true,
            configurable: true
          }
        });

        return CallScope;
      })(Expression);
      _export("CallScope", CallScope);

      CallMember = (function (Expression) {
        function CallMember(object, name, args) {
          _get(Object.getPrototypeOf(CallMember.prototype), "constructor", this).call(this);

          this.object = object;
          this.name = name;
          this.args = args;
        }

        _inherits(CallMember, Expression);

        _prototypeProperties(CallMember, null, {
          evaluate: {
            value: function evaluate(scope, valueConverters, args) {
              var instance = this.object.evaluate(scope, valueConverters);
              args = args || evalList(scope, this.args, valueConverters);
              return ensureFunctionFromMap(instance, this.name).apply(instance, args);
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          accept: {
            value: function accept(visitor) {
              visitor.visitCallMember(this);
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          connect: {
            value: function connect(binding, scope) {
              var _this6 = this;
              var observer,
                  objectInfo = this.object.connect(binding, scope),
                  childObservers = [],
                  i,
                  ii,
                  exp,
                  expInfo;

              if (objectInfo.observer) {
                childObservers.push(objectInfo.observer);
              }

              for (i = 0, ii = this.args.length; i < ii; ++i) {
                exp = this.args[i];
                expInfo = exp.connect(binding, scope);

                if (expInfo.observer) {
                  childObservers.push(expInfo.observer);
                }
              }

              if (childObservers.length) {
                observer = new CompositeObserver(childObservers, function () {
                  return _this6.evaluate(scope, binding.valueConverterLookupFunction);
                });
              }

              return {
                value: this.evaluate(scope, binding.valueConverterLookupFunction),
                observer: observer
              };
            },
            writable: true,
            enumerable: true,
            configurable: true
          }
        });

        return CallMember;
      })(Expression);
      _export("CallMember", CallMember);

      CallFunction = (function (Expression) {
        function CallFunction(func, args) {
          _get(Object.getPrototypeOf(CallFunction.prototype), "constructor", this).call(this);

          this.func = func;
          this.args = args;
        }

        _inherits(CallFunction, Expression);

        _prototypeProperties(CallFunction, null, {
          evaluate: {
            value: function evaluate(scope, valueConverters, args) {
              var func = this.func.evaluate(scope, valueConverters);

              if (typeof func !== "function") {
                throw new Error("" + this.func + " is not a function");
              } else {
                return func.apply(null, args || evalList(scope, this.args, valueConverters));
              }
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          accept: {
            value: function accept(visitor) {
              visitor.visitCallFunction(this);
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          connect: {
            value: function connect(binding, scope) {
              var _this7 = this;
              var observer,
                  funcInfo = this.func.connect(binding, scope),
                  childObservers = [],
                  i,
                  ii,
                  exp,
                  expInfo;

              if (funcInfo.observer) {
                childObservers.push(funcInfo.observer);
              }

              for (i = 0, ii = this.args.length; i < ii; ++i) {
                exp = this.args[i];
                expInfo = exp.connect(binding, scope);

                if (expInfo.observer) {
                  childObservers.push(expInfo.observer);
                }
              }

              if (childObservers.length) {
                observer = new CompositeObserver(childObservers, function () {
                  return _this7.evaluate(scope, binding.valueConverterLookupFunction);
                });
              }

              return {
                value: this.evaluate(scope, binding.valueConverterLookupFunction),
                observer: observer
              };
            },
            writable: true,
            enumerable: true,
            configurable: true
          }
        });

        return CallFunction;
      })(Expression);
      _export("CallFunction", CallFunction);

      Binary = (function (Expression) {
        function Binary(operation, left, right) {
          _get(Object.getPrototypeOf(Binary.prototype), "constructor", this).call(this);

          this.operation = operation;
          this.left = left;
          this.right = right;
        }

        _inherits(Binary, Expression);

        _prototypeProperties(Binary, null, {
          evaluate: {
            value: function evaluate(scope, valueConverters) {
              var left = this.left.evaluate(scope);

              switch (this.operation) {
                case "&&":
                  return !!left && !!this.right.evaluate(scope);
                case "||":
                  return !!left || !!this.right.evaluate(scope);
              }

              var right = this.right.evaluate(scope);

              if (left === null || right === null) {
                switch (this.operation) {
                  case "+":
                    if (left != null) return left;
                    if (right != null) return right;
                    return 0;
                  case "-":
                    if (left != null) return left;
                    if (right != null) return 0 - right;
                    return 0;
                }

                return null;
              }

              switch (this.operation) {
                case "+":
                  return autoConvertAdd(left, right);
                case "-":
                  return left - right;
                case "*":
                  return left * right;
                case "/":
                  return left / right;
                case "%":
                  return left % right;
                case "==":
                  return left == right;
                case "===":
                  return left === right;
                case "!=":
                  return left != right;
                case "!==":
                  return left !== right;
                case "<":
                  return left < right;
                case ">":
                  return left > right;
                case "<=":
                  return left <= right;
                case ">=":
                  return left >= right;
                case "^":
                  return left ^ right;
                case "&":
                  return left & right;
              }

              throw new Error("Internal error [" + this.operation + "] not handled");
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          accept: {
            value: function accept(visitor) {
              visitor.visitBinary(this);
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          connect: {
            value: function connect(binding, scope) {
              var _this8 = this;
              var leftInfo = this.left.connect(binding, scope),
                  rightInfo = this.right.connect(binding, scope),
                  childObservers = [],
                  observer;

              if (leftInfo.observer) {
                childObservers.push(leftInfo.observer);
              }

              if (rightInfo.observer) {
                childObservers.push(rightInfo.observer);
              }

              if (childObservers.length) {
                observer = new CompositeObserver(childObservers, function () {
                  return _this8.evaluate(scope, binding.valueConverterLookupFunction);
                });
              }

              return {
                value: this.evaluate(scope, binding.valueConverterLookupFunction),
                observer: observer
              };
            },
            writable: true,
            enumerable: true,
            configurable: true
          }
        });

        return Binary;
      })(Expression);
      _export("Binary", Binary);

      PrefixNot = (function (Expression) {
        function PrefixNot(operation, expression) {
          _get(Object.getPrototypeOf(PrefixNot.prototype), "constructor", this).call(this);

          this.operation = operation;
          this.expression = expression;
        }

        _inherits(PrefixNot, Expression);

        _prototypeProperties(PrefixNot, null, {
          evaluate: {
            value: function evaluate(scope, valueConverters) {
              return !this.expression.evaluate(scope);
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          accept: {
            value: function accept(visitor) {
              visitor.visitPrefix(this);
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          connect: {
            value: function connect(binding, scope) {
              var _this9 = this;
              var info = this.expression.connect(binding, scope),
                  observer;

              if (info.observer) {
                observer = new CompositeObserver([info.observer], function () {
                  return _this9.evaluate(scope, binding.valueConverterLookupFunction);
                });
              }

              return {
                value: !info.value,
                observer: observer
              };
            },
            writable: true,
            enumerable: true,
            configurable: true
          }
        });

        return PrefixNot;
      })(Expression);
      _export("PrefixNot", PrefixNot);

      LiteralPrimitive = (function (Expression) {
        function LiteralPrimitive(value) {
          _get(Object.getPrototypeOf(LiteralPrimitive.prototype), "constructor", this).call(this);

          this.value = value;
        }

        _inherits(LiteralPrimitive, Expression);

        _prototypeProperties(LiteralPrimitive, null, {
          evaluate: {
            value: function evaluate(scope, valueConverters) {
              return this.value;
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          accept: {
            value: function accept(visitor) {
              visitor.visitLiteralPrimitive(this);
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          connect: {
            value: function connect(binding, scope) {
              return { value: this.value };
            },
            writable: true,
            enumerable: true,
            configurable: true
          }
        });

        return LiteralPrimitive;
      })(Expression);
      _export("LiteralPrimitive", LiteralPrimitive);

      LiteralString = (function (Expression) {
        function LiteralString(value) {
          _get(Object.getPrototypeOf(LiteralString.prototype), "constructor", this).call(this);

          this.value = value;
        }

        _inherits(LiteralString, Expression);

        _prototypeProperties(LiteralString, null, {
          evaluate: {
            value: function evaluate(scope, valueConverters) {
              return this.value;
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          accept: {
            value: function accept(visitor) {
              visitor.visitLiteralString(this);
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          connect: {
            value: function connect(binding, scope) {
              return { value: this.value };
            },
            writable: true,
            enumerable: true,
            configurable: true
          }
        });

        return LiteralString;
      })(Expression);
      _export("LiteralString", LiteralString);

      LiteralArray = (function (Expression) {
        function LiteralArray(elements) {
          _get(Object.getPrototypeOf(LiteralArray.prototype), "constructor", this).call(this);

          this.elements = elements;
        }

        _inherits(LiteralArray, Expression);

        _prototypeProperties(LiteralArray, null, {
          evaluate: {
            value: function evaluate(scope, valueConverters) {
              var elements = this.elements,
                  length = elements.length,
                  result = [],
                  i;

              for (i = 0; i < length; ++i) {
                result[i] = elements[i].evaluate(scope, valueConverters);
              }

              return result;
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          accept: {
            value: function accept(visitor) {
              visitor.visitLiteralArray(this);
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          connect: {
            value: function connect(binding, scope) {
              var _this10 = this;
              var observer,
                  childObservers = [],
                  results = [],
                  i,
                  ii,
                  exp,
                  expInfo;

              for (i = 0, ii = this.elements.length; i < ii; ++i) {
                exp = this.elements[i];
                expInfo = exp.connect(binding, scope);

                if (expInfo.observer) {
                  childObservers.push(expInfo.observer);
                }

                results[i] = expInfo.value;
              }

              if (childObservers.length) {
                observer = new CompositeObserver(childObservers, function () {
                  return _this10.evaluate(scope, binding.valueConverterLookupFunction);
                });
              }

              return {
                value: results,
                observer: observer
              };
            },
            writable: true,
            enumerable: true,
            configurable: true
          }
        });

        return LiteralArray;
      })(Expression);
      _export("LiteralArray", LiteralArray);

      LiteralObject = (function (Expression) {
        function LiteralObject(keys, values) {
          _get(Object.getPrototypeOf(LiteralObject.prototype), "constructor", this).call(this);

          this.keys = keys;
          this.values = values;
        }

        _inherits(LiteralObject, Expression);

        _prototypeProperties(LiteralObject, null, {
          evaluate: {
            value: function evaluate(scope, valueConverters) {
              var instance = {},
                  keys = this.keys,
                  values = this.values,
                  length = keys.length,
                  i;

              for (i = 0; i < length; ++i) {
                instance[keys[i]] = values[i].evaluate(scope, valueConverters);
              }

              return instance;
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          accept: {
            value: function accept(visitor) {
              visitor.visitLiteralObject(this);
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          connect: {
            value: function connect(binding, scope) {
              var _this11 = this;
              var observer,
                  childObservers = [],
                  instance = {},
                  keys = this.keys,
                  values = this.values,
                  length = keys.length,
                  i,
                  valueInfo;

              for (i = 0; i < length; ++i) {
                valueInfo = values[i].connect(binding, scope);

                if (valueInfo.observer) {
                  childObservers.push(valueInfo.observer);
                }

                instance[keys[i]] = valueInfo.value;
              }

              if (childObservers.length) {
                observer = new CompositeObserver(childObservers, function () {
                  return _this11.evaluate(scope, binding.valueConverterLookupFunction);
                });
              }

              return {
                value: instance,
                observer: observer
              };
            },
            writable: true,
            enumerable: true,
            configurable: true
          }
        });

        return LiteralObject;
      })(Expression);
      _export("LiteralObject", LiteralObject);

      Unparser = (function () {
        function Unparser(buffer) {
          this.buffer = buffer;
        }

        _prototypeProperties(Unparser, {
          unparse: {
            value: function unparse(expression) {
              var buffer = [],
                  visitor = new Unparser(buffer);

              expression.accept(visitor);

              return buffer.join("");
            },
            writable: true,
            enumerable: true,
            configurable: true
          }
        }, {
          write: {
            value: function write(text) {
              this.buffer.push(text);
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          writeArgs: {
            value: function writeArgs(args) {
              var i, length;

              this.write("(");

              for (i = 0, length = args.length; i < length; ++i) {
                if (i !== 0) {
                  this.write(",");
                }

                args[i].accept(this);
              }

              this.write(")");
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          visitChain: {
            value: function visitChain(chain) {
              var expressions = chain.expressions,
                  length = expressions.length,
                  i;

              for (i = 0; i < length; ++i) {
                if (i !== 0) {
                  this.write(";");
                }

                expressions[i].accept(this);
              }
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          visitValueConverter: {
            value: function visitValueConverter(converter) {
              var args = converter.args,
                  length = args.length,
                  i;

              this.write("(");
              converter.expression.accept(this);
              this.write("|" + converter.name);

              for (i = 0; i < length; ++i) {
                this.write(" :");
                args[i].accept(this);
              }

              this.write(")");
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          visitAssign: {
            value: function visitAssign(assign) {
              assign.target.accept(this);
              this.write("=");
              assign.value.accept(this);
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          visitConditional: {
            value: function visitConditional(conditional) {
              conditional.condition.accept(this);
              this.write("?");
              conditional.yes.accept(this);
              this.write(":");
              conditional.no.accept(this);
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          visitAccessScope: {
            value: function visitAccessScope(access) {
              this.write(access.name);
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          visitAccessMember: {
            value: function visitAccessMember(access) {
              access.object.accept(this);
              this.write("." + access.name);
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          visitAccessKeyed: {
            value: function visitAccessKeyed(access) {
              access.object.accept(this);
              this.write("[");
              access.key.accept(this);
              this.write("]");
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          visitCallScope: {
            value: function visitCallScope(call) {
              this.write(call.name);
              this.writeArgs(call.args);
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          visitCallFunction: {
            value: function visitCallFunction(call) {
              call.func.accept(this);
              this.writeArgs(call.args);
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          visitCallMember: {
            value: function visitCallMember(call) {
              call.object.accept(this);
              this.write("." + call.name);
              this.writeArgs(call.args);
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          visitPrefix: {
            value: function visitPrefix(prefix) {
              this.write("(" + prefix.operation);
              prefix.expression.accept(this);
              this.write(")");
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          visitBinary: {
            value: function visitBinary(binary) {
              this.write("(");
              binary.left.accept(this);
              this.write(binary.operation);
              binary.right.accept(this);
              this.write(")");
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          visitLiteralPrimitive: {
            value: function visitLiteralPrimitive(literal) {
              this.write("" + literal.value);
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          visitLiteralArray: {
            value: function visitLiteralArray(literal) {
              var elements = literal.elements,
                  length = elements.length,
                  i;

              this.write("[");

              for (i = 0; i < length; ++i) {
                if (i !== 0) {
                  this.write(",");
                }

                elements[i].accept(this);
              }

              this.write("]");
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          visitLiteralObject: {
            value: function visitLiteralObject(literal) {
              var keys = literal.keys,
                  values = literal.values,
                  length = keys.length,
                  i;

              this.write("{");

              for (i = 0; i < length; ++i) {
                if (i !== 0) {
                  this.write(",");
                }

                this.write("'" + keys[i] + "':");
                values[i].accept(this);
              }

              this.write("}");
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          visitLiteralString: {
            value: function visitLiteralString(literal) {
              var escaped = literal.value.replace(/'/g, "'");
              this.write("'" + escaped + "'");
            },
            writable: true,
            enumerable: true,
            configurable: true
          }
        });

        return Unparser;
      })();
      _export("Unparser", Unparser);

      evalListCache = [[], [0], [0, 0], [0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0, 0]];
    }
  };
});