import { Command } from "commander"
import prompts from "prompts"
import { z } from "zod"
import path from "path"
import { logger } from "@/src/utils/logger"
import { highlighter } from "../utils/highlighter"

export const configureOptionsSchema = z.object({
    features: z.array(z.string()).optional(),
    yes: z.boolean(),
    overwrite: z.boolean(),
    cwd: z.string(),
    silent: z.boolean(),
})

export const configure = new Command()
    .name("configure")
    .description("configure a feature in your project")
    .argument(
        "[features...]",
        "the features to add."
    )
    .option("-y, --yes", "skip confirmation prompt.", false)
    .option("-o, --overwrite", "overwrite existing files.", false)
    .option(
        "-c, --cwd <cwd>",
        "the working directory. defaults to the current directory.",
        process.cwd()
    )
    .option("-s, --silent", "mute output.", false)
    .action(async (features, opts) => {
        try {
            const options = configureOptionsSchema.parse({
                features,
                cwd: path.resolve(opts.cwd),
                ...opts,
            })

            if (!options.yes) {
                logger.break()
                const { confirm } = await prompts({
                    type: "confirm",
                    name: "confirm",
                    message: highlighter.warn(
                        `You are about to configure ${features[0]}. Continue?`
                    ),
                })
                if (!confirm) {
                    logger.break()
                    logger.log(`${features[0]} configuration cancelled.`)
                    logger.break()
                    process.exit(1)
                }
            }
        } catch (error) {
            console.error(error)
            process.exit(1)
        }
    })