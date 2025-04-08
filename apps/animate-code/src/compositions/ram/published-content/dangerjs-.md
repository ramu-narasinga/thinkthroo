!videoTitle Stop Saying 'You Forgot' in Code Review: Danger.js in React

## !!steps

!duration 180

!title 1. Introduction to Danger.js in React

```ts ! react/dangerfile.js
// Danger.js usage in the React source code
// !callout[/Danger.js/] Danger.js automates code review chores, such as enforcing changelogs and monitoring PR size changes in CI.
const { markdown, danger, warn } = require('danger');
```

## !!steps

!duration 220

!title 2. Purpose of `warn` and `markdown`

```ts ! react/dangerfile.js
// Example of `warn` and `markdown` 
// usage in react/dangerfile.js (React source code)
// !callout[/warn/] `warn` highlights issues that don’t block the build, showing warnings in the code review.
warn("This change increases the build size significantly.");

// !callout[/markdown/] `markdown` outputs formatted messages directly in the code review comment.
markdown(`Please ensure that large PRs 
include an explanation of changes.`);
```

## !!steps

!duration 210

!title 3. Understanding `danger.git` in React’s Dangerfile

```ts ! react/dangerfile.js
// Example of danger.git usage to track file changes in PRs
// !callout[/danger.git/] `danger.git` gives access to git changes in a PR, including added, removed, and modified files.
if (danger.git.modified_files.includes('src/importantFile.js')) {
  warn('Important file modified, review carefully.');
}
```

## !!steps

!duration 200

!title 4. Practical Use Case: Monitoring Build Size

```ts ! react/dangerfile.js
// Practical example of Danger.js monitoring build size
// Codesnippet picked from react source code.
// !callout[/size monitoring/] In React's dangerfile.js, Danger is used to ensure PRs do not cause critical size increases.
const buildSize = danger.git.fileMatch('build/**');
if (buildSize.edited) {
  markdown(`This PR affects the build output. 
    Please verify the size impact.`);
}
```