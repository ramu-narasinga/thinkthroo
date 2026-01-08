import { RAW_SUMMARY_END_TAG, RAW_SUMMARY_START_TAG } from "../constants";
import { getContentWithinTags } from "./get-contents-within-tags";

export function getRawSummary(summary: string) {
    return getContentWithinTags(
      summary,
      RAW_SUMMARY_START_TAG,
      RAW_SUMMARY_END_TAG
    )
}