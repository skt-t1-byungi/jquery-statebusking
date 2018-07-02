# jquery-statetbusking
🎸Backbone alternative using jquery-statebus

## What?
jquery-statetbusking을 사용하면 jquery-statebus를 백본(backbone)처럼 만듭니다. 모델,뷰를 정의하고, 정의된 모델,뷰는 여러번 생성할 수 있습니다.

## Why?
jquery-statebus는 뷰와 상태를 분리하는 아주 간단한 패턴을 제공하지만 반복되는(또는 유사한) 상태, 뷰에 대한 편의성을 제공하진 않습니다. jquery-statebusking는 이러한 부분을 보완합니다.

### vs Backbone
#### NO underscore
jquery-statebusking은 underscore 의존성이 없습니다. (lodash를 더 좋아합니다.)

#### View state
백본의 뷰 상태는 모델에 의존하지만 jquery-statebusking은 별도의 뷰 상태를 가집니다. 불필요한 모델 정의를 줄이고 코드를 단순하게 만듭니다. 또 이것은 앱 상태와 뷰 상태의 경계를 명확하게 하여 상태관리에 도움을 줍니다.

## License
MIT
