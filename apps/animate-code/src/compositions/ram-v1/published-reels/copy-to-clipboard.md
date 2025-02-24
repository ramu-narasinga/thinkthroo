```ts !! a
function copyToClipboard(text: string) {
   // !callout[/navigator.clipboard.writeText/] This function uses the modern `navigator.clipboard.writeText` API to copy text to the clipboard. It is simple and works in most modern browsers.
  navigator.clipboard.writeText(text)
  console.log("Text copied to clipboard!")
}
```

```ts !! b
function copyToClipboard(text: string) {
  if (!navigator.clipboard) {
    // !callout[/fallbackCopyTextToClipboard/] This adds a fallback method to handle cases where the `navigator.clipboard` API is not supported, ensuring broader compatibility.
    fallbackCopyTextToClipboard(text)
    return
  }
  navigator.clipboard.writeText(text)
  console.log("Text copied to clipboard!")
}

function fallbackCopyTextToClipboard(text: string) {
    // to be implemented
}
```

```ts !! c
function fallbackCopyTextToClipboard(text: string) {
  var textArea = document.createElement("textarea")
  textArea.value = text
  // ...

  try {
    // !callout[/document.execCommand/] This fallback method uses `document.execCommand("copy")` to copy text, which is supported in older browsers. The textarea element is temporarily created to select and copy the text.
    document.execCommand("copy")
    console.log("Text copied using fallback!")
  } catch (err) {
    console.error("Fallback: Unable to copy", err)
  }
  
  // ...
}
```