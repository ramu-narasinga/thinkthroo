```ts !! a
function greet(name: string): string
function greet(names: string[]): string[]
// !callout[/greet/] These two overload signatures define how the `greet` function can be called: either with a single string (for one name) or with an array of strings (for multiple names). This allows TypeScript to enforce type safety for both input types.
function greet(nameOrNames: string | string[]): string | string[] {
  if (Array.isArray(nameOrNames)) {
    return nameOrNames.map(name => `Hello, ${name}!`)
  }
  return `Hello, ${nameOrNames}!`
}
```

<!-- ```ts
// !callout[/useIsFeatureEnabled/] These are overload signatures. The first signature handles an array of features, returning an object with camelCase keys and boolean values.
function useIsFeatureEnabled<T extends Feature[]>(features: T): { 
  [key in FeatureToCamelCase<T[number]>]: boolean 
}
// !callout[/useIsFeatureEnabled/] The second signature handles a single feature, returning a boolean.
function useIsFeatureEnabled(features: Feature): boolean
// !callout[/useIsFeatureEnabled/] These signatures tell TypeScript the different ways the `useIsFeatureEnabled` function can be called, ensuring type safety for different input types.
function useIsFeatureEnabled<T extends Feature | Feature[]>(features: T) {
  const { profile } = useProfile()
  if (Array.isArray(features)) {
    return Object.fromEntries(
      features.map((feature) => [
        featureToCamelCase(feature),
        checkFeature(feature, profile?.disabled_features),
      ])
    )
  }

  return checkFeature(features, profile?.disabled_features)
}
```

```ts
function useIsFeatureEnabled<T extends Feature[]>(features: T): { 
  [key in FeatureToCamelCase<T[number]>]: boolean 
}
function useIsFeatureEnabled(features: Feature): boolean
function useIsFeatureEnabled<T extends Feature | Feature[]>(features: T) {
  const { profile } = useProfile()

  // !callout[/array of features/] This function overload handles the case where an array of features is passed. It processes each feature, converts it to camelCase, and checks if it's enabled.
  if (Array.isArray(features)) {
    return Object.fromEntries(
      features.map((feature) => [
        featureToCamelCase(feature),
        checkFeature(feature, profile?.disabled_features),
      ])
    )
  }

  return checkFeature(features, profile?.disabled_features)
}
```

```ts
// !callout[/checkFeature/] The `checkFeature` function is used to determine if a feature is enabled. It returns `true` if the feature is not found in the disabled features list, or if no disabled features are provided.
function checkFeature(feature: Feature, features?: Feature[]) {
  return !features?.includes(feature) ?? true
}
```

```ts -->
// !callout[/FeatureToCamelCase/] The `FeatureToCamelCase` utility type is responsible for converting feature names to camelCase format, ensuring consistent key names when dealing with an array of features.
type FeatureToCamelCase<S extends string> = // some implementation
```