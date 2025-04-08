!videoTitle Understanding Object.preventExtensions in React's Source Code

## !!steps
!duration 180

!title 1. Overview of Object.preventExtensions

```ts ! react-reconciler/src/ReactFiber.js
// Object.preventExtensions usage in React
// !callout[/Object.preventExtensions/] Prevents new properties from being added to an object and its prototype from being reassigned.
Object.preventExtensions(object1);
```

## !!steps
!duration 190

!title 2. Example of Object.preventExtensions from MDN Docs

```ts ! mdn/objects/preventExtensions.js
// !callout[/object1/] Stops new properties from being defined on an object.
const object1 = {};
Object.preventExtensions(object1);
try {
  Object.defineProperty(
    object1, 
    'property1', 
    { value: 42 }
  );
} catch (e) {
 console.log(e); 
 // Expected output:
 // TypeError: Cannot define property property1, 
//  object is not extensible
}
```

## !!steps
!duration 210

!title 3. Object.preventExtensions in React: FiberNode Example

```ts ! react-reconciler/src/ReactFiber.js
// FiberNode calls Object.preventExtensions
// !callout[/FiberNode/] React's FiberNode uses Object.preventExtensions to prevent adding new properties to its instances.
function FiberNode() {
  // ...
  Object.preventExtensions(this);
}
// !callout[/createFiberImplClass/] FiberNode is called within the createFiberImplClass function, preventing unwanted changes to its structure.
createFiberImplClass() {
  // ...
  return new FiberNode();
}
```

## !!steps
!duration 200

!title 4. Why Object.preventExtensions is Used in React

```ts ! react-reconciler/src/ReactFiber.js
// !callout[/preventExtensions/] In the React Fiber architecture, preventing extensions ensures the stability and integrity of core objects.
Object.preventExtensions(this);
// Explanation: Prevents modifications that could
// affect performance or introduce unexpected behaviors.
```