```markdown
## !!steps

!duration 100

```js ! /symbol-usage.js
// !callout[/Symbol/] Create a unique symbol using Symbol().
const mySymbol = Symbol('description');
```

## !!steps

!duration 100

```js ! /symbol-usage.js
// !callout[/const sym1/] Each symbol is unique, even if created with the same description.
const sym1 = Symbol('description');
const sym2 = Symbol('description');

console.log(sym1 === sym2); // false
```

## !!steps

!duration 100

```js ! /symbol-usage.js
// !callout[/const obj/] Symbols can be used as keys for object properties.
const obj = {};
const uniqueKey = Symbol('uniqueKey');

obj[uniqueKey] = 'value';
console.log(obj[uniqueKey]); // 'value'
```

## !!steps

!duration 100

```js ! /symbol-usage.js
// !callout[/iterable/] JavaScript defines built-in symbols like Symbol.iterator.
const iterable = {
  [Symbol.iterator]: function* () {
    yield 1;
    yield 2;
    yield 3;
  }
};

for (const value of iterable) {
  console.log(value); // 1, 2, 3
}
```
