!videoTitle Understanding sizereport.config.js in Preact

## !!steps

!duration 220

!title 1. Overview of sizereport.config.js

```ts ! preact/sizereport.config.js
// sizereport.config.js defines size tracking for Preact
// !callout[/exports/] Defines which files should be included in the report.
module.exports = {
 // !callout[/repo/] Specifies the repository where the size report applies.
 repo: 'preactjs/preact',
 path: ['./{compat,debug,hooks,}/dist/**/!(*.map)'],
 branch: 'main'
};
```

## !!steps

!duration 210

!title 2. Searching for Usage of sizereport.config.js

```ts ! .github/size.ts
// size.yml GitHub Action config
// !callout[/on/] Defines when the workflow runs.
on:{
  workflow_call:
}
// !callout[/jobs/] Specifies the job configuration for size reporting.
jobs:{
  build:{
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
  }
}
```

## !!steps

!duration 220

!title 3. Integration with Compressed Size Action

```ts ! .github/size.ts
// Compressed Size Action setup
// !callout[/actions/] Prepares Node.js environment.
      - uses: actions/setup-node@v4
        with:
          node-version-file: 'package.json'
          cache: 'npm'
// !callout[/uses/] Runs the action to check size changes.
      - uses: preactjs/compressed-size-action@v2
        with:
          repo-token: '${{ secrets.GITHUB_TOKEN }}'
```

## !!steps

!duration 200

!title 4. How Compressed Size Action Works

```ts ! compressed-size-action/README.ts
// Compressed Size Action details
// !callout[/Reports size/] Compares file sizes between PR and target branch.
- Reports size differences on PRs
- Uses package managers like npm, yarn, pnpm
// !callout[/Runs builds/] Supports custom build commands for accurate reporting.
- Runs builds and compares output
```

## !!steps

!duration 220

!title 5. Practical Impact of Size Reporting

 ```ts ! preact/pull-request.ts
// Example PR with size report
// !callout[/pull request/] Displays file size changes directly in GitHub PRs.
A pull request integrating size reporting shows:
- Size increase/decrease for modified files
- Summary of compressed file changes
- Helps maintain optimal bundle size
```

---

**Title:** Understanding sizereport.config.js in Preact  
**Description:** Exploring how Preact's `sizereport.config.js` integrates with GitHub Actions to track file size changes using the `compressed-size-action`. Learn how it helps optimize bundle size with automated PR checks.  
**Tags:** #Preact #OpenSource #GitHubActions #CodeSize #WebPerformance

