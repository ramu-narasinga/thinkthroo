import { createNodeMiddleware, createProbot } from "probot";

import app from "./index";

export default await createNodeMiddleware(app, {
  probot: createProbot(),
  webhooksPath: "/api/github/webhooks",
});