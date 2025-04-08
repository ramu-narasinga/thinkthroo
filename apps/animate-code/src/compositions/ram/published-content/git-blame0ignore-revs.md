!videoTitle .git-blame-ignore-revs to Ignore Bulk Formatting Changes in Git

## !!steps

!duration 180

!title 1. What is .git-blame-ignore-revs?

```ts ! .git-blame-ignore-revs
// Overview of .git-blame-ignore-revs
// !callout[/text/] A feature in Git (since version 2.23) that allows you to ignore certain commits in git blame results, particularly useful for non-functional changes like bulk formatting or renaming.
* text=auto
```

## !!steps

!duration 200

!title 2. Why It Matters for Bulk Formatting Changes

```ts ! prettier-formatting
// Example of how formatting changes affect git blame
// !callout[/blame/] Formatting commits may obscure meaningful code history, showing formatting commits as responsible for lines instead of the real functional changes.
git blame someFile.tsx
// Output showing formatting commits obscuring meaningful history:
c998bb1e (Joe Bloggs 2023-03-15) import React from 'react';
fd2b3e13 (Alan 2023-04-01) function App() {
c998bb1e (Joe Bloggs 2023-03-15) return <div>Hello, world!</div>;
fd2b3e13 (Ben 2023-04-01) }
```

## !!steps

!duration 220

!title 3. How to Create and Use .git-blame-ignore-revs

```ts ! bash-commands
// Creating .git-blame-ignore-revs file and adding bulk formatting commit hashes
touch .git-blame-ignore-revs

// Add commit hashes:
echo 
  "# Prettier formatting changes" >> 
  .git-blame-ignore-revs
echo 
  "c998bb1ed4b3285398c9c7797135d3f060243c6a" >> 
  .git-blame-ignore-revs
echo 
  "fd2b3e13d330a4559f5aa21462e1cb2cbbcf144b" >> 
  .git-blame-ignore-revs

// Configure git to use the file automatically
git config blame.ignoreRevsFile .git-blame-ignore-revs
```

## !!steps

!duration 210

!title 4. Example of Git Blame Before and After

```ts ! bash-commands
// Example of git blame before using .git-blame-ignore-revs
git blame src/someFile.tsx

// Output showing commits for formatting changes:
c998bb1e (Joe Bloggs 2023-03-15) import React from 'react';
fd2b3e13 (Alan 2023-04-01) function App() {
c998bb1e (Joe Bloggs 2023-03-15) return <div>Hello, world!</div>;
fd2b3e13 (Ben 2023-04-01) }

// After using .git-blame-ignore-revs:
git blame src/someFile.tsx
// Output now skips formatting commits, showing meaningful history:
a23d9b34 (May 2022-12-01) import React from 'react';
b12e45a6 (JJ 2022-12-05) function App() {
a23d9b34 (Joe 2022-12-01) return <div>Hello, world!</div>;
b12e45a6 (Ram 2022-12-05) }
```

## !!steps

!duration 220

!title 5. Conclusion: Why You Should Use .git-blame-ignore-revs

```ts ! git-blame-summary
// Summing up the benefits of .git-blame-ignore-revs
// !callout[/text=/] `.git-blame-ignore-revs` improves the accuracy of `git blame` by skipping non-functional changes, helping teams maintain cleaner code history and focus on meaningful changes.
* text=auto
```