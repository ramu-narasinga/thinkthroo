!videoTitle Object.assign() usage in Zustand's source code

## !!steps

!duration 200

!title 1. Understanding Object.assign()

```js ! /index.js
const target = { a: 1, b: 2 };
const source = { b: 4, c: 5 };

// !callout[/Object.assign/] The `Object.assign()` method copies properties from source objects to a target object, modifying the target. In this example, `b` is updated and `c` is added.
const returnedTarget = Object.assign(target, source);

console.log(target);
// Expected output: Object { a: 1, b: 4, c: 5 }

console.log(returnedTarget === target);
// Expected output: true
```

## !!steps

!duration 200

!title 2. How Zustand Uses Object.assign()

```js ! zustand/src/vanilla.ts
state = (replace != null ? 
              replace : 
              typeof nextState !== "object" || 
              nextState === null) ? 
                nextState : 
                // !callout[/Object.assign/] In Zustand, `Object.assign()` is used to merge `nextState` with the current `state`. This ensures that only the properties in `nextState` are updated, leaving others unchanged.
                Object.assign({}, state, nextState);
```

## !!steps

!duration 200

!title 3. Experimenting with Object.assign()

```js ! zustand/src/demo.ts
// Simple example to show how `Object.assign()` updates state
const state = { count: 1 };
const nextState = { count: state.count + 1 };

// !callout[/Object.assign/] When the state is updated with `Object.assign()`, it merges the `nextState` with the current `state`. This is visible when incrementing the count.
state = Object.assign({}, state, nextState);

console.log(state);
// Expected output: { count: 2 }
```