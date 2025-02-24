!videoTitle Understanding queueMicroTask in React's Source Code

## !!steps
!duration 180

!title 1. Overview of queueMicroTask

```ts ! react/src/ReactAct.js
// queueMicroTask definition
// !callout[/queue/] Queues a microtask to be executed at a safe time before control returns to the event loop.
queueMicrotask(() => {
  // Microtask logic
});
```

## !!steps
!duration 190

!title 2. queueMicroTask in ReactAct.js

```ts ! react/src/ReactAct.js
// queueMicroTask usage in ReactAct.js
// !callout[/queueSeveralMicrotasks/] Calls queueMicroTask to manage React's act warning system.
queueSeveralMicrotasks(() => {
  if (!didAwaitActCall && !didWarnNoAwaitAct) {
    didWarnNoAwaitAct = true;
    console.error(
      `You called act without await, 
      causing testing issues.`);
  }
});
```

## !!steps
!duration 200

!title 3. Purpose of queueMicroTask in React Testing

```ts ! react/src/ReactAct.js
// queueSeveralMicrotasks used 
// to warn when act is not awaited
// !callout[/queue.length/] Ensures that developers await `act` calls, which helps manage asynchronous React updates correctly.
if (queue.length !== 0) {
  queueSeveralMicrotasks(() => {
    if (
      !didAwaitActCall && 
      !didWarnNoAwaitAct
    ) {
      didWarnNoAwaitAct = true;
      console.error(
        `A component suspended inside an act scope, 
        but the act call was not awaited.`);
    }
  });
}
```

## !!steps
!duration 180

!title 4. Example of queueMicroTask vs setTimeout

```ts ! browser/execution/microtask-vs-macrotask.js
// Example of microtasks vs macrotasks
// !callout[/Synchronous/] Executes after the current synchronous task but before macrotasks.
console.log('Synchronous 1'); // 1
Promise.resolve().then(() => console.log('Microtask 1')); // 3
console.log('Synchronous 2'); // 2
setTimeout(() => console.log('Macrotask 1'), 0); // 5
console.log('Synchronous 3'); // 4
```

## !!steps
!duration 190

!title 5. Breakdown of Microtasks and Macrotasks Execution

```ts ! browser/execution/microtask-vs-macrotask.js
// Final output:
// Breakdown of microtask and macrotask interaction
// !callout[/Synchronous/] The synchronous code runs first, followed by microtasks, and then macrotasks.
// Synchronous 1
// Synchronous 2
// Synchronous 3
// Microtask 1
// Macrotask 1
```