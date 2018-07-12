# jquery-statebusking
> 🎸Backbone alternative using jquery-statebus

[![npm](https://img.shields.io/npm/v/jquery-statebusking.svg?style=flat-square)](https://www.npmjs.com/package/jquery-statebusking)

jquery-statebusking은 jquery-statebus를 백본(backbone)처럼 만듭니다. 스토어, 뷰를 정의합니다. 정의된 스토어, 뷰는 반복해서 재사용 할 수 있습니다.

## Why?
jquery-statebus는 뷰와 상태를 분리하는 아주 간단한 패턴을 제공하지만, 반복되는 상태, 뷰를 처리하기 위한 편의는 제공하지 않습니다. jquery-statebusking는 이 점을 보완합니다.

### vs Backbone
- **No underscore** - statebusking은 underscore에 대한 의존성이 없습니다. (저는 lodash를 더 좋아합니다.)
- **View state** - 백본의 뷰는 상태관리를 모델에 전적으로 의존하지만 jquery-statebusking은 내부상태를 가질 수 있습니다. 


## Install
```html
<script src="https://code.jquery.com/jquery.min.js"></script>
<script src="https://unpkg.com/jquery-statebus"></script>
<script src="https://unpkg.com/jquery-statebusking"></script>
```

## Exmaple
```html
<div id="counter">
  <span class="value"></span>
  <button class="increment"> + </button>
  <button class="decrement"> - </button>
</div>
```
```js
var Counter = $.statebus.store('Counter', {
  state: {
    value: 1
  },

  action: {
    increment: function() {
      return {value: this.state.value + 1}
    },

    decrement: function() {
      return {value: this.state.value - 1}
    }
  }
})

var CounterView = $.statebus.view('CounterView', {
  events: {
    'click button.increment': 'onIncrementClick',
    'click button.decrement': 'onDecrementClick'
  },

  init: function(options) {
    var counter = this.counter = options.counter
    this.$value = this.$el.find('span.value')

    this.listenTo(counter, 'all', this.render, true)
  },

  render: function() {
    var value = this.counter.state.value
    this.$value.text(value)
  },

  onIncrementClick: function() {
    this.counter.action.increment()
  },

  onDecrementClick: function(){
    this.counter.action.decrement()
  }
})

new CounterView({ el: '#counter', counter: new Counter('app/counter') })
```

## Store
스토어는 뷰와 분리되서 앱 상태와 로직을 관리합니다. 백본의 콜렉션, 모델과 비슷합니다.

### Definition
스토어를 정의합니다.
```js
var Counter = $.statebus.store('Counter', {
  state: {
    value: 1
  },

  action:{
    increment: function() {
      return {value: this.state.value + 1}
    },

    decrement: function() {
      return {value: this.state.value - 1}
    }
  },
})
```
액션 메소드의 반환결과가 기존 상태와 병합되어 새로운 상태를 만듭니다.

### Create
정의한 스토어를 생성하는 방법은 2가지입니다.
```js
var counter = new Counter('app/counter')
// 또는
var counter = $.statebus.createStore('Counter', 'app/counter')
```
스토어 생성시, `이름`이 필요합니다. 이름이 필요한 이유는 아래 [Name System](#name-system)에서 설명합니다.

### Event
`store.on()` 메소드로 액션 이벤트를 청취할 수 있습니다.
```js
counter.on('increment', function (){ 
  console.log('incremented!!')
 })

counter.action.increment()
// => incremented!
```

"all" 이벤트로 모든 액션 이벤트를 청취할 수 있습니다.
```js
counter.on('all', function (){ ... }) 
```

### Method
state, action외 다른 메소드를 정의해서 사용할 수 있습니다.
```js
$.statebus.store('Counter', {
  ...
  format: function(){
    return '총 ' + this.state.value + '회'
  }
})

...
var formatted = counter.format()
console.log(formatted)
// => 총 1회
```

### Mixin
믹스인은 여러 스토어 정의를 하나로 합칩니다. 
믹스인을 활용하면 반복적인 스토어 정의를 줄일 수 있습니다.

```js
var A = $.statebus.store('A', {
  state: {
    valueA: ''
  },

  action: {
    setA: function(a) {
      return {valueA: a}
    },
  }
})

// 2번째 인자로 믹스인 대상을 지정합니다.
var B = $.statebus.store('B', A, {
  state: {
    valueB: ''
  },

  action: {
    setB: function(b) {
      return {valueA: b}
    },
  },

  print: function() {
    console.log(this.state.valueA + '-' + this.state.valueB)
  }
})

var b = new B('app/b')
b.action.setA('foo')
b.action.setB('BAR')

b.print()
// => foo-BAR
```

배열로 여러 스토어 정의를 믹스인 할 수 있습니다.
```js
$.statebus.store('A', [B, C, D], { ... })
// 또는
$.statebus.store('A', ['B', 'C', 'D'], { ... })
```

### Initialize
`store.init()`을 정의하면 생성시 초기화 작업을 할 수 있습니다.
```js
var Store = $.statebus.store('Store', {
  state: {
    value: null
  },

  init: function(options) {
    this.state.value = options.value
  }
})

// 스토어 생성시 두번째 인자로 init함수의 매개변수를 넘겨줄 수 있습니다.
var store = new Store('app/store', { value: true }) 
```
상태를 동적으로 정의할 때 유용합니다.

### <span id="name-system">Name System</span>
statebusking은 jquery를 사용한 레거시 코드를 개선하기 위해 만들어졌습니다. 이러한 환경에서는 제대로 된 모듈시스템을 기대하기 어려울 때가 많습니다.
스토어 정의하거나 생성할 때 `이름(name)`을 지정하여 의존성을 해결하면 모듈시스템이 없을 때 유용합니다.
```js
$.statebus.store('Counter', { ... }) // 스토어 정의
$.statebus.store('A', ['B', 'C'], { ... }) // 스토어 믹스인
$.statebus.createStore('Counter', 'app/counter') // 스토어 생성
$.statebus.remove('app/counter') // 스토어 제거
```

### Remove
스토어를 제거합니다.
```js
new Model('app/model')
$.statebus.remove('app/model')
```

> statebusking의 스토어(store)는 정적입니다.

백본의 모델처럼 동적으로 제거를 할 수도 있지만 추천하지 않습니다. 되도록 스토어를 직접 제거하는 대신, 동적인 상태를 정의하고 액션 메소드로 상태 값을 제거하세요.

## View
뷰는 상태를 담당하는 스토어와 분리되어 DOM 변화를 관리합니다.

### Definition
뷰를 정의합니다.
```js
var CounterView = $.statebus.view('CounterView', { 
  init: function() { ... },
  ... 
})
```
스토어처럼 `view.init()`을 정의하면 생성시 초기화 작업을 할 수 있습니다.

### Create
정의한 뷰를 생성하는 방법 역시 2가지입니다. 뷰 생성시 옵션객체를 인자로 넘겨줄 수 있습니다.
```js
var view = new CounterView({el: '#counter'})
// 또는
var view = $.statebus.createView('CounterView', {el: '#counter'})
```

뷰는 jquery로 래핑된 DOM 엘리먼트인 `view.$el`을 가집니다. 옵션의 `el` 속성으로 DOM 엘리먼트를 선택할 수 있습니다. 
```js
console.log(view.$el.get(0))
// => <div id="counter">...</div>
```

미리 선언단계에서 지정할 수도 있습니다.
```js
$.statebus.view('CounterView', {
  el: '#counter',
  ...
})
```

만약 지정한 `el`이 없다면 `tagName`의 엘리먼트를 만듭니다. 이 땐 직접 문서에 삽입해야 합니다.
```js
var view = new CounterView({tagName: 'div'})
view.$el.appendTo('body')
```
`tagName`의 기본값은 "div"입니다.

### Mixin
뷰 역시 스토어처럼 믹스인이 가능합니다.
```js
$.statebus.view('A', ['B', 'C'], { ... })
```

### Event delegate
`events` 속성으로 view.$el에서 발생하는 이벤트와 핸들러 메소드를 매핑할 수 있습니다.
```js
$.statebus.view('View', {
  events: {
    // view.$el에서 click 이벤트가 발생시, onClick 메소드를 실행합니다.
    'click': 'onClick',

    // 특정 자식요소에서 발생하는 이벤트를 매핑할 수도 있습니다.
    'click .child': 'onClick'
  },

  // jquery event 객체를 매개변수로 받습니다.
  onClick: function(event) { ... } 
})
```

점표기법을 사용해 메소드를 매핑할 수 있습니다. 이벤트 발생시 바로 액션 메소드를 실행할 때 유용합니다.
```js
$.statebus.view('CounterView', {
  events: {
    'click': 'counter.action.increment'
  },
  
  init: function(options) {
    this.counter = options.counter
  }
})
```
핸들러메소드 this를 뷰 객체로 자동바인딩합니다. 
따라서 메소드 this가 고정 되지 않은 경우, 의도하지 않은 동작이 발생할 수 있습니다. 
다행히 스토어 액션 메소드들은 this 바인딩이 미리 되어 있어 안전합니다.

### Stateful
statebusking은 백본과 달리, `뷰 상태`란 개념이 존재합니다.
```js
$.statebus.view('CounterView', {
  state: {
    value: 1
  },

  action: {
    increment: function() {
      return {value: this.state.value + 1}
    },
  },
  
  events: {
    'click button.increment': 'action.increment'
  }
})
```
이것은 `앱 상태`와 `뷰 상태`의 경계를 명확하게 해서 상태관리에 도움을 줍니다.

### Options
뷰를 생성시, 아래 옵션객체 속성을 참조합니다.

- `el` - 뷰 엘리먼트 요소(view.$el)를 선택합니다.
- `events` - DOM 엘리먼트 이벤트와 핸들러 메소드를 매핑합니다.
- `attrs` - DOM 어트리뷰트를 설정합니다.
- `tagName` - `el`이 없을 경우, `tagName` 속성의 엘리먼트 만듭니다. 기본값은 "div"입니다.

옵션의 속성들은 정의단계에서 미리 선언할 수 있습니다.

### view.listenTo(store, actionName, listener [,immediately])
스토어의 액션 이벤트를 구독합니다.

- `store` *Store|string* - 대상 스토어. `이름`(string)으로 스토어를 지정할 수 있습니다.
- `actionName` *string|string[]* - 구독할 액션이벤트입니다.
- `listener` *(this:View, store, context) => void* - 액션이 발생했을 때 실행될 리스너 함수입니다.
- `immediately` *boolean* - 즉시 실행여부입니다. 기본값은 false입니다.

```js
  ...,
  init: function(){
    this.listenTo(counter, 'increment decrement', this.render, true)
    // 또는
    this.listenTo('app/counter', 'increment decrement', this.render, true)
  },
  ...
```

`view.listenTo()`는 구독을 취소할 수 있는 함수를 반환합니다. 원하는 시점에 이벤트 구독을 취소할 수 있습니다.
```js
  ...,
  init: function() {
    this.unsubscribe = this.listenTo('app/counter', 'increment decrement', this.render)
  },

  onClick: function() {
    // 액션 이벤트 구독을 취소합니다.
    this.unsubscribe()
  },
  ...
```

### view.on(actionName, listener [,immediately])
뷰의 액션 이벤트를 구독합니다.

- `actionName` *string|string[]* - 구독할 액션이벤트입니다.
- `listener` *(view, context) => void* - 액션이 발생했을 때 실행될 리스너 함수입니다.
- `immediately` *boolean* - 즉시 실행여부입니다. 기본값은 false입니다.

`view.listenTo()`와 마찬가지로 구독을 취소할 수 있는 함수를 반환받습니다
```js
  ...,
  action: {
    increment: function() { ... },
  },

  init: function(){
    this.unsubscribe = this.on('increment decrement', $.proxy(this.render, this))
  },
  ...
```
단 `view.listenTo()`와 달리 `view.on()`은 *뷰 외부에서 사용하는 경우를 고려해서* this를 자동바인드하지 않습니다. $.proxy, 또는 ES5 bind 함수로 this를 바인드하세요.

### view.$(selector)
뷰 엘리먼트의 자식요소를 선택합니다. `view.$el.find()`의 축약 함수입니다.
 
### view.getState(store, key [,defaults])
스토어 상태를 얻습니다.

- `store` *Store|string* - 대상 스토어. `이름`(string)으로 스토어를 지정할 수 있습니다.
- `key` *string* - 속성명. 점 표기법을 사용해서 깊은(nested) 곳에 위치한 값을 가져올 수 있습니다.
- `defaults` *undefined* - 값이 존재하지 않을 때 반환할 기본값.

```js
  ...,
  init: function() {
    this.articleTitle = this.getState('app/articles', 'articles.0.title')
  }
```

### view.getPrevState(store, key [,default])
스토어의 변경 직전의 상태를 얻습니다.

### view.dispatch(actionName, ...args)
`view.listenTo()`로 구독 중인 스토어에 지정한 액션을 일괄 실행합니다. 
```js
$.statebus.store('Post', {
  ...
  action: {
    onPostWrite: function(post) {
      return {post: post}
    }
  }
})

$.statebus.view('PostView', {
  ...,
  init: function() {
    this.listenTo('app/post', 'all', this.render)
  }

  onSubmit: function(){
    var post = this.$textarea.val()
    this.dispatch('onPostWrite', post)
  },
  ...
})
```
스토어의 액션을 *리액티브*한 형태로 디자인 했을 때 유용합니다.

### view.dispatchAll(actionName, ...args)
생성된 모든 스토어에 지정한 액션을 일괄 실행합니다. 

### view.remove()
뷰 엘리먼트를 제거합니다. 스토어에 대한 모든 구독 역시 취소합니다. 

> 백본과 달리 삭제(remove)이벤트를 제공하지 않습니다. 

*statebusking은 뷰제거를 부모요소가 결정한다*란 원칙을 믿습니다.
뷰와 뷰의 삭제이벤트가 필요하다면 부모 뷰의 액션메소드와 액션이벤트를 사용합니다.

## Example Codes
- [Counter example](https://jsfiddle.net/ecooz/0cuew1gb/)


## License
MIT
