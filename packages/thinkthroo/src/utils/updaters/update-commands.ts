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


    logger.info("Running the commands...");

    try {

        for (const cmd of commands) {
            await execaCommand(cmd, {
                cwd: config.resolvedPaths.cwd,
                shell: true, // enables full shell features like piping, &&, etc.
                stdio: 'inherit' // This pipes output directly to the terminal
            })
        }

    } catch (err) {
        logger.error(err)
        throw err
    }
}
