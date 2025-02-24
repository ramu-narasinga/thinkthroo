!videoTitle Understanding Kodiak.toml in tRPC Source Code

## !!steps
!duration 180

!title 1. Overview of Kodiak in tRPC

```ts ! trpc/.kodiak.toml
// !callout[/version/] Kodiak is used in tRPC to automate pull request approvals and merges, keeping PRs up-to-date with the main branch.
version = 1
[approve]
auto_approve_usernames = ["dependabot", "renovate"]
```

## !!steps
!duration 190

!title 2. Approving PRs Automatically

```ts ! trpc/.kodiak.toml
// !callout[/approve/] PRs opened by certain usernames like "dependabot" and "renovate" will automatically get approved by Kodiak.
[approve]
auto_approve_usernames = ["dependabot", "renovate"]
// !callout[/Usernames List/] You can specify which bot or user’s PRs will be auto-approved.
```

## !!steps
!duration 210

!title 3. Auto Merging with Kodiak

```ts ! trpc/.kodiak.toml
// !callout[/merge/] PRs labeled with the specified automerge labels will be merged by Kodiak once they pass CI checks and approvals.
[merge]
method = "squash"
automerge_label = ["🚀 merge", "⬆️ dependencies"]
// !callout[/Squash Method/] Here, Kodiak uses the "squash" method to merge pull requests, meaning all commits are combined into one.
```

## !!steps
!duration 220

!title 4. Merging Dependency Upgrades and Auto Update

```ts ! trpc/.kodiak.toml
// !callout[/merge.automerge_dependencies/] Kodiak will only automerge minor and patch version upgrades for dependencies submitted by certain users or bots.
[merge.automerge_dependencies]
versions = ["minor", "patch"]
usernames = ["dependabot", "renovate"]

// !callout[/Auto Update/] PRs labeled with the auto update label will be kept up to date with their base branch.
[update]
autoupdate_label = "♻️ autoupdate"
```