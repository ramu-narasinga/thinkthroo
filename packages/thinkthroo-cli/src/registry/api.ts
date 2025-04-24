import { logger } from "@/src/utils/logger"
import { handleError } from "@/src/utils/handle-error"
import { HttpsProxyAgent } from "https-proxy-agent"
import fetch from "node-fetch"
import { highlighter } from "@/src/utils/highlighter"
import { registryIndexSchema, registryItemSchema, registryResolvedItemsTreeSchema } from "./schema"
import { z } from "zod"
import deepmerge from "deepmerge"

const REGISTRY_URL = process.env.REGISTRY_URL ?? "https://thinkthroo.com/r"
const registryCache = new Map<string, Promise<any>>()
const agent = process.env.https_proxy
    ? new HttpsProxyAgent(process.env.https_proxy)
    : undefined

export async function fetchRegistry(paths: string[]) {
    try {
        const results = await Promise.all(
            paths.map(async (path) => {
                const url = getRegistryUrl(path)

                // Check cache first
                if (registryCache.has(url)) {
                    return registryCache.get(url)
                }

                // Store the promise in the cache before awaiting
                const fetchPromise = (async () => {
                    const response = await fetch(url, { agent })

                    if (!response.ok) {
                        const errorMessages: { [key: number]: string } = {
                            400: "Bad request",
                            401: "Unauthorized",
                            403: "Forbidden",
                            404: "Not found",
                            500: "Internal server error",
                        }

                        if (response.status === 401) {
                            throw new Error(
                                `You are not authorized to access the component at ${highlighter.info(
                                    url
                                )}.\nIf this is a remote registry, you may need to authenticate.`
                            )
                        }

                        if (response.status === 404) {
                            throw new Error(
                                `The component at ${highlighter.info(
                                    url
                                )} was not found.\nIt may not exist at the registry. Please make sure it is a valid component.`
                            )
                        }

                        if (response.status === 403) {
                            throw new Error(
                                `You do not have access to the component at ${highlighter.info(
                                    url
                                )}.\nIf this is a remote registry, you may need to authenticate or a token.`
                            )
                        }

                        const result = await response.json()
                        const message =
                            result && typeof result === "object" && "error" in result
                                ? result.error
                                : response.statusText || errorMessages[response.status]
                        throw new Error(
                            `Failed to fetch from ${highlighter.info(url)}.\n${message}`
                        )
                    }

                    return response.json()
                })()

                registryCache.set(url, fetchPromise)
                return fetchPromise
            })
        )

        return results
    } catch (error) {
        logger.error("\n")
        handleError(error)
        return []
    }
}

export async function getRegistryIndex() {
    try {

        const [result] = await fetchRegistry(["index.json"])

        return registryIndexSchema.parse(result)
    } catch (error) {
        logger.error("\n")
        handleError(error)
    }
}

function getRegistryUrl(path: string) {

    if (isUrl(path)) {
        const url = new URL(path)
        return url.toString()
    }

    return `${REGISTRY_URL}/${path}`
}

export async function registryResolveItemsTree(
    names: z.infer<typeof registryItemSchema>["name"][]
) {
    try {

        console.log("[registryResolveItemsTree]:names", names);
        let registryItems = await resolveRegistryItems(names)
        console.log("[registryResolveItemsTree]:registryItems", registryItems);
        let [result] = await fetchRegistry(registryItems)
        console.log("[registryResolveItemsTree]:result", result);

        const payload = z.array(registryItemSchema).parse(result)

        if (!payload) {
            return null
        }

        return registryResolvedItemsTreeSchema.parse({
            dependencies: deepmerge.all(
                payload.map((item) => item.dependencies ?? [])
            ),
            devDependencies: deepmerge.all(
                payload.map((item) => item.devDependencies ?? [])
            ),
            files: deepmerge.all(payload.map((item) => item.files ?? [])),
        })

    } catch (error) {
        handleError(error)
        return null
    }
}

export async function resolveRegistryItems(names: string[]) {
    let registryDependencies: string[] = []
    for (const name of names) {
        console.log("[resolveRegistryItems]:name", name);
        const itemRegistryDependencies = await resolveRegistryDependencies(
            name
        )
        registryDependencies.push(...itemRegistryDependencies)
    }

    return Array.from(new Set(registryDependencies))
}

async function resolveRegistryDependencies(
    url: string
): Promise<string[]> {
    const visited = new Set<string>()
    const payload: string[] = []

    async function resolveDependencies(itemUrl: string) {

        console.log("[resolveDependencies]:itemUrl", itemUrl);

        const url = getRegistryUrl(isUrl(itemUrl) ? itemUrl : `index.json`)

        console.log("[resolveDependencies]:url", url);

        if (visited.has(url)) {
            return
        }

        visited.add(url)

        try {
            const [result] = await fetchRegistry([url])

            console.log("[resolveDependencies]:result", result);

            const matchedItem = result.find((item: any) =>
                item.name === itemUrl || getRegistryUrl(item.name) === url
            );

            console.log("[resolveDependencies]:matchedItem", matchedItem);

            if (!matchedItem) {
                console.warn(`No matching item found in registry for URL: ${url}`);
                return;
            }

            const item = registryItemSchema.parse(matchedItem)
            payload.push(url)

            console.log("[resolveDependencies]:payload", payload);
            console.log("[resolveDependencies]:item", item);

            if (item.registryDependencies) {
                for (const dependency of item.registryDependencies) {
                    await resolveDependencies(dependency)
                }
            }
        } catch (error) {
            console.error(
                `Error fetching or parsing registry item at ${itemUrl}:`,
                error
            )
        }
    }

    await resolveDependencies(url)
    return Array.from(new Set(payload))
}

export function isUrl(path: string) {
    try {
        new URL(path)
        return true
    } catch (error) {
        return false
    }
}

export async function getRegistryItem(name: string, style: string) {
    try {
        const [result] = await fetchRegistry([
            isUrl(name) ? name : `index.json`,
        ])

        return registryItemSchema.parse(result)
    } catch (error) {
        logger.break()
        handleError(error)
        return null
    }
}