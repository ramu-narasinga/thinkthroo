import path from 'path';
import os from 'os';
import fse from 'fs-extra';
import XDGAppPaths from 'xdg-app-paths';

const APP_FOLDER_NAME = 'com.thinkthroo.cli';

export const CONFIG_FILENAME = 'config.json';

export type LocalConfig = {
    token?: string;
    installId?: string;
};

async function checkDirectoryExists(directoryPath: string) {
    try {
        const fsStat = await fse.lstat(directoryPath);
        return fsStat.isDirectory();
    } catch (e) {
        return false;
    }
}

async function getConfigPath() {
    const configDirs = XDGAppPaths(APP_FOLDER_NAME).configDirs();
    const configPath = configDirs.find(checkDirectoryExists);

    if (!configPath) {
        await fse.ensureDir(configDirs[0]);
        return configDirs[0];
    }
    return configPath;
}

export async function getLocalConfig(): Promise<LocalConfig> {
    const configPath = await getConfigPath();
    console.log('Config path:', configPath);
    const configFilePath = path.join(configPath, CONFIG_FILENAME);
    await fse.ensureFile(configFilePath);
    try {
        return await fse.readJSON(configFilePath, { encoding: 'utf8', throws: true });
    } catch (e) {
        return {};
    }
}