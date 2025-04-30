import {
  Config,
  RawConfig,
  getConfig,
  resolveConfigPaths,
} from "@/src/utils/get-config"

export async function getProjectConfig(
  cwd: string,
): Promise<Config | null> {
  // Check for existing component config.
  const [existingConfig] = await Promise.all([
    getConfig(cwd),
  ])

  if (existingConfig) {
    return existingConfig
  }

  const config: RawConfig = {
    $schema: "https://thinkthroo.com/schema.json",
  }

  return await resolveConfigPaths(cwd, config)
}