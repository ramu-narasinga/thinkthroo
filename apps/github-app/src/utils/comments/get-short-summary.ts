import { SHORT_SUMMARY_END_TAG, SHORT_SUMMARY_START_TAG } from "../constants";
import { getContentWithinTags } from "./get-contents-within-tags";

export function getShortSummary(summary: string) {
    return getContentWithinTags(
      summary,
      SHORT_SUMMARY_START_TAG,
      SHORT_SUMMARY_END_TAG
    )
  }