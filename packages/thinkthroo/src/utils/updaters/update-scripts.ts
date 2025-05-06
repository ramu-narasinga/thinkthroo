import PackageJson from "@npmcli/package-json";
import path from "path";
import { Config } from "../get-config";
import { logger } from "../logger";
import { spinner } from "../spinner";

export async function updateScripts(
    scripts: Record<string, string>,
    config: Config,
    options: { silent?: boolean }
) {

    const scriptsCreatedSpinner = spinner(`Updating scripts in package.json.`, {
        silent: options.silent,
      })?.start()

    const pkgPath = path.join(config.resolvedPaths.cwd);

    const pkg = await PackageJson.load(pkgPath);

    for (const [key, value] of Object.entries(scripts)) {
        if (!pkg.content.scripts?.[key]) {
            if (!pkg.content.scripts) pkg.content.scripts = {};
            pkg.content.scripts[key] = value;
            if (!options.silent) {
                scriptsCreatedSpinner?.info(`Added script "${key}": "${value}"`)
            }
        } else {
            if (!options.silent) {
                scriptsCreatedSpinner?.info(`Skipped existing script "${key}"`)
            }
        }
    }

    scriptsCreatedSpinner.stop();

    await pkg.save();
}
