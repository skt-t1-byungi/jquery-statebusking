(function (global, factory) {
  typeof module === 'object' && module.exports ? factory(require('jquery'))
    : typeof define === 'function' && define.amd ? define(['jquery'], factory)
      : (factory(global.jQuery || global.$))
}(window || this, function ($) {
  var statebus = $.statebus
  var stores = statebus.stores = {}
  var views = statebus.views = {}
  var createdStores = {}

  statebus.store = function (storeName, parents, definition) {
    stores[storeName] = resolveExtends(stores, parents, definition)
    return function (path, opts) {
      return statebus.createStore(storeName, path, opts)
    }
  }

  statebus.createStore = function (storeName, path, opts) {
    var scheme = stores[storeName]
    var store = createdStores[path] = $.statebus(path, scheme, opts.override)
    if (store.init) store.init(opts)
    return store
  }

  var viewBaseMethods = {
    $$$boot: function () {
      this.$$$subscriptions = []
    },
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

      this.$$$subscriptions.push({
        unsubscribe: store.on(evtName, $.proxy(func, this), immediately),
        store: store
      })

      return this
    },
    remove: function () {
      this.$el.remove()
      $.each(this.$$$subscriptions, function (_, subscription) {
        subscription.unsubscribe()
      })
      this.$$$subscriptions = []
      return this
    }
  }

  statebus.view = function (viewName, parents, definition) {
    views[viewName] = $.extend({}, viewBaseMethods, resolveExtends(views, parents, definition))
    return function (opts) {
      return statebus.createView(viewName, opts)
    }
  }

  statebus.createView = function (viewName, opts) {
    opts = opts || {}

    // create view instance
    var Func = function () {}
    Func.prototype = views[viewName]
    var view = new Func()

    // resolve element
    var el = resolveProp(view, 'el', opts) || opts.el
    if (!el) el = document.createElement(resolveProp(view, 'tagName', opts) || 'div')
    if (el.jquery) el = el.get(0)
    var $el = view.$el = $(el).eq(0)

    // resolve attrs
    var attrs = resolveProp(view, 'attrs', opts)
    if (attrs) $el.attr(attrs)

    // resolve events
    var events = resolveProp(view, 'events', opts)
    var splitter = /^(\S+)\s*(.*)$/
    $.each(events, function (key, handler) {
      if (typeof handler !== 'function') handler = view[handler]
      var match = key.match(splitter)
      $el.on(match[1], match[2], $.proxy(handler, view))
    })

    view.$$$boot()
    if (view.init) view.init(opts)

    return view
  }

  function resolveExtends (source, parents, definition) {
    if (!definition) {
      definition = parents
      parents = []
    }

    parents = $.map([].concat(parents), function (parentName) {
      return typeof parentName === 'string' ? source[parentName] : parentName
    })

    return $.extend.apply(null, [true, {}].concat(parents, definition))
  }

  function resolveProp (view, prop, opts) {
    return typeof view[prop] === 'function' ? view[prop](opts) : view[prop]
  }

  function objectGet (src, path, defaults) {
    path = path.split('.')
    while (path.length) {
      src = src[path.shift()]
      if (!src) return defaults
    }
    return src
  }
}))
