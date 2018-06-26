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
