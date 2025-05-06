export interface CLIContext {
}

export type CloudCliConfig = {
    clientId: string;
    baseUrl: string;
    deviceCodeAuthUrl: string;
    audience: string;
    scope: string;
    tokenUrl: string;
    jwksUrl: string;
    projectDeployment: {
        confirmationText: string;
    };
    buildLogsConnectionTimeout: string;
    buildLogsMaxRetries: string;
    notificationsConnectionTimeout: string;
    maxProjectFileSize: string;
};