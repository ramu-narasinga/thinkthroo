!videoTitle Preventing Subscriber Overwrite in Zustand

## !!steps

!duration 200

!title 1. Understanding Issue #86

```ts ! react/src/issues/issue86Background.ts
// Background on Issue #86
// !callout[/create/] Github Issue #86 in Zustand involved subscribers being overwritten with the same index when components remounted, causing updates to be missed.
import { create } from 'zustand';

const useBoundStore = create(() => ({ count: 0 }));
```

## !!steps

!duration 200

!title 2. Adding Initial Subscriber

```ts ! react/src/issues/testCaseIssue86.ts
// Test case for Issue #86 - Adding Initial Subscriber
import { render } from '@testing-library/react';
import { useBoundStore } from './store';

function Count1() {
  const c = useBoundStore((s) => s.count);
  return <div>count1: {c}</div>;
}

// !callout[/render/] Render the initial component and subscribe to the store.
const { findAllByText, rerender } = render(<Count1 />);
```

## !!steps

!duration 200

!title 3. Replacing Subscriber

```ts ! react/src/issues/testCaseIssue86.ts
// Test case for Issue #86 - Replacing Subscriber
// !callout[/Count2/] Replace the existing subscriber with a new one and verify state consistency.
function Count2() {
  const c = useBoundStore((s) => s.count);
  return <div>count2: {c}</div>;
}

rerender(<Count2 />);
```

## !!steps

!duration 200

!title 4. Adding Additional Subscribers

```ts ! react/src/issues/testCaseIssue86.ts
// Test case for Issue #86 - Adding Additional Subscribers
// !callout[/rerender/] Add more subscribers and ensure they receive the correct updates.
rerender(
  <StrictMode>
    <Count2 />
    <Count1 />
    <Count1 />
  </StrictMode>
);
```

## !!steps

!duration 200

!title 5. Validating State Updates

```ts ! react/src/issues/testCaseIssue86.ts
// Test case for Issue #86 - Validating State Updates
import { act } from '@testing-library/react';

act(() => setState({ count: 1 }));

// !callout[/findAllByText/] Ensure all components receive state updates correctly.
expect((await findAllByText('count1: 1')).length).toBe(2);
expect((await findAllByText('count2: 1')).length).toBe(1);
```