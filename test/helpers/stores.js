const $$ = require('jquery').statebus

$$.store('counter', {
  state: {
    val: 0
  },
  action: {
    inc () {
      return {val: this.state.val + 1}
    }
  }
})

$$.store('todos', {
  state: {
    todos: []
  },
  action: {
    add (todo) {
      const todos = [...this.state.todos, todo]
      return {todos}
    },
    remove (todo) {
      const todos = this.state.todos.filter(v => v !== todo)
      return {todos}
    }
  }
})
