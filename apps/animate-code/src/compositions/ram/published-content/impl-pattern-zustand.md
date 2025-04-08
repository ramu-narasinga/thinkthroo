!videoTitle The Impl Pattern in Zustand: createStore vs. createWithEqualityFn"

## !!steps

!duration 200

!title 1. Overview of the Impl Pattern

```ts ! zustand/src/vanilla.ts
// createStore function
// !callout[/createStore/] A factory function that calls createStoreImpl to handle store creation, depending on whether a createState function is provided.
export const createStore = ((createState) =>
  createState ? 
  createStoreImpl(createState) : 
  createStoreImpl) as CreateStore;
```

## !!steps

!duration 210

!title 2. The Role of createStoreImpl

```ts ! zustand/src/vanilla.ts
// !callout[/createStoreImpl/] Implements the store creation logic, setting up state management functions and returning an API object.
const createStoreImpl: CreateStoreImpl = (createState) => {
  const api = { 
    setState, 
    getState, 
    getInitialState, 
    subscribe 
  };
  const initialState = (
    state = createState(setState, getState, api)
  );
  return api as any;
```

## !!steps

!duration 220

!title 3. createWithEqualityFn and its Impl Pattern

```ts ! zustand/src/traditional.ts
// createWithEqualityFn function
// !callout[/createWithEqualityFn/] A factory function that calls createWithEqualityFnImpl to provide custom store functionality with equality function support.
export const createWithEqualityFn = (<T>(
  createState: StateCreator<T, [], []> | undefined,
  defaultEqualityFn?: <U>(a: U, b: U) => boolean,
) =>
  createState
    ? createWithEqualityFnImpl(createState, defaultEqualityFn)
    : createWithEqualityFnImpl) as CreateWithEqualityFn
```

## !!steps

!duration 200

!title 4. Exploring createWithEqualityFnImpl

```ts ! zustand/src/traditional.ts
// !callout[/createWithEqualityFnImpl/] Implements the custom store functionality, extending the basic store setup with additional capabilities like equality functions.
const createWithEqualityFnImpl = <T>(
  createState: StateCreator<T, [], []>,
  defaultEqualityFn?: <U>(a: U, b: U) => boolean,
) => {
  const api = createStore(createState);
  const useBoundStoreWithEqualityFn: any = (
    selector?: any,
    equalityFn = defaultEqualityFn,
  ) => useStoreWithEqualityFn(api, selector, equalityFn);
  Object.assign(useBoundStoreWithEqualityFn, api);
  return useBoundStoreWithEqualityFn;
```