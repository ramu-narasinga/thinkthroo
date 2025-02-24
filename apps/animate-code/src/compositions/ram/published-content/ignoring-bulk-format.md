!videoTitle Ignoring Bulk Formatting Changes in Git Blame

## !!steps
!duration 180

!title 1. Introduction to .git-blame-ignore-revs

```ts ! git/src/blame.ts
// .git-blame-ignore-revs allows skipping specific commits
// !callout[/git blame/] Shows the author and commit for each line in a file, helping to trace changes.
$ git blame <filename>
// !callout[/--ignore-revs-file/] Adds an option to skip irrelevant commits like formatting changes.
$ git blame --ignore-revs-file .git-blame-ignore-revs <filename>
```

## !!steps
!duration 190

!title 2. Identifying Bulk Formatting Commits

```ts ! git/src/commit.ts
// Example bulk formatting commits that 
// affect many lines without functional changes
// !callout[/Commit/] A commit for Prettier formatting that touches many lines.
Commit: c998bb1 
// !callout[/Message/] Commit message indicating a large formatting update
Message: [compiler] Run prettier, fix snap
```

## !!steps
!duration 180

!title 3. Creating the .git-blame-ignore-revs File

```ts ! git/src/commit.ts
// Create a file to store the list of ignored commits
// !callout[/touch/] Creates the file where you will add commit hashes.
$ touch .git-blame-ignore-revs

// Add the relevant commit hashes to the file
# Prettier formatting changes
c998bb1ed4b3285398c9c7797135d3f060243c6a 
fd2b3e13d330a4559f5aa21462e1cb2cbbcf144b
```

## !!steps
!duration 210

!title 4. Configuring Git to Use the Ignore File

```ts ! git/src/commit.ts
// Configure Git to use the .git-blame-ignore-revs file automatically
// !callout[/git config blame.ignoreRevsFile/] Configures Git to always use the ignore file for blame.
$ git config blame.ignoreRevsFile .git-blame-ignore-revs
```

## !!steps
!duration 180

!title 5. Running Git Blame with Ignored Commits

```ts ! git/src/commit.ts
// Running git blame 
// with the ignore file applied
// !callout[/git blame/] Now git blame skips the irrelevant commits, focusing on meaningful changes.
$ git blame src/someFile.tsx
```