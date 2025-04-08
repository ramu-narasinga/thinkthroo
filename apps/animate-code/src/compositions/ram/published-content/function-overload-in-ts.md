## !!steps

!duration 180

```jsx ! a
// !callout[/greet/] This overload signature defines how the `greet` function can be called: with a single string (for one name)
function greet(name: string): string
function greet(names: string[]): string[]
function greet(nameOrNames: string | string[]): string | string[] {
  if (Array.isArray(nameOrNames)) {
    return nameOrNames.map(name => `Hello, ${name}!`)
  }
  return `Hello, ${nameOrNames}!`
}
```
## !!steps

!duration 180

```jsx ! b
function greet(name: string): string
// !callout[/greet/] This overload signature defines how the `greet` function can be called: with an array of strings (for multiple names).
function greet(names: string[]): string[]
function greet(nameOrNames: string | string[]): string | string[] {
  if (Array.isArray(nameOrNames)) {
    return nameOrNames.map(name => `Hello, ${name}!`)
  }
  return `Hello, ${nameOrNames}!`
}
```

## !!steps

!duration 180

```jsx ! c
function greet(name: string): string
function greet(names: string[]): string[]
// !callout[/greet/] These two overload signatures define how the `greet` function can be called: either with a single string (for one name) or  This allows TypeScript to enforce type safety for both input types.
function greet(nameOrNames: string | string[]): string | string[] {
  if (Array.isArray(nameOrNames)) {
    return nameOrNames.map(name => `Hello, ${name}!`)
  }
  return `Hello, ${nameOrNames}!`
}
```