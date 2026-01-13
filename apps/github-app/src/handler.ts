import { createNodeMiddleware, createProbot } from "probot";
import app from "./index";
import { logger } from "@/lib/logger";

logger.info("Creating Probot middleware", { webhooksPath: "/api/github/webhooks" });

const middleware = createNodeMiddleware(app, {
  probot: createProbot(),
  webhooksPath: "/api/github/webhooks",
});

logger.info("Probot middleware created successfully");

export default middleware;