```ts !! a
const user = {
  name: "Lorem",
  age: 26,
}

if (Array.isArray(user)) {
  console.log("user:", user);
}

console.log(user)
//           ^?
```

```ts !! b
const user = {
  name: "Lorem",
  age: 26,
}
// @errors: 2339
console.log(user.location)
```

```ts !! c
const user = {
  name: "Lorem",
  age: 26,
  location: "Ipsum",
}

console.log(user.location)
//           ^?
```
