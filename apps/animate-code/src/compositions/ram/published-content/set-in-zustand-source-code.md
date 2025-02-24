!videoTitle "set" in Zustand's source code explained

## !!steps

!duration 200

!title 1. Understanding createStore

```js ! zustand/src/vanilla.ts
const createStoreImpl: CreateStoreImpl = (createState) => {
  // ...

  const api = { setState, getState, getInitialState, subscribe }
  // !callout[/createState/] createState is what you pass to "create" function
  const initialState = (state = createState(setState, getState, api))
  return api as any
}

```

## !!steps

!duration 200

!title 2. Initializing create

```js ! example/app.jsx
// !callout[/create/] You pass an arrow function that has a parameter named "set" 
const useStore = create((set) => ({
  // !callout[/count/] But where is this "set" coming from?
  count: 1,
  // !callout[/set/] This set function is used to mutate state
  inc: () => set((state) => ({ count: state.count + 1 })),
}))

```

## !!steps

!duration 200

!title 3. Arrow function in Javascript

```js ! zustand/src/vanilla.ts
let state = null
// !callout[/arrowFn/] A simple arrow function
let arrowFn = (set) => {
  console.log("arrowFn called", set)
  set()
};

// !callout[/set/] A simple set function updating state
let set = () => state = {count: 0}

// !callout[/arrowFn/] Arrow function called with set function
arrowFn(set)
// Notice how the arrow function is called with set function
// which is a parameter in arrowFn

// state = {count: 0}

// Following this logic

```

## !!steps

!duration 200

!title 4. createState(setState, getState, api)

```js ! zustand/src/vanilla.ts

const api = { setState, getState, getInitialState, subscribe }
const initialState = 
// !callout[/createState/] createState here is your arrow function 
(state = createState(setState, getState, api))
// setState is a function defined somewhere above
// This is how you have access to set, get functions
return api as any
}
```