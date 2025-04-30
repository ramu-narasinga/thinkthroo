import path from "path"
import { highlighter } from "@/src/utils/highlighter"
import { cosmiconfig } from "cosmiconfig"
import fg from "fast-glob"
import { z } from "zod"

// TODO: Figure out if we want to support all cosmiconfig formats.
// A simple components.json file would be nice.
const explorer = cosmiconfig("features", {
  searchPlaces: ["features.json"],
})

// TODO: More options will be added when support for 
// adding features such as Auth, S3 upload is added.
// atm, thinkthroo configures tooling
export const rawConfigSchema = z
  .object({
    $schema: z.string().optional(),
  })
  .strict()

export type RawConfig = z.infer<typeof rawConfigSchema>

export const configSchema = rawConfigSchema.extend({
  resolvedPaths: z.object({
    cwd: z.string(),
  }),
})

export type Config = z.infer<typeof configSchema>

export async function getConfig(cwd: string) {
  const config = await getRawConfig(cwd)

  if (!config) {
    return null
  }

  return await resolveConfigPaths(cwd, config)
}

export async function resolveConfigPaths(cwd: string, config: RawConfig) {

  return configSchema.parse({
    ...config,
    resolvedPaths: {
      cwd,
    },
  })
}

export async function getRawConfig(cwd: string): Promise<RawConfig | null> {
  try {
    const configResult = await explorer.search(cwd)

    if (!configResult) {
      return null
    }

    return configSchema.parse(configResult.config)
  } catch (error) {
    console.log("[getRawConfig]::error", error)
    const featurePath = `${cwd}/features.json`
    throw new Error(
      `Invalid configuration found in ${highlighter.info(featurePath)}.`
    )
  }
}

export async function findPackageRoot(cwd: string, resolvedPath: string) {
  const commonRoot = findCommonRoot(cwd, resolvedPath)
  const relativePath = path.relative(commonRoot, resolvedPath)

  const packageRoots = await fg.glob("**/package.json", {
    cwd: commonRoot,
    deep: 3,
    ignore: ["**/node_modules/**", "**/dist/**", "**/build/**", "**/public/**"],
  })

  const matchingPackageRoot = packageRoots
    .map((pkgPath) => path.dirname(pkgPath))
    .find((pkgDir) => relativePath.startsWith(pkgDir))

  return matchingPackageRoot ? path.join(commonRoot, matchingPackageRoot) : null
}

export function findCommonRoot(cwd: string, resolvedPath: string) {
  const parts1 = cwd.split(path.sep)
  const parts2 = resolvedPath.split(path.sep)
  const commonParts = []

  for (let i = 0; i < Math.min(parts1.length, parts2.length); i++) {
    if (parts1[i] !== parts2[i]) {
      break
    }
    commonParts.push(parts1[i])
  }

  return commonParts.join(path.sep)
}