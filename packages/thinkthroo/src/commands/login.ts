import { promises as fs } from "fs"
import path from "path"
import { preFlightInit } from "@/src/preflights/preflight-init"
import { configureFeatures } from "@/src/utils/configure-features"
import * as ERRORS from "@/src/utils/errors"
import {
    resolveConfigPaths,
} from "@/src/utils/get-config"
import {
    getProjectConfig,
} from "@/src/utils/get-project-info"
import { handleError } from "@/src/utils/handle-error"
import { highlighter } from "@/src/utils/highlighter"
import { logger } from "@/src/utils/logger"
import { spinner } from "@/src/utils/spinner"
import { Command } from "commander"
import prompts from "prompts"
import { z } from "zod"
import { tokenServiceFactory } from "../services/token"
import { cloudApiFactory } from "../services/cli-api"
import { apiConfig } from "../config/api"
import chalk from "chalk"
import { CloudCliConfig } from "../types"

export const loginOptionsSchema = z.object({
    silent: z.boolean().optional(),
})

export const login = new Command()
    .name("login")
    .description("Think Throo Login")
    .option("-s, --silent", "mute output.", false)
    .action(async (_, opts) => {
        try {
            const options = loginOptionsSchema.parse({
                ...opts,
            })

            const tokenService = await tokenServiceFactory();
            const existingToken = await tokenService.retrieveToken();
            const cloudApiService = await cloudApiFactory(existingToken || undefined);

            if (existingToken) {
                const isTokenValid = await tokenService.isTokenValid(existingToken);
                if (isTokenValid) {
                    try {
                        const userInfo = await cloudApiService.getUserInfo();
                        const { email } = userInfo.data.data;
                        if (email) {
                            logger.log(`You are already logged into your account (${email}).`);
                        } else {
                            logger.log('You are already logged in.');
                        }
                        logger.log(
                            'To access your dashboard, please copy and paste the following URL into your web browser:'
                        );
                        logger.log(chalk.underline(`${apiConfig.dashboardBaseUrl}/projects`));
                        return true;
                    } catch (e) {
                        logger.error('Failed to fetch user info', e);
                    }
                }
            }

            let cliConfig: CloudCliConfig;
            try {
                logger.info('🔌 Connecting to the Think Throo API...');
                const config = await cloudApiService.config();
                cliConfig = config.data;
            } catch (e: unknown) {
                logger.error('🥲 Oops! Something went wrong while logging you in. Please try again.');
                logger.break();
                logger.error(e);
                return false;
            }

        } catch (error) {
            logger.break()
            handleError(error)
        }
    })