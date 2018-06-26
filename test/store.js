const test = require('ava')
const $$ = require('jquery').statebus

test.before(t => {
  require('./helpers/stores')
})

test('if unknown name, throws error', t => {
  const err = t.throws(t => $$.createStore('??', 'test'))
  t.log('error : ', err)
})

test('basic usage', t => {
  const store = $$.createStore('counter', 'test')
  t.is(store.state.val, 0)
  store.action.inc()
  t.is(store.state.val, 1)
})
