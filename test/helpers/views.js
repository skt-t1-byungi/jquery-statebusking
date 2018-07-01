const $$ = require('jquery').statebus

$$.view('counter', {
  state: {
    val: 0
  },
  action: {
    inc () {
      return {val: this.state.val + 1}
    }
  },
  events: {
    'click [data-inc]': 'handleInc'
  },
  handleInc: function () {
    this.action.inc()
  }
})

$$.view('todos', {
  tagName: 'ul',
  init ({todos}) {
    this.todos = todos
    this.listenTo(todos, 'add', this.renderAdd)
    this.listenTo(todos, 'remove', this.renderRemove)
  },
  renderAdd (bus) {
    const todo = this.getState(this.todos, 'todos').slice(-1)[0]
    this.$el.append(`<li>${todo}</li>`)
  },
  renderRemove (_, {args: [todo]}) {
    const idx = this.getPrevState(this.todos, 'todos').indexOf(todo)
    this.$el.children().eq(idx).remove()
  }
})
