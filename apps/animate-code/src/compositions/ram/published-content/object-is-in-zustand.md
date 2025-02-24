!videoTitle Object.is() usage in Zustand's source code

## !!steps

!duration 200

!title 1. What is "Object.is()" in JavaScript

```js ! /index.js
const obj = {};
// !callout[/Object.is/] The `Object.is()` method checks whether two values are the same. It's similar to `===` but with special handling for `NaN` and `-0`.
console.log(Object.is(obj, {})); 
// Expected output: false
```

## !!steps

!duration 200

!title 2. Understanding Object.is() with Objects

```js ! /index.js
const jsonObject1 = {
    name: "foo",
    age: 30
};

const jsonObject2 = {
    name: "bar",
    age: 30
};

// !callout[/Object.is/] Even though these objects have the same structure and values, `Object.is()` returns false because they are different objects in memory.
console.log(Object.is(jsonObject1, jsonObject2)); 
// Expected output: false

```

## !!steps

!duration 200

!title 3. How Zustand uses Object.is()?

```js ! zustand/src/vanilla.ts
const setState: 
StoreApi<TState>['setState'] = (partial, replace) => {
  const nextState =
    typeof partial === 'function'
      ? (partial as (state: TState) => TState)(state)
      : partial
  // !callout[/Object.is/] In Zustand, `Object.is()` is used to determine whether the `nextState` is different from the current `state`. This check prevents unnecessary state updates, which is crucial for performance.
  if (!Object.is(nextState, state)) {
    const previousState = state
    state =
      (replace ?? 
        (typeof nextState !== 'object' || nextState === null))
        ? (nextState as TState)
        : Object.assign({}, state, nextState)
    listeners.forEach(
      (listener) => listener(state, previousState))
  }
}
```


