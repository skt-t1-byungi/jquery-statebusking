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
    return function (path) {
      return statebus.createModel(modelName, path)
    }
  }

  statebus.createModel = function (modelName, path) {
    var scheme = models[modelName]
    var model = createdModels[path] = $.statebus(path, scheme)
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
    listenTo: function (modelPath, evtName, func) {
      var model = this.getModel(modelPath)
      var unsubscribe = model.on(evtName, $.proxy(func, this))
      this.$$unsubscribes.push(unsubscribe)
      return model
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

    return $.extend.apply(null, parents.concat(definition))
  }

  function resolveProp (view, prop, opts) {
    return typeof view[prop] === 'function' ? view[prop](opts) : view[prop]
  }
}))
