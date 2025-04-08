!videoTitle Understanding Polyfill and BadMapPolyfill in React

## !!steps
!duration 200

!title 1. What is a Polyfill in JavaScript?

```ts ! react/source-code
// Polyfill in JavaScript
// !callout[/Array/] A polyfill is a piece of code used to provide modern functionality on older browsers that do not natively support it.
if (!Array.prototype.includes) {
  Array
    .prototype
    .includes = function (searchElement, fromIndex) {
    // Example of a polyfill for Array.prototype.includes
    return this
        .indexOf(searchElement, fromIndex) !== -1;
  };
}
```

## !!steps
!duration 210

!title 2. What is BadMapPolyfill in React?

```ts ! react/src/BadMapPolyfill.js
// BadMapPolyfill in React
// !callout[/BadMapPolyfill/] The `BadMapPolyfill` checks if the current environment has a bad implementation of `Map` or `Set`. 
export let hasBadMapPolyfill: boolean;

if (__DEV__) {
  hasBadMapPolyfill = false;
  try {
    const frozenObject = Object.freeze({});
    new Map([[frozenObject, null]]);
    new Set([frozenObject]);
  } catch (e) {
    hasBadMapPolyfill = true;
  }
}
```

## !!steps
!duration 220

!title 3. How Does BadMapPolyfill Work?

```ts ! react/src/BadMapPolyfill.js
// Explanation of BadMapPolyfill
// !callout[/try/] This polyfill uses a `try-catch` block to check if the `Map` and `Set` constructors work properly. If they don't, it flags `hasBadMapPolyfill` as true.
try {
  new Map([[frozenObject, null]]);
  new Set([frozenObject]);
} catch (e) {
  hasBadMapPolyfill = true;
}
```

## !!steps
!duration 200

!title 4. Practical Example of Using a Polyfill

```ts ! javascript/polyfill-example.js
// Polyfill for Object.assign
// !callout[/Object.assign/] This polyfill adds the `Object.assign` method for environments that do not support it.
if (typeof Object.assign !== 'function') {
  Object.assign = function (target, ...sources) {
    sources.forEach(source => {
      for (let key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    });
    return target;
  };
}
```

## !!steps

!duration 210

!title 5. Why Polyfills are Important in Modern JavaScript

```ts ! modern-js-polyfills
// The importance of polyfills
// !callout[/Array/] Polyfills ensure compatibility with older browsers that do not support the latest ECMAScript features, helping developers maintain functionality across environments.
if (!Array.prototype.includes) {
  Array
    .prototype
    .includes = function (searchElement, fromIndex) {
    // Example of a polyfill for Array.prototype.includes
    return this
        .indexOf(searchElement, fromIndex) !== -1;
  };
}
```