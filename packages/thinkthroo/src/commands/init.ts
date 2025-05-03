import { promises as fs } from "fs"
import path from "path"
import { preFlightInit } from "@/src/preflights/preflight-init"
import { configureFeatures } from "@/src/utils/configure-features"
import * as ERRORS from "@/src/utils/errors"
import {
  resolveConfigPaths,
} from "@/src/utils/get-config"
import {
  getProjectConfig,
} from "@/src/utils/get-project-info"
import { handleError } from "@/src/utils/handle-error"
import { highlighter } from "@/src/utils/highlighter"
import { logger } from "@/src/utils/logger"
import { spinner } from "@/src/utils/spinner"
import { Command } from "commander"
import prompts from "prompts"
import { z } from "zod"

export const initOptionsSchema = z.object({
  features: z.array(z.string()).optional(),
  yes: z.boolean(),
  force: z.boolean(),
  cwd: z.string(),
  silent: z.boolean(),
})

export const init = new Command()
  .name("init")
  .description("initialize your project and install dependencies")
  .argument(
    "[features...]",
    "the features to add."
  )
  .option("-y, --yes", "skip confirmation prompt.", true)
  .option("-f, --force", "force overwrite of existing configuration.", false)
  .option(
    "-c, --cwd <cwd>",
    "the working directory. defaults to the current directory.",
    process.cwd()
  )
  .option("-s, --silent", "mute output.", false)
  .action(async (features, opts) => {
    try {
      const options = initOptionsSchema.parse({
        cwd: path.resolve(opts.cwd),
        features,
        ...opts,
      })

      await runInit(options)

      logger.log(
        `${highlighter.success(
          "Success!"
        )} Project initialization completed.\nYou may now add features.`
      )
      logger.break()
    } catch (error) {
      logger.break()
      handleError(error)
    }
  })

export async function runInit(
  options: z.infer<typeof initOptionsSchema> & {
    skipPreflight?: boolean
  }
) {
  
  if (!options.skipPreflight) {
    const preflight = await preFlightInit(options)
    if (preflight.errors[ERRORS.MISSING_DIR_OR_EMPTY_PROJECT]) {
      logger.error(
        `The directory ${highlighter.info(
          options.cwd
        )} does not exist or is empty.`
      )

      logger.break()
      process.exit(1)
    }
  }

  const projectConfig = await getProjectConfig(options.cwd)

  if (!options.yes) {
    const { proceed } = await prompts({
      type: "confirm",
      name: "proceed",
      message: `Write configuration to ${highlighter.info(
        "features.json"
      )}. Proceed?`,
      initial: true,
    })

    if (!proceed) {
      process.exit(0)
    }
  }

  // Write features.json.
  const featureSpinner = spinner(`Writing features.json.`).start()
  const targetPath = path.resolve(options.cwd, "features.json")
  await fs.writeFile(targetPath, JSON.stringify(projectConfig, null, 2), "utf8")
  featureSpinner.succeed()

  // Add components.
  const fullConfig = await resolveConfigPaths(options.cwd, projectConfig!)
  const features = [
    ...(options.features ?? []),
  ]

  if (features.length) {
    await configureFeatures(features, fullConfig, {
      // Init will always overwrite files.
      overwrite: true,
      silent: options.silent
    })
  }

  return fullConfig
}