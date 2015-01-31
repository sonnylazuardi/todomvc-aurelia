export class Todo{
  static inject() { return []; }
  constructor(){
    this.newTodo = '';
    this.todos = [];
    this.remainingCount = 0;
    this.completedCount = 0;
    this.editedTodo = {title: '', completed: false};
    this.allChecked = false;
  }

  addTodo() {
    if (this.newTodo != '') {
      this.todos.push({
        title: this.newTodo,
        completed: false
      });
      this.todoChanged();
      this.newTodo = '';
    }
  }

  removeTodo(todo) {
    var idx = this.todos.indexOf(todo);
    this.todos.splice(idx, 1);
    this.todoChanged();
  }

  editTodo(todo) {
    this.editedTodo = todo;
  }

  markAll(allChecked) {
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
  }

  clearCompleted() {
    for (var i = this.todos.length - 1; i >= 0; i--) {
      if (this.todos[i]) {
        if (this.todos[i].completed) {
          this.todos.splice(i, 1);
          i++;
        }
      }
    };
  }

  todoChanged() {
    var countRemaining = 0;
    var countCompleted = 0;
    this.todos.forEach(function (item) {
      if (!item.completed) 
        countRemaining++; 
      else 
        countCompleted++;
    });
    this.remainingCount = countRemaining;
    this.completedCount = countCompleted;
  }

  activate(){
  }

  canDeactivate(){
    
  }
}