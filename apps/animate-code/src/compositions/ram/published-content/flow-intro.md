!videoTitle Understanding $FlowFixMe and Flow Usage in React Source Code

## !!steps
!duration 200

!title 1. What is Flow?

```js ! flow.org/docs/quickstart
// What is Flow?
// !callout[/flow/] Flow is a static type checker for JavaScript, designed to catch common errors in your codebase by analyzing your code’s type annotations.
@flow
```

## !!steps
!duration 220

!title 2. Adding Flow to a JavaScript Project

```js ! flow.org/docs/quickstart
// Adding Flow to a project
// !callout[/@flow/] To enable Flow in a JavaScript file, you need to add the `@flow` comment at the top of your file. This tells Flow to check this file for type errors.
@flow
```

```js ! react/source-code
// Example of enabling Flow in a React project
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * @flow
 */
// !callout[/type/] In React source code, Flow is enabled in specific files using the `@flow` comment, allowing static type checking across various components.
import type {
  ReactNodeList,
  Thenable,
  PendingThenable,
  FulfilledThenable,
  RejectedThenable,
} from 'shared/ReactTypes';
```

## !!steps
!duration 250

!title 3. Handling Special Cases with $FlowFixMe

```js ! react/source-code
// Example of $FlowFixMe usage in React
// !callout[/exampleFunction/] Flow sometimes fails to infer types correctly, especially in legacy code or edge cases. React uses `$FlowFixMe` to silence Flow errors in certain parts of the code.
function exampleFunction(obj) {
  // $FlowFixMe
  return obj['invalid-key'];
}
```

## !!steps
!duration 230

!title 4. Using $FlowFixMe[invalid-computed-prop]

```js ! react/source-code
// Handling computed property Flow error
// !callout[/exampleObject/] When Flow detects an invalid computed property, React developers use `$FlowFixMe[invalid-computed-prop]` to bypass the error in certain cases. This is useful when refactoring large codebases.
const exampleObject = {
  // $FlowFixMe[invalid-computed-prop]
  [someKey]: 'value',
};
```

## !!steps
!duration 240

!title 5. Types and Interfaces in React Source Code (ReactTypes.js)

```ts ! react/source-code
// Types and Interfaces in React
// !callout[/ReactPortal/] React uses Flow types to define objects like ReactPortal, ensuring static type safety across components.
export type ReactPortal = {
  $$typeof: symbol | number,
  key: null | string,
  containerInfo: any,
  children: ReactNodeList,
  implementation: any, // For cross-renderer implementation
};
```

## !!steps
!duration 250

!title 6. Flow vs TypeScript: Understanding the DX

```ts ! react/source-code
// Flow vs TypeScript DX
// !callout[/TypeScript/] While both Flow and TypeScript provide type-checking for JavaScript, Flow was introduced in 2014 (two years after TypeScript). Many large projects, including React, still use Flow due to its flexibility and integration with existing JavaScript codebases.
Flow vs TypeScript
```