import { getLocalConfig } from "@/src/config/local";
import { cloudApiFactory } from "./cli-api";
import { CloudCliConfig } from "../types";
import { logger } from "../utils/logger";
import type { JwtHeader, VerifyErrors } from 'jsonwebtoken';
import jwksClient, { type JwksClient, type SigningKey } from 'jwks-rsa';
import jwt from 'jsonwebtoken';

interface DecodedToken {
    [key: string]: any;
}


let cliConfig: CloudCliConfig

export async function tokenServiceFactory() {

    const cloudApiService = await cloudApiFactory();

    async function retrieveToken() {
        const appConfig = await getLocalConfig();
        if (appConfig.token) {
            // check if token is still valid
            if (await isTokenValid(appConfig.token)) {
                return appConfig.token;
            }
        }
        return undefined;
    }

    async function validateToken(idToken: string, jwksUrl: string): Promise<void> {
        const client: JwksClient = jwksClient({
            jwksUri: jwksUrl,
        });

        // Get the Key from the JWKS using the token header's Key ID (kid)
        const getKey = (header: JwtHeader, callback: (e: Error | null, key?: string) => void) => {
            client.getSigningKey(header.kid, (e: Error | null, key?: SigningKey) => {
                if (e) {
                    callback(e);
                } else if (key) {
                    const publicKey = 'publicKey' in key ? key.publicKey : key.rsaPublicKey;
                    callback(null, publicKey);
                } else {
                    callback(new Error('Key not found'));
                }
            });
        };

        const decodedToken = jwt.decode(idToken, { complete: true }) as DecodedToken;
        if (!decodedToken) {
            if (typeof idToken === 'undefined' || idToken === '') {
                logger.warn('You need to be logged in to use this feature. Please log in and try again.');
            } else {
                logger.error(
                    'There seems to be a problem with your login information. Please try logging in again.'
                );
            }
            return Promise.reject(new Error('Invalid token'));
        }

        // Verify the JWT token signature using the JWKS Key
        return new Promise<void>((resolve, reject) => {
            jwt.verify(idToken, getKey, (err: VerifyErrors | null) => {
                if (err) {
                    reject(err);
                }
                if (decodedToken.payload.exp < Math.floor(Date.now() / 1000)) {
                    reject(new Error('Token is expired'));
                }
                resolve();
            });
        });
    }

    async function isTokenValid(token: string) {
        try {
            const config = await cloudApiService.config();

            cliConfig = config.data;
            if (token) {
                await validateToken(token, cliConfig.jwksUrl);
                return true;
            }
            return false;
        } catch (e) {
            logger.error(e);
            return false;
        }
    }

    return {
        retrieveToken,
        isTokenValid
    }

}