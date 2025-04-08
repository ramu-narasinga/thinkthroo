!videoTitle createStore in Zustand's Source Code Explained

## !!steps

!duration 200

!title 1. Understanding createStore

```js ! zustand/src/vanilla.ts
// `createStore` is an arrow function that either invokes 
// `createStoreImpl(createState)` or 
// returns `createStoreImpl` directly.
// !callout[/createStore/] This function 
// handles the initialization of the Zustand store. 
export const createStore = ((createState) =>
  createState ? 
  // !callout[/createStoreImpl/] If `createState` is provided, it uses `createStoreImpl` to set up the store.
  createStoreImpl(createState) : createStoreImpl) as CreateStore

```

## !!steps

!duration 200

!title 2. The setState Function

```js ! zustand/src/vanilla.ts
// !callout[/setState/] Updates the store state and notifies listeners. 
const setState: 
StoreApi<TState>['setState'] = (partial, replace) => {
  const nextState =
    typeof partial === 'function'
      ? (partial as (state: TState) => TState)(state)
      : partial
  if (!Object.is(nextState, state)) {
    const previousState = state
    state =
      (replace ?? 
        (typeof nextState !== 'object' || nextState === null))
        ? (nextState as TState)
        // !callout[/Object.assign/] Uses `Object.assign()` to merge changes if `replace` is null.
        : Object.assign({}, state, nextState)
    listeners.forEach(
      (listener) => listener(state, previousState)
    )
  }
}
```

## !!steps

!duration 200

!title 3. getState and getInitialState function

```js ! zustand/src/vanilla.ts
// !callout[/getState/] Returns the current state.
const getState: 
StoreApi<TState>['getState'] = () => state

// !callout[/getInitialState/] Returns the initial state.
const getInitialState: 
StoreApi<TState>['getInitialState'] = () =>
  initialState

```

## !!steps

!duration 200

!title 4. subscribe function

```js ! zustand/src/vanilla.ts
// !callout[/subscribe/] Adds a listener for state changes and returns an unsubscribe function.
const subscribe: 
StoreApi<TState>['subscribe'] = (listener) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

const api = { setState, getState, getInitialState, subscribe }
const initialState = 
(state = createState(setState, getState, api))
return api as any
}
```