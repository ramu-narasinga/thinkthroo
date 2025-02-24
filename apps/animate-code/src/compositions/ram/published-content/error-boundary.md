!videoTitle Here's how Zustand's test-case uses ErrorBoundary

## !!steps

!duration 200

!title 1. Overview of Zustand's ErrorBoundary in Test Case

```ts ! zustand/tests/basic.test.tsx
// Zustand's test-case that uses a custom ErrorBoundary
// !callout[/ErrorBoundary/] The ErrorBoundary component is used to handle errors thrown inside the equality function in Zustand's test.
class ErrorBoundary extends ClassComponent<
  { children?: ReactNode | undefined },
  { hasError: boolean }
> {
  constructor(props: { children?: ReactNode | undefined }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    return this.state.hasError ? 
      <div>errored</div> : 
      this.props.children;
  }
}
```

## !!steps

!duration 210

!title 2. Understanding the Equality Function Error

```ts ! zustand/tests/basic.test.tsx
// Defining the equality function 
// which is expected to throw an error
// !callout[/equalityFn/] The equality function will throw an error when `value` is not a string.
const equalityFn = (a: State, b: State) =>
// Throws an error when `value` is a number.
  a.value.trim() === b.value.trim(); 
```

## !!steps

!duration 220

!title 3. Component that Uses the Error-Prone Equality Function

```ts ! zustand/tests/basic.test.tsx
// Component that uses the 
// useBoundStore hook and equality function
function Component() {
  // !callout[/useBoundStore/] This component will trigger the equality function in the Zustand store.
  useBoundStore(selector, equalityFn);
  return <div>no error</div>;
}
```

## !!steps

!duration 230

!title 4. Rendering the ErrorBoundary in a Test

```ts ! zustand/tests/basic.test.tsx
// Rendering the Component inside the ErrorBoundary in the test
const { findByText } = render(
  <StrictMode>
    // !callout[/ErrorBoundary/] The ErrorBoundary catches errors thrown in the equality function during this test.
    <ErrorBoundary>
      <Component />
    </ErrorBoundary>
  </StrictMode>,
);

await findByText('no error');
```

## !!steps

!duration 240

!title 5. Triggering and Testing the Error Handling

```ts ! zustand/tests/basic.test.tsx
// Triggering an error by changing the store state to a number
// !callout[/act/] This causes the equality function to throw an error, which is caught by the ErrorBoundary.
act(() => {
  setState({ value: 123 });
});

// The test waits for the UI to render the 'errored' message
await findByText('errored');
```