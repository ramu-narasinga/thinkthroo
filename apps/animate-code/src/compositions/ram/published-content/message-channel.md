!videoTitle MessageChannel Usage in React Source Code

## !!steps
!duration 200

!title 1. Overview of MessageChannel

```js ! mdn_docs/MessageChannel
// MessageChannel basics from MDN Docs
// !callout[/MessageChannel/] The `MessageChannel` API creates a message channel with two ports for sending and receiving messages asynchronously.
const channel = new MessageChannel();
const output = document.querySelector(".output");
const iframe = document.querySelector("iframe");

// !callout[/iframe/] Sets up a listener on `port1` for receiving messages.
iframe.addEventListener("load", () => {
  channel.port1.onmessage = (e) => {
    output.innerHTML = e.data;
  };
  
  // !callout[/postMessage/] Sends a message from `port2` to trigger communication.
  iframe.contentWindow
    .postMessage("Hello!", "*", [channel.port2]);
});
```

## !!steps
!duration 210

!title 2. MessageChannel in React Source Code

```js ! react_shared/enqueueTask.js
// How React uses MessageChannel for task scheduling
// !callout[/MessageChannel/] React creates a new `MessageChannel` to schedule tasks more precisely.
const channel = new MessageChannel();

// !callout[/onmessage/] When `port1` receives a message, the task is executed.
channel.port1.onmessage = callback;

// !callout[/postMessage/] Triggers the task using `port2.postMessage`.
channel.port2.postMessage(undefined);
```

## !!steps
!duration 220

!title 3. Why React Uses MessageChannel Over setTimeout

```ts ! react_docs/explanation.md
// Explanation of MessageChannel's precision
// !callout[/enqueueTask/] React avoids using `setTimeout` or `setImmediate` as they are imprecise and may be affected by browser optimizations or testing environments.
const enqueueTask = (callback) => {
  // Use MessageChannel for precise task scheduling
  const channel = new MessageChannel();
  channel.port1.onmessage = callback;
  channel.port2.postMessage(undefined);
};
```

## !!steps
!duration 200

!title 4. Practical Example of MessageChannel in React

```js ! react_shared/enqueueTask.js
// Practical example of MessageChannel usage in React
// !callout[/enqueueTask/] Demonstrates how React avoids delays or faked timers in tests using MessageChannel.
const enqueueTask = (callback) => {
  const channel = new MessageChannel();
  channel.port1.onmessage = callback;
  channel.port2.postMessage(undefined);
};
enqueueTask(() => {
  console.log('Task executed asynchronously!');
});
```