!videoTitle Exploring downloadInBrowser in Refine Source Code

## !!steps

!duration 220

!title 1. Overview of downloadInBrowser Function

```ts ! refine/src/helpers.ts
// downloadInBrowser function definition
// !callout[/downloadInBrowser/] Facilitates downloading a file in the browser by dynamically creating an anchor link and triggering a click event.
export const downloadInBrowser = (
  filename: string,
  content: string,
  type?: string,
) => {
  if (typeof window === "undefined") return;

  const blob = new Blob([content], { type });
}
```

## !!steps

!duration 220

!title 2. Creating an Anchor Link

```ts ! refine/src/helpers.ts
// Creating an anchor link for download
const link = document.createElement("a");
link.setAttribute("visibility", "hidden");
link.download = filename;
// !callout[/blobUrl/] The blob URL is set to the link, enabling file download.
const blobUrl = URL.createObjectURL(blob);
link.href = blobUrl;
```

## !!steps

!duration 220

!title 3. Triggering Download and Cleanup

```ts ! refine/src/helpers.ts
// Appending, triggering download, and cleanup
document.body.appendChild(link);
link.click();
document.body.removeChild(link);
// !callout[/setTimeout/] Ensures memory cleanup by revoking the blob URL.
setTimeout(() => URL.revokeObjectURL(blobUrl), 0);
```

## !!steps

!duration 220

!title 4. Practical Example of downloadInBrowser

```ts ! refine/src/helpers.ts
// Using downloadInBrowser to download a JSON file
// !callout[/downloadInBrowser/] Demonstrates a practical use case for exporting JSON data.
downloadInBrowser(
  "data.json",
  JSON.stringify({ key: "value" }),
  "application/json"
);

```

---

**Title:** Understanding the downloadInBrowser Function in Refine  
**Description:** Discover how the downloadInBrowser function in Refine simplifies file downloads in the browser using dynamic anchor links. Learn its implementation and a practical example.  
**Tags:** #Refine #JavaScript #TypeScript #WebDevelopment #OpenSource  
```