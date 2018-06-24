(function (global, factory) {
  typeof module === 'object' && module.exports ? factory(require('jquery'))
    : typeof define === 'function' && define.amd ? define(['jquery'], factory)
      : (factory(global.jQuery || global.$))
}(window || this, function ($) {
  var statebus = $.statebus
  var models = statebus.models = {}
  var views = statebus.views = {}
  var createdModels = {}

  statebus.model = function (modelName, parents, definition) {
    models[modelName] = resolveExtends(models, parents, definition)
    return function (path, opts) {
      return statebus.createModel(modelName, path, opts)
    }
  }

  statebus.createModel = function (modelName, path, opts) {
    var scheme = models[modelName]
    var model = createdModels[path] = $.statebus(path, scheme, opts.override)
    if (scheme.init) scheme.init(model, opts)
    return model
  }

  var viewBaseMethods = {
    $: function (selector) {
      return this.$el.find(selector)
    },
    getModel: function (path) {
      return createdModels[path]
    },
    $$unsubscribes: [],
    listenTo: function (model, evtName, func, immediately) {
      if (typeof model === 'string') {
        func = evtName
        evtName = model
        model = statebus
      }

      var unsubscribe = model.on(evtName, $.proxy(func, this), immediately)
      this.$$unsubscribes.push(unsubscribe)

      return this
    },
    remove: function () {
      this.$el.remove()
      $.each(this.$$unsubscribes, function (_, unsubscribe) {
        unsubscribe()
      })
      return this
    }
  }

  statebus.view = function (viewName, parents, definition) {
    views[viewName] = $.extend({}, viewBaseMethods, resolveExtends(views, parents, definition))
    return function (opts) {
      return statebus.createView(viewName, opts)
    }
  }

  var viewIncrement = 0

  statebus.createView = function (viewName, opts) {
    opts = opts || {}

    // create view instance
    var Func = function () {}
    Func.prototype = views[viewName]

    var view = new Func()
    view.uid = viewIncrement++
    view.viewOptions = opts

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

    if (view.init) view.init(opts)

    return view
  }

  function resolveExtends (source, parents, definition) {
    if (!definition) {
      definition = parents
      parents = []
    }

    parents = $.map([].concat(parents), function (parentName) {
      return source[parentName]
    })

    return $.extend.apply(null, [true, {}].concat(parents, definition))
  }

  function resolveProp (view, prop, opts) {
    return typeof view[prop] === 'function' ? view[prop](opts) : view[prop]
  }
}))
