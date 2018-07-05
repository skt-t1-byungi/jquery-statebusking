# jquery-statetbusking
🎸Backbone alternative using jquery-statebus

## What?
jquery-statetbusking은 jquery-statebus를 백본(backbone)처럼 만듭니다. 스토어, 뷰를 정의합니다. 정의된 스토어, 뷰는 반복해서 재사용 할 수 있습니다.

## Why?
jquery-statebus는 뷰와 상태를 분리하는 아주 간단한 패턴을 제공하지만, 반복되는 상태, 뷰를 처리하기 위한 편의는 제공하지 않습니다. jquery-statebusking는 이것을 보완합니다.

### Statebusking vs Backbone
#### No underscore
jquery-statebusking은 underscore에 대한 의존성이 없습니다. (저는 lodash를 더 좋아합니다.)

#### View state
백본의 뷰는 상태관리를 모델에 전적으로 의존하지만 jquery-statebusking은 내부에 상태를 가질 수 있습니다. 불필요한 모델 정의를 줄이고 코드를 단순하게 만듭니다. 이것은 앱 상태와 뷰 상태의 경계를 명확하게 해서 상태관리에 도움을 줍니다.

## Overview
### Store
```js
// 스토어를 정의합니다.
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
  log: function() {
    console.log('current: ' + this.state.value)
  }
})

// 정의한 스토어를 생성합니다.
var counter = new Counter('app/counter')

// 스토어에서 트리거되는 액션 이벤트를 청취합니다.
counter.on('increment', function (){ ... })
counter.on('decrement', function (){ ... })
counter.on('all', function (){ ... }) // 모든 액션 이벤트를 청취합니다.

// 다른 메소드를 호출 할 수도 있습니다.
counter.log() // current: 1
```
statebusking의 스토어(store)는 정적입니다. 백본의 모델처럼 동적으로 스토어를 생성, 제거를 할 수도 있지만 추천하지 않습니다. 스토어 대신 state에 값을 동적으로 추가하거나 제거하세요.

#### Mixin
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
    increment: function(amount){
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
믹스인은 기존에 정의된 상태(state)와 함수를 하나로 합칩니다. 믹스인을 활용하면 반복적인 스토어 정의를 줄일 수 있습니다.


## License
MIT
