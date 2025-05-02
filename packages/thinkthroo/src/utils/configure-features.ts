import { registryResolveItemsTree } from "../registry/api"
import { Config } from "./get-config"
import { handleError } from "./handle-error"
import { logDocs } from "./log-docs"
import { logger } from "./logger"
import { spinner } from "./spinner"
import { updateDependencies } from "./updaters/update-dependencies"
import { updateFiles } from "./updaters/update-files"

export async function configureFeatures(
    features: string[],
    config: Config,
    options: {
        overwrite?: boolean
        silent?: boolean
    }
) {

    logger.break()
    logger.info("Configuring features...")

    const registrySpinner = spinner(`Checking registry.`, {
        silent: options.silent,
    })?.start();

    const tree = await registryResolveItemsTree(features);

    if (!tree) {
        registrySpinner?.fail()
        return handleError(new Error("Failed to fetch components from registry."))
    }
    registrySpinner?.succeed()

    await updateDependencies(tree.dependencies, tree.devDependencies, config, {
        silent: options.silent,
    })

    await updateFiles(tree.files, config, {
        overwrite: options.overwrite,
        silent: options.silent,
    })

    if (tree.docs) {
        logger.info(tree.docs)
    }

}