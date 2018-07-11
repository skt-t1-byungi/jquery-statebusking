(function (global, factory) {
  typeof module === 'object' && module.exports ? factory(require('jquery'))
    : typeof define === 'function' && define.amd ? define(['jquery'], factory)
      : (factory(global.jQuery || global.$))
}(window || this, function ($) {
  var statebus = $.statebus
  var stores = statebus.stores = {}
  var views = statebus.views = {}
  var createdStores = []

  statebus.store = function (name, parents, definition) {
    stores[name] = makeDef(stores, parents, definition)
    var func = function (ns, opts) { return statebus.createStore(name, ns, opts) }
    return makeCtor(func, name)
  }

  statebus.createStore = function (name, ns, opts) {
    opts = opts || {}

    if (createdStores.indexOf(ns) === -1) createdStores.push(ns)
    var store = statebus(ns, resolveDef(stores, name), true)

    return initBus(store, opts)
  }

  var viewBaseMethods = {
    $: function (selector) {
      return this.$el.find(selector)
    },

    getState: function (ns, propPath, defaults) {
      return objectGet(resolveStoreProp(ns, 'state'), propPath, defaults)
    },

    getPrevState: function (ns, propPath, defaults) {
      return objectGet(resolveStoreProp(ns, 'prevState'), propPath, defaults)
    },

    dispatch: function () {
      var args = $.makeArray(arguments)
      var actName = args.shift()
      var dispatched = []

      $.each(this.$$$subs, function (_, subscription) {
        var action = subscription.action

        if (dispatched.indexOf(action) !== -1) return
        dispatched.push(action)

        if (action[actName]) action[actName].apply(null, args)
      })

      return this
    },

    dispatchAll: function () {
      var args = $.makeArray(arguments)
      var actName = args.shift()

      $.each(createdStores, function (_, ns) {
        var actions = statebus.action[ns]
        if (actions && actions[actName]) actions[actName].apply(null, args)
      })

      return this
    },

    listenTo: function (store, evtName, func, immediately) {
      // normalize
      var action, on
      if (typeof store === 'string') {
        evtName = store + '.' + evtName
        action = statebus.action[store]
        on = statebus.on
      } else {
        action = store.action
        on = store.on
      }

      var unsubscribe = on(evtName, $.proxy(func, this), immediately)
      var subscription = {off: unsubscribe, action: action}
      this.$$$subs.push(subscription)

      // returns unsubscribe function
      var self = this
      return function () {
        var subscriptions = self.$$$subs
        subscriptions.splice(subscriptions.indexOf(subscription), 1)
        unsubscribe()
      }
    },

    remove: function () {
      this.$el.remove()
      statebus.remove(this.$$$ns)

      $.each(this.$$$subs, function (_, subscription) {
        subscription.off()
      })

      // clear subscriptions
      this.$$$subs = []

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
    var namespace = makeViewNS(name)
    var view = statebus(namespace, resolveDef(views, name), true)

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
        if (typeof handler === 'string') handler = objectGet(view, handler, $.noop)
        var match = key.match(splitter)
        $el.on(match[1], match[2], $.proxy(handler, view))
      })
    }

    view.$$$subs = [] // for listenTo()
    view.$$$ns = namespace // for remove()

    return initBus(view, opts)
  }

  function initBus (bus, opts) {
    // if (typeof bus.state === 'function') bus.state = bus.state(opts)
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
    var def = typeof name === 'string' ? source[name]
      : (name && name.$$$name) ? source[name.$$$name]
        : name
    if (def) return def

    throw new TypeError('[statebusking] Unknown definition. ("' + name + '")')
  }

  function makeCtor (func, name) {
    return $.extend(func, {$$$name: name})
  }

  var _viewUid = 0
  function makeViewNS (name) {
    return '__views__/' + name + '@' + (_viewUid++)
  }

  function resolveProp (view, prop, opts) {
    return opts.hasOwnProperty(prop) ? opts[prop]
      : typeof view[prop] === 'function' ? view[prop](opts)
        : view[prop]
  }

  function resolveStoreProp (store, prop) {
    return typeof store === 'string' ? statebus[prop][store] : store[prop]
  }

  function objectGet (src, path, defaults) {
    path = path.split('.')
    while (path.length) {
      if ((src = src[path.shift()]) === undefined) return defaults
    }
    return src
  }
}))
