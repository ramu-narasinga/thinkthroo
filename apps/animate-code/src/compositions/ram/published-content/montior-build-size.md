!videoTitle Monitoring Build Size with Danger.js in React

## !!steps

!duration 180

!title 1. Overview of React's Build Size Monitoring

```ts ! react/dangerfile.js
// Monitoring build size in React using Danger.js
// !callout[/markdown/] React uses Danger.js to track changes in the build size during code reviews, alerting developers of significant increases.
const { markdown, danger, warn } = require('danger');
```

## !!steps

!duration 210

!title 2. Detecting Modified Build Files

```ts ! react/dangerfile.js
// Detecting build file changes with Danger.js
// !callout[/danger.git/] Danger can track git file modifications to monitor changes in build output.
const buildSize = danger.git.fileMatch('build/**');
if (buildSize.edited) {
  warn('Build files have been modified.');
}
```

## !!steps

!duration 220

!title 3. Warning for Critical Build Size Increases

```ts ! react/dangerfile.js
// Adding a warning for critical build size increases
// !callout[/buildSize/] If the build size increases beyond a certain threshold, React uses Danger to warn the developer.
if (buildSize.edited) {
  // Custom function to get file size
  const fileSize = getFileSize('build/output.js');
  if (fileSize > 500kb) {
    warn(`Build size exceeds critical limit. 
    Please optimize.`);
  }
}
```

## !!steps

!duration 200

!title 4. Reporting Size Changes in the Code Review

```ts ! react/dangerfile.js
// Reporting build size changes using markdown in PR comments
// !callout[/markdow/] Danger.js uses `markdown` to add detailed feedback about size changes directly in the pull request.
markdown(`This PR affects the build size. 
Current size: ${fileSize}kb. Please review.`);
```