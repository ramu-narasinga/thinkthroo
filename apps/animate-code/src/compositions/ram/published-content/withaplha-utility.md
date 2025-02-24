!videoTitle Understanding withAlpha Utility in Tailwind CSS

## !!steps

!duration 180

!title 1. Introduction to withAlpha Utility

```ts ! withAlpha.ts
// Definition of withAlpha utility in Tailwind CSS
// !callout[/withAlpha/] A utility function that applies opacity to a color using the `color-mix()` CSS function.
export function withAlpha(
  value: string, alpha: string): string {
  if (alpha === null) return value;
  let alphaAsNumber = Number(alpha);
  if (!Number.isNaN(alphaAsNumber)) {
    alpha = `${alphaAsNumber * 100}%`;
  } else if (alpha[alpha.length - 1] !== '%') {
    alpha = `calc(${alpha} * 100%)`;
  }
  return `color-mix(
    in srgb, 
    ${value} ${alpha}, 
    transparent
  )`;
}
```

## !!steps
!duration 190

!title 2. Converting Alpha Values to Percentage

```ts ! withAlpha.ts
// Converting numeric alpha values to percentages
// !callout[/alphaAsNumber/] If the alpha is a numeric string like `"0.5"`, it is converted to a percentage by multiplying by 100.
let alphaAsNumber = Number(alpha);

if (!Number.isNaN(alphaAsNumber)) {
  alpha = `${alphaAsNumber * 100}%`;
}
```

## !!steps

!duration 200

!title 3. Ensuring Alpha is a Percentage

```ts ! withAlpha.ts
// Ensuring alpha is a percentage in other cases
// !callout[/alpha/] If alpha doesn't end with '%', it's converted into a percentage using `calc()`.
else if (alpha[alpha.length - 1] !== '%') {
  alpha = `calc(${alpha} * 100%)`;
}
```

## !!steps

!duration 210

!title 4. Using color-mix in withAlpha

```ts ! withAlpha.ts
// Returning color with applied alpha using color-mix
// !callout[/color-mix/] The final color with the specified alpha is returned using the `color-mix()` function.
return `color-mix(in srgb, ${value} ${alpha}, transparent)`;
```

## !!steps

!duration 230

!title 5. Understanding color-mix Function

```css ! color-mix-explanation
/* Explanation of color-mix */
/* !callout[/color-mix/] The `color-mix()` function takes two color values and blends them in the specified colorspace, allowing the alpha value to modify transparency. */
color-mix(in srgb, ${value} ${alpha}, transparent)
```