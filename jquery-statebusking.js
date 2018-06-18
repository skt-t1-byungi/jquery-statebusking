(function (global, factory) {
  typeof module === 'object' && module.exports ? factory(require('jquery'))
    : typeof define === 'function' && define.amd ? define(['jquery'], factory)
      : (factory(global.jQuery || global.$))
}(window || this, function ($) {
  var statebus = $.statebus
  var models = statebus.models = {}
  var views = statebus.views = {}

  statebus.model = function (modelName, parents, definition) {
    models[modelName] = resolveExtends(models, parents, definition)
    return function (path) {
      return statebus.createModel(modelName, path)
    }
  }

  statebus.createModel = function (modelName, path) {
    var model = models[modelName]
    return $.statebus(path, model)
  }

  statebus.view = function (viewName, parents, definition) {
    views[viewName] = resolveExtends(views, parents, definition)
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
    var el = resolveProp(view, 'el', opts)
    if (!el) el = document.createElement(resolveProp(view, 'tagName', opts))
    if (el.jquery) el = el.get(0)

    var $el = view.$el = $(el).eq(0)

    // resolve attrs
    var attrs = resolveProp(view, 'attrs', opts)
    if (attrs) {
      if (attrs['className']) attrs['class'] = attrs['className']
      $el.attr(attrs)
    }

    // resolve events
    var events = resolveProp(view, 'events', opts)
    $.each(events, function (evtName, handlerName) {

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
