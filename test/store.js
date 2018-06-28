const test = require('ava')
const $$ = require('jquery').statebus

test.before(t => require('./helpers/stores'))

test('if unknown name, throws error', t => {
  const err = t.throws(t => $$.createStore('??', 'test'))
  console.log('error : ' + err)
})

test('basic usage', t => {
  const store = $$.createStore('counter', 'basic')
  t.plan(4)
  store.on('all', _ => t.pass())
  store.action.inc()
  t.is(store.state.val, 1)
  store.action.inc()
  t.is(store.state.val, 2)
})

test('create via constructor', t => {
  const Constructor = $$.store('test', { state: { a: 'test' } })
  t.deepEqual((new Constructor('test1')).state, {a: 'test'})
  t.deepEqual(Constructor('test2').state, {a: 'test'})
})

test('mixin via string', t => {
  $$.store('mixinViaStr', 'counter', {
    state: { a: 'test' },
    action: {
      dec () { return {val: this.state.val - 1} }
    }
  })

  const store = $$.createStore('mixinViaStr', 'mixinViaStr')
  t.is(store.state.val, 0)
  t.is(store.state.a, 'test')
  store.action.dec()
  t.is(store.state.val, -1)
})

test('mixin via return array', t => {
  $$.store('fn1', { state: { a: 'a' } })
  $$.store('fn2', { state: { b: 'b' } })
  $$.store('test', ['fn1', 'fn2'], { state: { c: 'c' } })

  const store = $$.createStore('test', 'test')
  t.is(store.state.a, 'a')
  t.is(store.state.b, 'b')
  t.is(store.state.c, 'c')
})

test('mixin via return func', t => {
  var fn1 = $$.store('fn1', { state: { a: 1 } })
  var fn2 = $$.store('fn2', { state: { b: 2 } })
  $$.store('test', [fn1, fn2], { state: { c: 3 } })

  const store = $$.createStore('test', 'test')
  t.is(store.state.a, 1)
  t.is(store.state.b, 2)
  t.is(store.state.c, 3)
})

test('initialize with option', t => {
  t.plan(1)
  $$.store('test', {
    init (opts) {
      t.deepEqual(opts, {test: 'test'})
    }
  })('test', {test: 'test'})
})

test('dynamic state', t => {
  $$.store('test', {
    state ({val}) {
      return {a: val}
    }
  })

  const store1 = $$.createStore('test', 'test1', {val: 1})
  t.is(store1.state.a, 1)

  const store2 = $$.createStore('test', 'test2', {val: 'test'})
  t.is(store1.state.a, 1)
  t.is(store2.state.a, 'test')
})
