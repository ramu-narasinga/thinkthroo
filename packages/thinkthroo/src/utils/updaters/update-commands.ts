import { RegistryItem } from "@/src/registry/schema"
import { Config } from "@/src/utils/get-config"
import { logger } from "@/src/utils/logger"
import { spinner } from "@/src/utils/spinner"
import { execaCommand } from "execa"

export async function updateCommands(
    commands: RegistryItem["commands"],
    config: Config,
    options: {
        silent?: boolean
    }
) {
    commands = Array.from(new Set(commands))

    if (!commands?.length) {
        return
    }

    options = {
        silent: false,
        ...options,
    }

    // const commandsSpinner = spinner(`Running commands.`, {
    //     silent: options.silent,
    // })?.start()

    try {

        console.log("commands", commands, "config.resolvedPaths.cwd", config.resolvedPaths.cwd)

        for (const cmd of commands) {
            await execaCommand(cmd, {
                cwd: config.resolvedPaths.cwd,
                shell: true, // enables full shell features like piping, &&, etc.
                stdio: 'inherit' // This pipes output directly to the terminal
            })
        }

        // commandsSpinner?.succeed()
    } catch (err) {
        // commandsSpinner?.fail("Failed to run commands.")
        logger.error(err)
        throw err
    }
}
