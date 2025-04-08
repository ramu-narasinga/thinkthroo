!videoTitle Understanding queueMacroTask in React's Source Code

## !!steps
!duration 180

!title 1. Overview of queueMacroTask in React

```ts ! react/src/ReactAct.js
// queueMacroTask 
// (imported as enqueueTask) definition
// !callout[/enqueueTask/] Uses either Node's setImmediate or MessageChannel in browsers to enqueue macro tasks.
export default function enqueueTask(
  task: () => void
): void {
  // ...
  const requireString = ('require' + Math.random()).slice(0, 7);
  const nodeRequire = module && module[requireString];
  enqueueTaskImpl = nodeRequire
                      .call(module, 'timers')
                      .setImmediate;
  // ...
  }
  return enqueueTaskImpl(task);
}
```

## !!steps
!duration 200

!title 2. MacroTask Fallback in ReactAct.js

```ts ! react/src/ReactAct.js
// queueMacroTask used as fallback 
// when queueMicroTask isn't available
// !callout[/if/] React uses enqueueTask when queueMicroTask is unavailable, ensuring task enqueuing even in non-browser environments.
if (
    typeof queueMicrotask === 'undefined'
) {
  enqueueTask(() => {
    console.log(`
      Fallback to enqueueTask 
      as macro task
    `);
  });
}
```

## !!steps
!duration 210

!title 3. How React Manages MacroTask Enqueuing

```ts ! react/src/ReactAct.js
// queueSeveralMicrotasks switches 
// to queueMacroTask if necessary
// !callout[/queueSeveralMicrotasks/] Ensures that tasks are enqueued using MessageChannel in browsers, improving cross-environment compatibility.
queueSeveralMicrotasks(() => {
  if (!didAwaitActCall && !didWarnNoAwaitAct) {
    didWarnNoAwaitAct = true;
    console.error(`
      Async act was not awaited, 
      potential testing issues.
    `);
  }
});
```

## !!steps
!duration 200

!title 4. Practical Example of MacroTask vs MicroTask

```ts ! browser/execution/macro-vs-microtask.js
// Example: How macro tasks (setTimeout) and 
// micro tasks (queueMicroTask) interact with the event loop
// !callout[/console/] Demonstrates how setImmediate (macro task) and Promise.resolve (micro task) execute in the browser's event loop.
console.log('Start'); // 1
setTimeout(() => console.log('Macro task 1'), 0); // 5
queueMicrotask(() => console.log('Microtask 1')); // 3
console.log('End'); // 2
```