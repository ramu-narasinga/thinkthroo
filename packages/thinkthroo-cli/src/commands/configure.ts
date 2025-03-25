import { Command } from "commander"
import { z } from "zod"
import path from "path"

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

            console.log(options);

        } catch (error) {
            console.error(error)
            process.exit(1)
        }
    })