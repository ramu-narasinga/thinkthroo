!videoTitle How to Create a Unique Array Using Set() in JavaScript

## !!steps
!duration 200

!title 1. Introduction to Creating a Unique Array with Set()

```ts ! JavaScript
// Example of using Set() to create a unique array
// !callout[/Set/] The Set object allows you to store unique values, removing duplicates from an array.
const uniqueArray = new Set([1, 2, 3, 1, 2, 5, 4, 3]);
// Result: Set(5) {1, 2, 3, 5, 4}
```

## !!steps
!duration 210

!title 2. Unique Function Implementation in TypeDoc

```ts ! TypeDoc/src/lib/utils/array.ts
// Implementation of unique function in TypeDoc
// !callout[/unique/] This function returns a new array with only unique values from the input array or iterable object.
export function unique<T>(arr: Iterable<T> | undefined): T[] {
  return Array.from(new Set(arr));
}
```

## !!steps
!duration 220

!title 3. Array.from and Its Role in the Unique Function

```ts ! JavaScript
// Understanding Array.from in the unique function
// !callout[/Array.from/] Array.from creates a new shallow-copied array from any iterable, such as a Set, which removes duplicate values.
const uniqueValues = Array.from(new Set([1, 2, 2, 3, 4, 5]));
console.log(uniqueValues); // Output: [1, 2, 3, 4, 5]
```

## !!steps
!duration 210

!title 4. Alternative Approach Using Spread Operator

```ts ! JavaScript
// Alternative approach for creating a unique array
// !callout[/uniqueArray/] The spread operator can also be used to convert a Set into an array, achieving the same result as Array.from.
const uniqueArray = [...new Set([1, 2, 3, 1, 2, 4, 5])];
console.log(uniqueArray); // Output: [1, 2, 3, 4, 5]
```

## !!steps
!duration 200

!title 5. How TypeDoc Uses the Unique Function

```ts ! TypeDoc/src/lib/application.ts
// Usage of unique function in TypeDoc
// !callout[/unique/] In TypeDoc, the unique function is used to ensure unique values in an array, preventing duplicates in configurations or data.
import { unique } from "./utils/array";

// Example usage in TypeDoc
const uniqueList = unique([1, 2, 3, 3, 4]);
console.log(uniqueList); // Output: [1, 2, 3, 4]
```