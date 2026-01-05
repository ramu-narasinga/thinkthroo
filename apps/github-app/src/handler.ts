import { createNodeMiddleware, createProbot } from "probot";
import app from "./index";

const middleware = createNodeMiddleware(app, {
  probot: createProbot(),
  webhooksPath: "/api/github/webhooks",
});

export default middleware;