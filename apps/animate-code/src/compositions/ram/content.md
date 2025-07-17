!videoTitle wrangler deploy in git-mcp — Cloudflare Workers Deployment

## !!steps

!duration 220

!title 1. What is wrangler deploy?

```ts ! docs/wrangler
// !callout[/wrangler/] `wrangler` is the CLI for deploying and managing Cloudflare Workers.
npm install -g wrangler
wrangler deploy
```

## !!steps

!duration 220

!title 2. Deploy Script in package.json

```json ! git-mcp/package.json
// !callout[/scripts/] The deploy script builds the app and deploys it using `wrangler deploy`.
"scripts": {
  "build": "react-router build",
  "deploy": "npm run build && wrangler deploy"
}
```

## !!steps

!duration 220

!title 3. Basic wrangler.jsonc Configuration

```ts ! git-mcp/wrangler.jsonc
{
  // !callout[/name/] Specifies the Worker entrypoint and project name.
  "name": "git-mcp",
  "main": "src/index.ts",
  "compatibility_date": "2025-04-26"
}
```

## !!steps

!duration 220

!title 4. Durable Objects & KV Bindings

```ts ! git-mcp/wrangler.jsonc
{
  // !callout[/durable_objects/] Durable Objects persist state across Worker invocations.
  "durable_objects": {
    "bindings": [{ "class_name": "ViewCounterDO",
     "name": "VIEW_COUNTER" }]
  },
  "kv_namespaces": [{
    "binding": "CACHE_KV",
    "id": "c5dd8e05242a471b9d7bf12f0ddcee3a"
  }]
}
```

## !!steps

!duration 220

!title 5. Routes, Analytics & Assets

```ts ! git-mcp/wrangler.jsonc
{
  // !callout[/routes/] Maps your domain to the Worker deployment.
  "routes": [{ "pattern": "gitmcp.io", "custom_domain": true }],
  // !callout[/analytics/] Enables Cloudflare Analytics Engine.
  "analytics_engine_datasets": [{ "binding": "MY_METRICS" }],
  // !callout[/assets/] Specifies static file directory.
  "assets": { "directory": "./static/", "binding": "ASSETS" }
}
```

---

**title:** How `wrangler deploy` is used in git-mcp
**description:** Learn how the `git-mcp` codebase uses the `wrangler deploy` command to ship Cloudflare Workers. We cover the deploy script in `package.json`, `wrangler.jsonc` configuration including routes, KV, Durable Objects, and analytics setup.
**tags:** wrangler, cloudflare workers, deploy, durable objects, git-mcp, wrangler.jsonc, kv storage, open source, devops

```
```
