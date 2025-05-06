import axios, { type AxiosResponse } from 'axios';
import type { CLIContext, CloudCliConfig } from '@/src/types';
import { apiConfig } from '@/src/config/api';
import packageJson from '../../package.json';
import { getLocalConfig } from '../config/local';
import os from 'os';
import { logger } from '../utils/logger';

export const VERSION = 'v1';

export interface CloudApiService {
    config(): Promise<AxiosResponse<CloudCliConfig>>;
    getUserInfo(): Promise<AxiosResponse>;
}

export async function cloudApiFactory(
    token?: string
): Promise<CloudApiService> {

    const localConfig = await getLocalConfig();
    const customHeaders = {
        'x-device-id': localConfig.installId,
        'x-app-version': packageJson.version,
        'x-os-name': os.type(),
        'x-os-version': os.version(),
        'x-language': Intl.DateTimeFormat().resolvedOptions().locale,
        'x-node-version': process.versions.node,
    };
    const axiosCloudAPI = axios.create({
        baseURL: `${apiConfig.apiBaseUrl}/${VERSION}`,
        headers: {
            'Content-Type': 'application/json',
            ...customHeaders,
        },
    });

    if (token) {
        axiosCloudAPI.defaults.headers.Authorization = `Bearer ${token}`;
    }

    return {

        getUserInfo() {
            return axiosCloudAPI.get('/user');
        },      

        async config(): Promise<AxiosResponse<CloudCliConfig>> {
            try {
                const response = await axiosCloudAPI.get('/api/config');

                if (response.status !== 200) {
                    throw new Error('Error fetching cloud CLI config from the server.');
                }

                return response;
            } catch (error) {
                logger.error(
                    "🥲 Oops! Couldn't retrieve the cloud CLI config from the server. Please try again."
                );

                throw error;
            }
        }
    }

}