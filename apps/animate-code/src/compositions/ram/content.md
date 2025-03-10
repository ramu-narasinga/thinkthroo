!videoTitle WeakMap in react-scan vs next-mdx

## !!steps

!duration 220

!title 1. WeakMap Usage in react-scan

```ts ! react-scan/src/instrumentation.ts
// Cache initialization in react-scan
// !callout[/WeakMap/] WeakMap stores object references without preventing garbage collection.
const cache = new WeakMap<object, string>();

export function fastSerialize(value: unknown, depth = 0): string {
  if (value === null) return 'null';
  if (cache.has(value)) return cache.get(value) ?? '';
}
```

## !!steps

!duration 220

!title 2. WeakMap Usage in next-mdx

```ts ! next-mdx/src/loader.ts
// Cache initialization in next-mdx
// !callout[/WeakMap/] Used to store compiler-related data dynamically.
const cache = new WeakMap();

function loader(value, bindings, callback) {
  const compiler = this._compiler || marker;
  let map = cache.get(compiler) ?? new Map();
  cache.set(compiler, map);
}
```

## !!steps

!duration 220

!title 3. Common Pattern in Both Implementations

```ts ! shared/pattern.ts
// Common caching pattern using WeakMap
// !callout[/cache.has/] Checks if an object is already stored.
if (cache.has(value)) {
  return cache.get(value);
}
// !callout[/cache.set/] Adds an object to the cache.
cache.set(value, computedValue);
```

## !!steps

!duration 220

!title 4. How WeakMap Works Internally

```ts ! concepts/weakmap.ts
// Example explaining WeakMap behavior
// !callout[/obj/] WeakMap keys are weakly referenced.
let obj = {};
const wm = new WeakMap();
wm.set(obj, "data");
obj = null; // Key-value pair gets garbage collected.
```

## !!steps

!duration 220

!title 5. When to Use WeakMap

```ts ! concepts/usage.ts
// Ideal use cases for WeakMap
// !callout[/const/] Use WeakMap for private data storage or caching.
const wm = new WeakMap();
function storePrivateData(obj, data) {
  wm.set(obj, data);
}
```

## Title, Description, and Tags

**Title:** WeakMap in react-scan vs next-mdx - A Code Review

**Description:** A deep dive into how WeakMap is used in react-scan and next-mdx for caching. We explore common patterns and best practices in open-source codebases.

**Tags:** #JavaScript #WeakMap #ReactScan #NextJS #OpenSource #WebPerformance

