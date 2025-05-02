import { Command } from "commander"
import prompts from "prompts"
import { z } from "zod"
import path from "path"
import { logger } from "@/src/utils/logger"
import { highlighter } from "@/src/utils/highlighter"
import { handleError } from "@/src/utils/handle-error"
import { getRegistryIndex } from "@/src/registry/api"
import { preFlightConfigure } from "../preflights/preflight-configure"
import * as ERRORS from "@/src/utils/errors"
import { configureFeatures } from "../utils/configure-features"
import { runInit } from "./init"

export const configureOptionsSchema = z.object({
    features: z.array(z.string()).optional(),
    yes: z.boolean(),
    overwrite: z.boolean(),
    cwd: z.string(),
    all: z.boolean(),
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
    .option("-a, --all", "add all available components", false)
    .option("-s, --silent", "mute output.", false)
    .action(async (features, opts) => {
        try {
            const options = configureOptionsSchema.parse({
                features,
                cwd: path.resolve(opts.cwd),
                ...opts,
            })

            if (!options.features?.length) {
                options.features = await promptForRegistryFeatures(options)
            }

            let { errors, config } = await preFlightConfigure(options)

            if (errors[ERRORS.MISSING_DIR_OR_EMPTY_PROJECT]) {
                logger.error(
                    `The directory ${highlighter.info(
                        options.cwd
                    )} does not exist or is empty.`
                )

                logger.break()
                process.exit(1)
            }

            // No components.json file. Prompt the user to run init.
            if (errors[ERRORS.MISSING_CONFIG]) {
                const { proceed } = await prompts({
                    type: "confirm",
                    name: "proceed",
                    message: `You need to create a ${highlighter.info(
                        "features.json"
                    )} file to add features. Proceed?`,
                    initial: true,
                })

                if (!proceed) {
                    logger.break()
                    process.exit(1)
                }

                config = await runInit({
                    cwd: options.cwd,
                    yes: true,
                    force: true,
                    skipPreflight: false,
                    silent: true,
                })
            }

            if (errors[ERRORS.EXISTING_CHANGESETS]) {
                logger.error(
                    `The directory ${highlighter.info(
                        options.cwd
                    )} already has changesets configured.`
                )

                logger.break()
                process.exit(1)
            }

            await configureFeatures(options.features, config!, options)

        } catch (error) {
            console.error(error)
            process.exit(1)
        }
    })

async function promptForRegistryFeatures(options: z.infer<typeof configureOptionsSchema>) {

    const registryIndex = await getRegistryIndex()
    if (!registryIndex) {
        logger.break()
        handleError(new Error("Failed to fetch registry index."))
        return []
    }

    if (options.all) {
        return registryIndex
            .map((entry) => entry.name)
    }

    if (options.features?.length) {
        return options.features
    }

    const { features } = await prompts({
        type: "multiselect",
        name: "features",
        message: "Which features would you like to configure?",
        hint: "Space to select. A to toggle all. Enter to submit.",
        instructions: false,
        choices: registryIndex
            .map((entry) => ({
                title: entry.name,
                value: entry.name,
                selected: options.all ? true : options.features?.includes(entry.name),
            })),
    })

    if (!features?.length) {
        logger.warn("No features selected. Exiting.")
        logger.info("")
        process.exit(1)
    }

    const result = z.array(z.string()).safeParse(features)
    if (!result.success) {
        logger.error("")
        handleError(new Error("Something went wrong. Please try again."))
        return []
    }
    return result.data

}