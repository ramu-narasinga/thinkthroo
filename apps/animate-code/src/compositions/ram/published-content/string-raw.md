!videoTitle Understanding String.raw in Tailwind CSS

## !!steps
!duration 180

!title 1. Introduction to String.raw

```ts ! vanilla.ts
// Basic example from MDN documentation
// !callout[/String.raw/] String.raw returns the raw string form of template literals without processing escape sequences.
const filePath = String.raw`C:\Development\profile\aboutme.html`;
console.log(`The file was uploaded from: ${filePath}`);
// Expected output: "C:\\Development\\profile\\aboutme.html"
```

## !!steps
!duration 200

!title 2. Example Without String.raw

```ts ! vanilla.ts
// Example without using String.raw
// !callout[/filePath/] Without String.raw, escape sequences like \n or backslashes get processed, affecting the output.
const filePath = `C:\Development\profile\aboutme.html`;
console.log(`The file was uploaded from: ${filePath}`);
// Expected output: "C:Developmentprofileaboutme.html"
```

## !!steps
!duration 210

!title 3. String.raw with Escape Sequences

```ts ! vanilla.ts
// Example with and without String.raw using escape sequences
const filePathWithoutStringRaw = 
`\nC:\Development\profile\aboutme.html`;
const filePathWithStringRaw = 
String.raw`\nC:\Development\profile\aboutme.html`;

// !callout[/filePathWithoutStringRaw/] String.raw ensures escape sequences are not processed, preserving the raw format.
console.log("filePathWithoutStringRaw:", filePathWithoutStringRaw);
console.log("filePathWithStringRaw:", filePathWithStringRaw);

// Expected output:
// filePathWithoutStringRaw: "
// C:Developmentprofileaboutme.html"
// filePathWithStringRaw: "\nC:\Development\profile\aboutme.html"
```

## !!steps
!duration 240

!title 4. String.raw in Tailwind CSS Source Code

```ts ! tailwindui.spec.ts
// Tailwind CSS source code usage in ui.spec.ts
// !callout[/test/] String.raw is used to handle template literals in Tailwind tests, especially for handling HTML and CSS snippets.
test(
`background gradient, 
"bg-linear-to-r from-red-500"`, 
async ({ page }) => {
  let { getPropertyValue } = await render(
    page,
    html`<div 
      id="x" 
      class="bg-linear-to-r from-red-500">
        Hello world
    </div>`,
  )
  // ...
});
```