!videoTitle Understanding useIsMobile Hook in Vercel AI Chatbot

## !!steps

!duration 220

!title 1. useIsMobile Hook Overview

```ts ! vercel/hooks/use-mobile.ts
// !callout[/function/] Custom hook that detects if the viewport is mobile-sized using `matchMedia`.
export function useIsMobile() {
  const [isMobile, setIsMobile] =
    React.useState<boolean | undefined>(undefined);
  // hook starts with undefined state
}
```

## !!steps

!duration 220

!title 2. Setting Up matchMedia for Responsiveness

```ts ! vercel/hooks/use-mobile.ts
// !callout[/useEffect/] Uses `matchMedia` to check if screen width is below MOBILE_BREAKPOINT.
React.useEffect(() => {
  const mql = window.matchMedia('(max-width: 767px)');
  const onChange = () => {
    setIsMobile(window.innerWidth < 768);
  };
```

## !!steps

!duration 220

!title 3. Listening for Viewport Changes

```ts ! vercel/hooks/use-mobile.ts
// !callout[/addEventListener/] Registers change listener to update state on viewport resize.
  mql.addEventListener('change', onChange);
  setIsMobile(window.innerWidth < 768);
  return () => {
    mql.removeEventListener('change', onChange);
  };
}, []);
```

## !!steps

!duration 220

!title 4. Why use !!isMobile and Cleanup Importance

```ts ! vercel/hooks/use-mobile.ts
// !callout[/isMobile/] Ensures a boolean is always returned.
return !!isMobile;
// ensures we don't return undefined
}
```

## !!steps

!duration 220

!title 5. Summary of useIsMobile Behavior

```ts ! vercel/hooks/use-mobile.ts
// !callout[/Behavior/] Initializes, subscribes to changes, returns boolean — clean and efficient.
useIsMobile(); // Usage returns true if width < 768
// - Initial state: undefined
// - Updates on window resize
// - Cleaned up on unmount
```


**title**: Detecting Mobile Viewports with `useIsMobile` Hook

**description**: In this video, we break down the `useIsMobile` custom hook from Vercel’s AI Chatbot project. This concise React hook uses `window.matchMedia` to track screen size and determine if the user is on a mobile device, with clean event handling and return logic.

**tags**: zustand, vercel, react hooks, responsive design, matchMedia, open source, react, frontend, useEffect, javascript
```
