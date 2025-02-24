!videoTitle Bypassing Bundlers' Detection of the require Statement in React Source Code

## !!steps
!duration 180

!title 1. Introduction: Bypassing Bundlers' Detection of require

```ts ! flow_fix_me/enqueueTask.js
// Bypass bundler's detection of 
// the `require` statement using string concatenation
// !callout[/requireString/] React dynamically constructs the `require` string to avoid bundlers like Webpack from detecting it.
const requireString = ('require' + Math.random()).slice(0, 7);
const nodeRequire = module && module[requireString];
```

## !!steps
!duration 220

!title 2. Handling setImmediate in Node.js

```js ! node_docs/setImmediate
// Using `setImmediate` to schedule 
// asynchronous tasks in Node.js
// !callout[/setImmediate/] Node's `setImmediate()` schedules code to run asynchronously in the next iteration of the event loop.
setImmediate(() => {
  console.log("Executing async task in Node.js using setImmediate");
});
```

## !!steps
!duration 200

!title 3. Why Avoid Bundler Detection?

```ts ! react_shared/enqueueTask.js
// !callout[/nodeRequire/] Browser environments don't need Node.js modules, so React bypasses the inclusion of unnecessary polyfills.
const nodeRequire = module && module[requireString];
// !callout[/Polyfill issue/] Bundlers like Webpack often include Node.js polyfills when they detect `require`, which can bloat the browser bundle unnecessarily.
enqueueTaskImpl = nodeRequire
                    .call(module, 'timers')
                    .setImmediate;
```

## !!steps
!duration 210

!title 4. Timers Module in Node.js

```ts ! node_docs/timers
// `timers` is a Node.js core module 
// that provides additional control for scheduling tasks.
// !callout[/timers/] The `timers` module provides functions similar to `setTimeout`, but with more precision.
const timers = nodeRequire.call(module, 'timers');
// Use `setImmediate` from the 
// `timers` module to run tasks without delay.
enqueueTaskImpl = timers.setImmediate;
```