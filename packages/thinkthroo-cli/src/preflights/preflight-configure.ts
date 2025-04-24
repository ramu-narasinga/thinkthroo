import path from "path"
import { configureOptionsSchema } from "@/src/commands/configure"
import * as ERRORS from "@/src/utils/errors"
import { highlighter } from "@/src/utils/highlighter"
import { logger } from "@/src/utils/logger"
import fs from "fs-extra"
import { z } from "zod"

export async function preFlightConfigure(options: z.infer<typeof configureOptionsSchema>) {
  const errors: Record<string, boolean> = {}

  // Ensure target directory exists.
  // Check for empty project. We assume if no package.json exists, the project is empty.
  if (
    !fs.existsSync(options.cwd) ||
    !fs.existsSync(path.resolve(options.cwd, "package.json"))
  ) {
    errors[ERRORS.MISSING_DIR_OR_EMPTY_PROJECT] = true
    return {
      errors,
      config: null,
    }
  }

  // Check for .changesets folder in the project. We assume if .changesets folder exists, 
  // the project already has changesets configured.
  if (
    !fs.existsSync(options.cwd) ||
    fs.existsSync(path.resolve(options.cwd, ".changesets"))
  ) {
    errors[ERRORS.EXISTING_CHANGESETS] = true
    return {
      errors,
      config: null,
    }
  }

  return {
    errors: {},
    config: null,
  }
  
}