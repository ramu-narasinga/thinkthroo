import { logger } from "./logger"

export function logDocs(docs: string[] = []) {
    if (!docs.length) {
        return
    }

    logger.break()
    docs.forEach((doc) => {
        logger.info(doc)
        logger.break()
    })
}