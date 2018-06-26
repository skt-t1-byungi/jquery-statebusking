(function (global, factory) {
  typeof module === 'object' && module.exports ? factory(require('jquery'))
    : typeof define === 'function' && define.amd ? define(['jquery'], factory)
      : (factory(global.jQuery || global.$))
}(window || this, function ($) {
  var statebus = $.statebus
  var stores = statebus.stores = {}
  var views = statebus.views = {}
  var createdStores = {}

  statebus.store = function (name, parents, definition) {
    stores[name] = makeDef(stores, parents, definition)
    var func = function (ns, opts) { return statebus.createStore(name, ns, opts) }
    return makeCtor(func, name)
  }

  statebus.createStore = function (name, ns, opts) {
    opts = opts || {}
    var store = createdStores[ns] = statebus(ns, resolveDef(stores, name), opts.override)
    return initBus(store, opts)
  }

  var viewBaseMethods = {
    $: function (selector) {
      return this.$el.find(selector)
    },
    getStore: function (store) {
      return typeof store === 'string' ? createdStores[store] : store
    },
    getState: function (store, propPath) {
      return objectGet(this.getStore(store).state, propPath)
    },
    dispatch: function () {
      var args = $.makeArray(arguments)
      var actName = args.shift()
      var dispatched = []

      $.each(this.$$$subscriptions, function (_, subscription) {
        var store = subscription.store

        if (dispatched.indexOf(store) !== -1) return
        dispatched.push(store)

        if (store.action[actName]) store.action[actName].apply(null, args)
      })

      return this
    },
    dispatchAll: function () {
      var args = $.makeArray(arguments)
      var actName = args.shift()

      for (var path in createdStores) {
        var store = createdStores[path]
        if (store.action[actName]) store.action[actName].apply(null, args)
      }

      return this
    },
    listenTo: function (store, evtName, func, immediately) {
      store = this.getStore(store)

      var unsubscribe = store.on(evtName, $.proxy(func, this), immediately)
      this.$$$subscriptions.push({unsubscribe: unsubscribe, store: store})

      return unsubscribe
    },
    remove: function () {
      this.$el.remove()

      $.each(this.$$$subscriptions, function (_, subscription) {
        subscription.unsubscribe()
      })

      return this
    }
  }

  statebus.view = function (name, parents, definition) {
    views[name] = $.extend({}, viewBaseMethods, makeDef(views, parents, definition))
    var func = function (opts) { return statebus.createView(name, opts) }

    return makeCtor(func, name)
  }

  statebus.createView = function (name, opts) {
    opts = opts || {}

    // create instance
    var view = statebus(makeViewNS(name), resolveDef(views, name), opts.override)

    // resolve element
    var el = resolveProp(view, 'el', opts)
    if (!el) el = document.createElement(resolveProp(view, 'tagName', opts) || 'div')
    if (el.jquery) el = el.get(0)
    var $el = view.$el = $(el).eq(0)

    // resolve attrs
    var attrs = resolveProp(view, 'attrs', opts)
    if (attrs) $el.attr(attrs)

    // resolve events
    var events = resolveProp(view, 'events', opts)
    if (events) {
      var splitter = /^(\S+)\s*(.*)$/
      $.each(events, function (key, handler) {
        if (typeof handler === 'string') handler = view[handler]
        var match = key.match(splitter)
        $el.on(match[1], match[2], $.proxy(handler, view))
      })
    }

    // for "listenTo"
    view.$$$subscriptions = []

    return initBus(view, opts)
  }

  function initBus (bus, opts) {
    bus.state = typeof bus.state === 'function' ? bus.state(opts) : bus.state
    if (bus.init) bus.init(opts)
    return bus
  }

  function makeDef (source, parents, def) {
    if (!def) {
      def = parents
      parents = []
    }

    parents = $.map([].concat(parents), function (name) {
      return resolveDef(source, name)
    })

    return $.extend.apply(null, [true, {}].concat(parents, def))
  }

  function resolveDef (source, name) {
    return typeof name === 'string' ? source[name]
      : (name && name.$$$defName) ? source[name.$$$defName]
        : name
  }

  function makeCtor (func, name) {
    return $.extend(func, {$$$def: name})
  }

  var _viewUid = 0
  function makeViewNS (name) {
    return '__views__/' + name + '@' + (_viewUid++)
  }

  function resolveProp (view, prop, opts) {
    return typeof view[prop] === 'function' ? view[prop](opts)
      : opts.hasOwnProperty(prop) ? opts[prop]
        : view[prop]
  }

  function objectGet (src, path, defaults) {
    path = path.split('.')

    while (path.length) {
      if (!(src = src[path.shift()])) return defaults
    }

    return src
  }
}))
