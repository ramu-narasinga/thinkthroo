import { configure } from "@/src/commands/configure"
import { Command } from "commander"

import packageJson from "../package.json"

process.on("SIGINT", () => process.exit(0))
process.on("SIGTERM", () => process.exit(0))

async function main() {
  const program = new Command()
    .name("@thinkthroo/cli")
    .description("configure commonly used engineering capabilities in your projects.")
    .version(
      packageJson.version || "1.0.0",
      "-v, --version",
      "display the version number"
    )

  program
    .addCommand(configure)

  program.parse()
}

main()
