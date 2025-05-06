import env from '@/src/utils/env-helper';

export const apiConfig = {
  apiBaseUrl: env('THINKTHROO_CLI_CLOUD_API', 'https://app.thinkthroo.com'),
  dashboardBaseUrl: env('THINKTHROO_CLI_CLOUD_DASHBOARD', 'https://app.thinkthroo.com'),
};