const test = require('ava')
const $ = require('jquery')
const $$ = $.statebus

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

// with init, listenTo, getState, getPrevState
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
  actionStore('store1', { test () { t.pass() } })
  actionStore('store2', { test () { t.fail() } })

  initView('listenView', function () {
    this.listenTo('app/store1', 'all', _ => {})
    // dummies
    this.listenTo('app/store1', 'all', _ => {})
    this.listenTo('app/store1', 'test', _ => {})
  })

  $$.createStore('store1', 'app/store1')
  $$.createStore('store2', 'app/store2')

  const view = $$.createView('listenView')

  t.plan(1)
  view.dispatch('test')
})

const actionStore = (name, action) => $$.store(name, {action})
const initView = (name, init) => $$.view(name, {init})

test('dispatchAll to store', t => {
  actionStore('store1', { test () { t.pass() } })
  actionStore('store2', { test () { t.pass() } })

  $$.view('listenView')

  $$.createStore('store1', 'app/store1')
  $$.createStore('store2', 'app/store2')

  const view = $$.createView('listenView')

  t.plan(2)
  view.dispatchAll('test')
})

test('remove view', t => {
  body.innerHTML = `<div id="app"></div>`

  $$.store('store', { action: { call: $.noop } })
  const store = $$.createStore('store', 'app/store')

  let hits = 0
  $$.view('view', {
    action: { call: $.noop },
    init () {
      this.listenTo(store, 'all', () => hits++)
      this.on('all', () => hits++)
    }
  })
  const view = $$.createView('view', {el: '#app'})

  // before remove
  store.action.call()
  t.is(hits, 1)
  view.action.call()
  t.is(hits, 2)
  t.is($('#app').length, 1)
  t.true($$.state.hasOwnProperty(view.$$$ns))

  // do remove
  view.remove()

  // after remove
  store.action.call()
  t.is(hits, 2)
  view.action.call()
  t.is(hits, 2)
  t.is($('#app').length, 0)
  t.false($$.state.hasOwnProperty(view.$$$ns))
})
