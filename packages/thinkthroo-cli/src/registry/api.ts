import { logger } from "@/src/utils/logger"
import { handleError } from "@/src/utils/handle-error"
import { HttpsProxyAgent } from "https-proxy-agent"
import fetch from "node-fetch"
import { highlighter } from "@/src/utils/highlighter"
import { registryIndexSchema } from "./schema"

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

        logger.info("result", JSON.stringify(result));

        return registryIndexSchema.parse(result)
    } catch (error) {
        logger.error("\n")
        handleError(error)
    }
}

function getRegistryUrl(path: string) {  

    logger.info("REGISTRY_URL", REGISTRY_URL, "process.env.REGISTRY_URL", process.env.REGISTRY_URL)

    return `${REGISTRY_URL}/${path}`
}