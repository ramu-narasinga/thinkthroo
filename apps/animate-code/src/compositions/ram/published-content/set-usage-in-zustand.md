!videoTitle Set() usage in Zustand's source code

## !!steps

!duration 200

!title 1. What is a Set in JavaScript?

```js ! /index.js
// !callout[/Set/] The `Set` object in JavaScript lets you store unique values of any type. If a value is already in the set, it won't be added again.
const mySet1 = new Set();

mySet1.add(1);           
mySet1.add(5);           
mySet1.add(5); // Duplicate value, not added
mySet1.add("some text"); 

for (const item of mySet1) {
  console.log(item);
}
// Expected output: 1, 5, 'some text'
```

## !!steps

!duration 200

!title 2. How Zustand Uses Set for Listeners

```js ! zustand/src/vanilla.ts

// !callout[/new Set/] In Zustand, listeners are managed using a `Set`. This ensures that each listener is unique and prevents duplicates.
const listeners = new Set<Listener<TState>>();

const subscribe: StoreApi<TState>['subscribe'] = (listener) => {
  listeners.add(listener);
  // Unsubscribe function
  return () => listeners.delete(listener);
}
```