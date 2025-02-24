!videoTitle Understanding DefaultMap Class in Tailwind CSS

## !!steps
!duration 180

!title 1. Introduction to DefaultMap

```ts ! defaultmap.ts
// Definition of DefaultMap class in Tailwind CSS
// !callout[/DefaultMap/] A custom Map class that generates default values for missing keys, avoiding recomputation.
export class DefaultMap<T = string, V = any> 
  extends Map<T, V> {
  constructor(
    private factory: (
      key: T, 
      self: DefaultMap<T, V>
    ) => V
  ) {
    super();
  }

  get(key: T): V {
    // ...
  }
}
```

## !!steps
!duration 200

!title 2. Constructor and Factory Function

```ts ! defaultmap.ts
// Understanding the constructor of DefaultMap
// !callout[/constructor/] The constructor accepts a factory function that generates default values when a key is missing. It also calls `super()` to inherit Map behavior.
constructor(
    private factory: (
      key: T, 
      self: DefaultMap<T, V>
    ) => V
  ) {
    super();
  }
```

## !!steps
!duration 210

!title 3. get Method in DefaultMap

```ts ! defaultmap.ts
// The get method retrieves values
//  or generates a default one if not found
// !callout[/get/] The `get` method first checks if a value exists for the key. If it doesn't, it calls the factory to generate the value and stores it in the map.
get(key: T): V {
  let value = super.get(key);

  if (value === undefined) {
    value = this.factory(key, this);
    this.set(key, value);
  }

  return value;
}
```

## !!steps
!duration 220

!title 4. Usage Example of DefaultMap in Tailwind

```ts ! design-system.ts
// Example usage of DefaultMap in 
// Tailwind CSS (design-system.ts)
// !callout[/parsedVariants/] DefaultMap is initialized with a factory function that generates values using the `parseVariant` function.
let parsedVariants = new DefaultMap(
  (variant) => parseVariant(variant, designSystem)
);
```

## !!steps
!duration 240

!title 5. The parseVariant Function in the Factory

```ts ! design-system.ts
// Value returned by parseVariant function, 
// used to populate DefaultMap
// !callout[/return/] The factory method returns a value object representing a parsed variant with properties like selector and compounds.
return {
  kind: 'arbitrary',
  selector,
  compounds: true,
  relative,
};
```