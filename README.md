# jquery-statetbusking
🎸Backbone alternative using jquery-statebus

## What
jquery-statetbusking은 jquery-statebus를 백본(backbone)처럼 만듭니다. 스토어, 뷰를 정의합니다. 정의된 스토어, 뷰는 반복해서 재사용 할 수 있습니다.

## Install
```html
<script src="https://unpkg.com/jquery@3.3.1/dist/jquery.min.js">
<script src="https://unpkg.com/jquery-statebus">
<script src="https://unpkg.com/jquery-statebusking">
```

## Exmaple
```js
var CounterStore = $.statebus.store('CounterStore', {
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
    'click button.increment': 'handleIncrement',
    'click button.decrement': 'handleDecrement'
  },

  init: function(options) {
    var counter = this.counter = options.counter
    this.$value = this.$('span.value')

    this.listenTo(counter, 'all', this.render, true)
  },

  render: function() {
    var value = this.counter.state.value
    this.$display.text(value)
  },

  handleIncrement: function() {
    this.counter.action.increment()
  },

  handleDecrement: function() {
    this.counter.action.increment()
  }
})

new CounterView({ el: '#counter', counter: new CounterStore('app/counter') })
```

## Overview
### Store
스토어는 뷰와 분리되서 앱 상태와 로직을 관리합니다. 백본의 콜렉션, 모델과 비슷합니다.

#### Definition
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
액션 메소드의 반환결과가 기존 상태와 병합해 새로운 상태를 맏듭니다.

#### Create
스토어를 생성하는 방법은 2가지입니다.
```js
var counterStore = new Counter('app/counter')
// 또는
var counterStore = $.statebus.createStore('Counter', 'app/counter')
```
스토어 생성시, `이름`을 인자로 받습니다. 이름을 요구하는 이유는 아래 "Name System"에서 설명합니다.

#### Event
`store.on()` 메소드로 액션 이벤트를 청취할 수 있습니다.
```js
counter.on('increment', function (){ 
  console.log('incremented!!')
 })

counter.on('decrement', function (){ 
  console.log('decremented!!')
 })

counter.action.increment()
// => incremented!
```

"all" 이벤트로 모든 액션 이벤트를 청취할 수 있습니다.
```js
counter.on('all', function (){ ... }) 
```

#### Method
state, action 외 다른 메소드를 정의해서 사용할 수 있습니다.

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

#### Mixin
믹스인은 여러 스토어 정의를 하나로 합칩니다. 믹스인을 활용하면 반복적인 스토어 정의를 줄일 수 있습니다.

```js
var HasHistory = $.statebus.store('HasHistory', {
  state: {
    history: {}
  },
  action: {
    pushHistory: function(item) {
      return {history: [].concat(this.state.history, item)}
    },
  }
})

// "HasHistory"를 mixin 합니다.
var Counter = $.statebus.store('Counter', [HasHistory], {
  state: {
    value: 1
  },
  action: {
    increment: function(amount) {
      this.action.pushHistory(this.state.value) // HasHistory의 메소드를 사용할 수 있습니다.
      return {value: this.state.value + amount}
    }
  }
})

var counter = new Counter('app/counter')
counter.action.increment(5)

console.log(counter.state.value) // 6
console.log(counter.state.history) // [1]
```

#### Initialize
```js
var Store = $.statebus.store('Store', {
  state: {
    value: null
  },
  // 스토어 생성시 "init"함수가 존재하면 자동으로 이 함수를 실행합니다.
  init: function(options) {
    this.state.value = options.value
  }
})

// 두번째 인자로 init함수가 받는 매개변수를 넘겨줄 수 있습니다.
var store = new Store('app/store', { value: true }) 
```
`init()` 함수를 정의하면 스토어 생성시 초기화 작업을 할 수 있습니다. state를 동적으로 정의할 때 유용합니다.

#### Name System
```js
$.statebus.store('HasHistory', [], { ... })
$.statebus.store('Counter', ['HasHistory'], { ... })
$.statebus.createStore('Counter', 'app/counter')
$.statebus.remove('app/counter') // 스토어 제거
```
jquery-statebusking은 jquery를 사용한 레거시 코드를 개선하기 위한 목적으로 만들어 졌습니다. 이러한 환경에서는 제대로 된 모듈시스템을 기대하기 어려울 때가 많습니다. 위 이유로 jquery-statebusking은 스토어 정의하거나 생성할 때 "이름(Name)"을 요구하고 이를 기반으로 하는 시스템을 사용합니다.

#### Remove
```js
new Counter('app/counter')
$.statebus.remove('app/counter')
```
스토어를 제거합니다.

### View
```js
// 뷰를 정의합니다.
var CounterView = $.statebus.view('CounterView', {
  // "el" 속성으로 DOM 엘리먼트 요소를 선택할 수 있습니다.
  el: '#counter',

  // "events" 속성을 사용해서 엘리먼트 내부에서 발생하는 이벤트를 수신하는 메소드를 지정할 수 있습니다.
  // ex) "[이벤트명]": "[메소드명]" 또는 "[이벤트명] [하위타겟]": "[메소드명]"
  events: {
    'click button.increment': 'handleIncrement'
  },

  // init함수를 정의하면, 뷰 생성시 자동실행됩니다.
  init: function(options){
    // "counter"는 스토어 객체입니다.
    var counter = this.counter = options.counter 

    // listenTo 메소드를 이용해 스토어의 액션이벤트를 청취할 수 있습니다.
    // [스토어], [액션명], [실행할 리스너], [즉시실행 여부, 기본 false] 순서로 인자를 받습니다.
    // 액션이름 대신 "all"을 사용하면 모든 액션이벤트를 청취할 수 있습니다.
    this.listenTo(counter, 'all', this.render) 
  },
  render: function() {
    var value = this.counter.state.value

    // 뷰가 생성되면 자동으로 el 속성으로 지정된 DOM 엘리먼트를 jquery로 래핑해서 "this.$el"에 할당됩니다.
    this.$el.find('span.value').text(value)
  },
  handleIncrement: function(event) {
    this.counter.action.increment()
  }
})

// 뷰를 생성합니다.
var counterView = new CounterView({
  counter: counterStore,
  // 뷰 생성단계에서 "el"을 지정할 수도 있습니다.
  el: "#counter"
})
```
jquery-statebusking의 뷰(View)은 백본(Backbone)과 유사합니다. "el" 속성으로 DOM 엘리먼트를 선택하고 "events" 속성으로 리스너를 매핑하며 "listenTo" 메소드로 스토어 액션을 청취합니다. 그러나 유의미한 차이 역시 존재합니다.

#### Stateful
```js
var CounterView = $.statebus.view('CounterView', {
  // 뷰도 스토어처럼 상태, 액션 메소드를 정의할 수 있습니다.
  state: {
    value: 1
  },
  action:{
    increment: function() {
      return {value: this.state.value + 1}
    },
  },
  init: function() {
    // 자신의 액션 이벤트를 스스로 청취할 수 있습니다.
    this.on('all', $.proxy(this.render, this))
    // 주의) dispatch와 달리 on메소드는 뷰 외부에서 사용하는 경우를 고려해 리스너에 대한 this bind를 제공하고 있지 않습니다.
    // 뷰 내부에서 on메소드를 사용할 때는 직접 bind 메소드 또는 $.proxy를 사용해 this를 바인드하세요.
  },
  render: function() {
    this.$('span').text(this.state.value)
  }
})
```
백본과 가장 큰 차이는 뷰 스스로 스토어에 의존하지 않고 내부 상태를 정의할 수 있는 것입니다. 

## Why?
jquery-statebus는 뷰와 상태를 분리하는 아주 간단한 패턴을 제공하지만, 반복되는 상태, 뷰를 처리하기 위한 편의는 제공하지 않습니다. jquery-statebusking는 이 점을 보완합니다.

### Statebusking vs Backbone
#### No underscore
jquery-statebusking은 underscore에 대한 의존성이 없습니다. (저는 lodash를 더 좋아합니다.)

#### View state
백본의 뷰는 상태관리를 모델에 전적으로 의존하지만 jquery-statebusking은 내부에 상태를 가질 수 있습니다. 불필요한 모델 정의를 줄이고 코드를 단순하게 만듭니다. 이것은 앱 상태와 뷰 상태의 경계를 명확하게 해서 상태관리에 도움을 줍니다.

## License
MIT
