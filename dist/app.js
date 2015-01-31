System.register([], function (_export) {
  "use strict";

  var _prototypeProperties, Todo;
  return {
    setters: [],
    execute: function () {
      _prototypeProperties = function (child, staticProps, instanceProps) {
        if (staticProps) Object.defineProperties(child, staticProps);
        if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
      };

      Todo = (function () {
        function Todo() {
          this.newTodo = "";
          this.todos = [];
          this.remainingCount = 0;
          this.completedCount = 0;
          this.editedTodo = { title: "", completed: false };
          this.allChecked = false;
        }

        _prototypeProperties(Todo, {
          inject: {
            value: function inject() {
              return [];
            },
            writable: true,
            enumerable: true,
            configurable: true
          }
        }, {
          addTodo: {
            value: function addTodo() {
              if (this.newTodo != "") {
                this.todos.push({
                  title: this.newTodo,
                  completed: false
                });
                this.todoChanged();
                this.newTodo = "";
              }
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          removeTodo: {
            value: function removeTodo(todo) {
              var idx = this.todos.indexOf(todo);
              this.todos.splice(idx, 1);
              this.todoChanged();
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          editTodo: {
            value: function editTodo(todo) {
              this.editedTodo = todo;
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          markAll: {
            value: function markAll(allChecked) {
              if (allChecked) {
                this.todos.forEach(function (item) {
                  item.completed = true;
                });
              } else {
                this.todos.forEach(function (item) {
                  item.completed = false;
                });
              }
              this.todoChanged();
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          clearCompleted: {
            value: function clearCompleted() {
              for (var i = this.todos.length - 1; i >= 0; i--) {
                if (this.todos[i]) {
                  if (this.todos[i].completed) {
                    this.todos.splice(i, 1);
                    i++;
                  }
                }
              };
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          todoChanged: {
            value: function todoChanged() {
              var countRemaining = 0;
              var countCompleted = 0;
              this.todos.forEach(function (item) {
                if (!item.completed) countRemaining++;else countCompleted++;
              });
              this.remainingCount = countRemaining;
              this.completedCount = countCompleted;
            },
            writable: true,
            enumerable: true,
            configurable: true
          },
          activate: {
            value: function activate() {},
            writable: true,
            enumerable: true,
            configurable: true
          },
          canDeactivate: {
            value: function canDeactivate() {},
            writable: true,
            enumerable: true,
            configurable: true
          }
        });

        return Todo;
      })();
      _export("Todo", Todo);
    }
  };
});