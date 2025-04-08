## !!steps

!duration 100

!title 1. Installing Jotai

```bash ! /project-root
# !callout[/install jotai/] Install Jotai in your project using npm or yarn.
npm install jotai
# or
yarn add jotai
```

## !!steps

!duration 100

!title 2. Define Jotai atoms

```tsx ! /src/atoms.js
// !callout[/jotai/] Define atoms for state management using Jotai.
import { atom } from 'jotai';

export const countAtom = atom(0);
```

## !!steps

!duration 100

!title 3. Setup countAtom

```tsx ! /src/Counter.js 
import React from 'react';
// !callout[/useAtom/] Use atoms in your React components to manage state.
import { useAtom } from 'jotai';
import { countAtom } from './atoms';

function Counter() {
  // !callout[/count/] count, setCount can be in your component
  const [count, setCount] = useAtom(countAtom);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
	  	Increment
	  </button>
    </div>
  );
}

export default Counter;
```

## !!steps

!duration 100

!title 4. Counter component

```tsx ! /src/App.js
// !callout[/React/] Integrate the component using atoms into your main application component.
import React from 'react';
import Counter from './Counter';

function App() {
  return (
    <div>
      <h1>Jotai Example</h1>
      <Counter />
    </div>
  );
}

export default App;
```