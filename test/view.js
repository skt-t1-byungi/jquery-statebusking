const test = require('ava')
const $$ = require('jquery').statebus

const doc = document
const body = doc.body

test.before(t => {
  require('./helpers/stores')
  require('./helpers/views')
})

test('element select by el prop', t => {
  body.innerHTML = '<div id="app"></app>'
  const view = $$.createView('counter', {
    el: '#app'
  })
  t.is(view.$el.get(0), document.getElementById('app'))
})

test('if no el prop, create element', t => {
  const view = $$.createView('counter')
  const el = view.$el.get(0)
  t.is(el.nodeName, 'DIV')
  t.false(body.contains(el))
})

test('delegate events by events prop', t => {
  body.innerHTML = `
  <div id="app">
    <button data-inc>+</button>
  </div>
  `
  const view = $$.createView('counter', {el: '#app'})

  t.is(view.state.val, 0)
  doc.querySelector('#app [data-inc]').click()
  t.is(view.state.val, 1)
})

test('set attributes by attrs prop', t => {
  const view = $$.createView('counter', {
    attrs: {
      class: 'test',
      id: 'counter'
    }
  })

  t.is(view.$el.attr('id'), 'counter')
  t.true(view.$el.hasClass('test'))
})

test('listen to store(string type) for render', t => {
  const todos = $$.createStore('todos', 'app/todos')
  const view = $$.createView('todos', { todos: 'app/todos' })

  todos.action.add('coding')
  todos.action.add('cooking')
  todos.action.add('homework')
  t.is(view.$el.html(), '<li>coding</li><li>cooking</li><li>homework</li>')

  todos.action.remove('cooking')
  t.is(view.$el.html(), `<li>coding</li><li>homework</li>`)
})

test('listen to store(ref type)', t => {
  const todos = $$.createStore('todos', 'app/todos')
  const view = $$.createView('todos', { todos })

  todos.action.add('coding')
  t.is(view.$el.html(), '<li>coding</li>')
})

test('dispatch to store', t => {

})
