import { registryResolveItemsTree } from "../registry/api"
import { spinner } from "./spinner"

export async function configureFeatures(
    features: string[],
    options: {
        cwd: string
        yes: boolean
        overwrite: boolean
        all: boolean
        silent: boolean
    }
) {
    const registrySpinner = spinner(`Checking registry.`, {
        silent: options.silent,
      })?.start();

    const tree = await registryResolveItemsTree(features);

    console.log("tree", tree)
}