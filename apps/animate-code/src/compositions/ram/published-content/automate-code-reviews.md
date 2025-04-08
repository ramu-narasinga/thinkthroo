!videoTitle Automating Code Reviews with Danger.js

## !!steps
!duration 180

!title 1. Introduction to Danger.js

```ts ! dangerfile.js
// !callout[/danger/] Danger.js is a tool that helps automate common code review tasks, running during the CI process.
const { danger, warn, markdown } = require('danger');

// !callout[/Purpose/] It is used to add comments to pull requests, based on rules you define, ensuring code quality and adherence to guidelines.
```

## !!steps
!duration 200

!title 2. Example of Danger.js in Action: Warn on Large PRs

```ts ! dangerfile.js
// Example of using Danger.js to warn on large pull requests
if (
  // !callout[/danger/] In this example, Danger.js checks the number of additions and deletions in a PR and warns if it's too large.
  danger.github.pr.additions + 
  danger.github.pr.deletions > 500
) {
  warn(
  `
    This PR is too large. 
    Please consider breaking it down.
  `);
}
```

## !!steps
!duration 210

!title 3. Using Markdown to Add Information to PRs

```ts ! dangerfile.js
// Adds a Markdown comment to the PR
// !callout[/markdown/] Markdown is used to add rich text comments to pull requests.
markdown(`
  **Note:** This is an automated review by Danger.js.
`);
```

## !!steps
!duration 220

!title 4. Practical Example: Using Danger.js to Lint Commits

```ts ! dangerfile.js
// Example: Ensure commit messages follow a convention
const commitLint = danger
                    .git
                    .commits
                    .find(c => !c.message.match(/^[A-Z]/));
// !callout[/commitLint/] Danger.js can also lint commit messages or any other part of the code review process.
if (commitLint) {
  warn(`
    Commit message doesn't follow the
    convention: Start with a capital letter.
  `);
}
```