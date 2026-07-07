# thinkthroo

Local daemon that polls the thinkthroo platform (`app.thinkthroo.com`) and runs
[Claude Code](https://github.com/anthropics/claude-code) agents locally to implement, test, and
review issues. Bring-your-own-compute: nothing executes on thinkthroo's servers — this runs on a
machine you control, with your own `claude` CLI auth and `git` install.

## Install

```
npm install -g thinkthroo
```

Requires `claude` (authenticated — subscription login or `ANTHROPIC_API_KEY`) and `git` on PATH.

## Usage

```
thinkthroo setup     # browser auth + registers a runtime + installs a background service
thinkthroo start     # run in the foreground (useful for debugging)
thinkthroo status    # show saved config
thinkthroo service install|uninstall|status   # manage the background service directly
```

`setup` is the recommended path — it authenticates via your browser, registers a runtime, and
installs itself as a persistent background service (launchd on macOS, systemd `--user` on Linux)
so it keeps polling for tasks across reboots without a terminal staying open.

## Manual publish runbook

There is no CI publish pipeline yet — release manually:

1. Confirm you're logged in to npm with publish access: `npm whoami`.
2. `cd apps/daemon && pnpm build`.
3. Smoke test the built package before publishing:
   ```
   npm pack
   npm install -g ./thinkthroo-<version>.tgz
   thinkthroo --version
   thinkthroo --help
   npm uninstall -g thinkthroo   # clean up the smoke-test install
   ```
4. Bump the version: `npm version patch|minor|major` (inside `apps/daemon`).
5. Publish: `npm publish --access public`.
6. Tag the commit: `git tag daemon-v<version> && git push origin daemon-v<version>`.

### Fast-follow (not set up yet)

A `.github/workflows/publish-daemon.yml` triggered on `daemon-v*` tags, running
`pnpm --filter thinkthroo build && pnpm --filter thinkthroo publish --access public --no-git-checks`
with an `NPM_TOKEN` repo secret, would replace this manual runbook once releases become frequent
enough to justify the CI setup cost.
