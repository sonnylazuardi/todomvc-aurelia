/* */ 
"format register";
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) {
  if (staticProps) Object.defineProperties(child, staticProps);
  if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
};

var Lexer = require("./lexer").Lexer;
var Token = require("./lexer").Token;
var Expression = require("./ast").Expression;
var ArrayOfExpression = require("./ast").ArrayOfExpression;
var Chain = require("./ast").Chain;
var ValueConverter = require("./ast").ValueConverter;
var Assign = require("./ast").Assign;
var Conditional = require("./ast").Conditional;
var AccessScope = require("./ast").AccessScope;
var AccessMember = require("./ast").AccessMember;
var AccessKeyed = require("./ast").AccessKeyed;
var CallScope = require("./ast").CallScope;
var CallFunction = require("./ast").CallFunction;
var CallMember = require("./ast").CallMember;
var PrefixNot = require("./ast").PrefixNot;
var Binary = require("./ast").Binary;
var LiteralPrimitive = require("./ast").LiteralPrimitive;
var LiteralArray = require("./ast").LiteralArray;
var LiteralObject = require("./ast").LiteralObject;
var LiteralString = require("./ast").LiteralString;


var EOF = new Token(-1, null);

var Parser = (function () {
  function Parser() {
    this.cache = {};
    this.lexer = new Lexer();
  }

  _prototypeProperties(Parser, null, {
    parse: {
      value: function parse(input) {
        input = input || "";

        return this.cache[input] || (this.cache[input] = new ParserImplementation(this.lexer, input).parseChain());
      },
      writable: true,
      enumerable: true,
      configurable: true
    }
  });

  return Parser;
})();

exports.Parser = Parser;
var ParserImplementation = (function () {
  function ParserImplementation(lexer, input) {
    this.index = 0;
    this.input = input;
    this.tokens = lexer.lex(input);
  }

  _prototypeProperties(ParserImplementation, null, {
    peek: {
      get: function () {
        return this.index < this.tokens.length ? this.tokens[this.index] : EOF;
      },
      enumerable: true,
      configurable: true
    },
    parseChain: {
      value: function parseChain() {
        var isChain = false,
            expressions = [];

        while (this.optional(";")) {
          isChain = true;
        }

        while (this.index < this.tokens.length) {
          if (this.peek.text === ")" || this.peek.text === "}" || this.peek.text === "]") {
            this.error("Unconsumed token " + this.peek.text);
          }

          var expr = this.parseValueConverter();
          expressions.push(expr);

          while (this.optional(";")) {
            isChain = true;
          }

          if (isChain && expr instanceof ValueConverter) {
            this.error("cannot have a value converter in a chain");
          }
        }

        return expressions.length === 1 ? expressions[0] : new Chain(expressions);
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    parseValueConverter: {
      value: function parseValueConverter() {
        var result = this.parseExpression();

        while (this.optional("|")) {
          var name = this.peek.text,
              args = [];

          this.advance();

          while (this.optional(":")) {
            args.push(this.parseExpression());
          }

          result = new ValueConverter(result, name, args, [result].concat(args));
        }

        return result;
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    parseExpression: {
      value: function parseExpression() {
        var start = this.peek.index,
            result = this.parseConditional();

        while (this.peek.text === "=") {
          if (!result.isAssignable) {
            var end = this.index < this.tokens.length ? this.peek.index : this.input.length;
            var expression = this.input.substring(start, end);

            this.error("Expression " + expression + " is not assignable");
          }

          this.expect("=");
          result = new Assign(result, this.parseConditional());
        }

        return result;
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    parseConditional: {
      value: function parseConditional() {
        var start = this.peek.index,
            result = this.parseLogicalOr();

        if (this.optional("?")) {
          var yes = this.parseExpression();

          if (!this.optional(":")) {
            var end = this.index < this.tokens.length ? this.peek.index : this.input.length;
            var expression = this.input.substring(start, end);

            this.error("Conditional expression " + expression + " requires all 3 expressions");
          }

          var no = this.parseExpression();
          result = new Conditional(result, yes, no);
        }

        return result;
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    parseLogicalOr: {
      value: function parseLogicalOr() {
        var result = this.parseLogicalAnd();

        while (this.optional("||")) {
          result = new Binary("||", result, this.parseLogicalAnd());
        }

        return result;
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    parseLogicalAnd: {
      value: function parseLogicalAnd() {
        var result = this.parseEquality();

        while (this.optional("&&")) {
          result = new Binary("&&", result, this.parseEquality());
        }

        return result;
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    parseEquality: {
      value: function parseEquality() {
        var result = this.parseRelational();

        while (true) {
          if (this.optional("==")) {
            result = new Binary("==", result, this.parseRelational());
          } else if (this.optional("!=")) {
            result = new Binary("!=", result, this.parseRelational());
          } else if (this.optional("===")) {
            result = new Binary("===", result, this.parseRelational());
          } else if (this.optional("!==")) {
            result = new Binary("!==", result, this.parseRelational());
          } else {
            return result;
          }
        }
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    parseRelational: {
      value: function parseRelational() {
        var result = this.parseAdditive();

        while (true) {
          if (this.optional("<")) {
            result = new Binary("<", result, this.parseAdditive());
          } else if (this.optional(">")) {
            result = new Binary(">", result, this.parseAdditive());
          } else if (this.optional("<=")) {
            result = new Binary("<=", result, this.parseAdditive());
          } else if (this.optional(">=")) {
            result = new Binary(">=", result, this.parseAdditive());
          } else {
            return result;
          }
        }
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    parseAdditive: {
      value: function parseAdditive() {
        var result = this.parseMultiplicative();

        while (true) {
          if (this.optional("+")) {
            result = new Binary("+", result, this.parseMultiplicative());
          } else if (this.optional("-")) {
            result = new Binary("-", result, this.parseMultiplicative());
          } else {
            return result;
          }
        }
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    parseMultiplicative: {
      value: function parseMultiplicative() {
        var result = this.parsePrefix();

        while (true) {
          if (this.optional("*")) {
            result = new Binary("*", result, this.parsePrefix());
          } else if (this.optional("%")) {
            result = new Binary("%", result, this.parsePrefix());
          } else if (this.optional("/")) {
            result = new Binary("/", result, this.parsePrefix());
          } else {
            return result;
          }
        }
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    parsePrefix: {
      value: function parsePrefix() {
        if (this.optional("+")) {
          return this.parsePrefix();
        } else if (this.optional("-")) {
          return new Binary("-", new LiteralPrimitive(0), this.parsePrefix());
        } else if (this.optional("!")) {
          return new PrefixNot("!", this.parsePrefix());
        } else {
          return this.parseAccessOrCallMember();
        }
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    parseAccessOrCallMember: {
      value: function parseAccessOrCallMember() {
        var result = this.parsePrimary();

        while (true) {
          if (this.optional(".")) {
            var name = this.peek.text;

            this.advance();

            if (this.optional("(")) {
              var args = this.parseExpressionList(")");
              this.expect(")");
              result = new CallMember(result, name, args);
            } else {
              result = new AccessMember(result, name);
            }
          } else if (this.optional("[")) {
            var key = this.parseExpression();
            this.expect("]");
            result = new AccessKeyed(result, key);
          } else if (this.optional("(")) {
            var args = this.parseExpressionList(")");
            this.expect(")");
            result = new CallFunction(result, args);
          } else {
            return result;
          }
        }
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    parsePrimary: {
      value: function parsePrimary() {
        if (this.optional("(")) {
          var result = this.parseExpression();
          this.expect(")");
          return result;
        } else if (this.optional("null") || this.optional("undefined")) {
          return new LiteralPrimitive(null);
        } else if (this.optional("true")) {
          return new LiteralPrimitive(true);
        } else if (this.optional("false")) {
          return new LiteralPrimitive(false);
        } else if (this.optional("[")) {
          var elements = this.parseExpressionList("]");
          this.expect("]");
          return new LiteralArray(elements);
        } else if (this.peek.text == "{") {
          return this.parseObject();
        } else if (this.peek.key != null) {
          return this.parseAccessOrCallScope();
        } else if (this.peek.value != null) {
          var value = this.peek.value;
          this.advance();
          return isNaN(value) ? new LiteralString(value) : new LiteralPrimitive(value);
        } else if (this.index >= this.tokens.length) {
          throw new Error("Unexpected end of expression: " + this.input);
        } else {
          this.error("Unexpected token " + this.peek.text);
        }
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    parseAccessOrCallScope: {
      value: function parseAccessOrCallScope() {
        var name = this.peek.key;

        this.advance();

        if (!this.optional("(")) {
          return new AccessScope(name);
        }

        var args = this.parseExpressionList(")");
        this.expect(")");
        return new CallScope(name, args);
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    parseObject: {
      value: function parseObject() {
        var keys = [],
            values = [];

        this.expect("{");

        if (this.peek.text !== "}") {
          do {
            var value = this.peek.value;
            keys.push(typeof value === "string" ? value : this.peek.text);

            this.advance();
            this.expect(":");

            values.push(this.parseExpression());
          } while (this.optional(","));
        }

        this.expect("}");

        return new LiteralObject(keys, values);
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    parseExpressionList: {
      value: function parseExpressionList(terminator) {
        var result = [];

        if (this.peek.text != terminator) {
          do {
            result.push(this.parseExpression());
          } while (this.optional(","));
        }

        return result;
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    optional: {
      value: function optional(text) {
        if (this.peek.text === text) {
          this.advance();
          return true;
        }

        return false;
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    expect: {
      value: function expect(text) {
        if (this.peek.text === text) {
          this.advance();
        } else {
          this.error("Missing expected " + text);
        }
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    advance: {
      value: function advance() {
        this.index++;
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    error: {
      value: function error(message) {
        var location = this.index < this.tokens.length ? "at column " + (this.tokens[this.index].index + 1) + " in" : "at the end of the expression";

        throw new Error("Parser Error: " + message + " " + location + " [" + this.input + "]");
      },
      writable: true,
      enumerable: true,
      configurable: true
    }
  });

  return ParserImplementation;
})();

exports.ParserImplementation = ParserImplementation;