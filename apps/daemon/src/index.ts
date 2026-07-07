#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { loadConfig, saveConfig, configPath } from './config.js';
import { runDaemon } from './daemon.js';
import { runBrowserAuth } from './auth.js';
import { installService, uninstallService, serviceStatus } from './service.js';
import { deregister } from './reporter.js';

const program = new Command();

program
  .name('thinkthroo')
  .description('Local daemon that runs Claude Code agents for thinkthroo')
  .version('1.0.0');

// ─── start ───────────────────────────────────────────────────────────────────
program
  .command('start')
  .description('Start the daemon — polls for tasks and runs them locally')
  .action(async () => {
    let config;
    try {
      config = await loadConfig();
    } catch (err) {
      console.error(chalk.red('Error:'), (err as Error).message);
      process.exit(1);
    }
    await runDaemon(config);
  });

// ─── setup ───────────────────────────────────────────────────────────────────
program
  .command('setup')
  .description('Authenticate via browser, register a runtime, and install a background service')
  .option('--platform-url <url>', 'Platform URL', 'https://app.thinkthroo.com')
  .option('--no-service', 'Skip installing a background service — just save credentials')
  .action(async (opts: { platformUrl: string; service: boolean }) => {
    const spinner = ora('Opening your browser to authenticate…').start();
    let auth;
    try {
      auth = await runBrowserAuth(opts.platformUrl);
      await saveConfig({ runtimeId: auth.runtimeId, apiKey: auth.apiKey, platformUrl: opts.platformUrl });
      spinner.succeed(`Authenticated. Config saved to ${configPath()}`);
    } catch (err) {
      spinner.fail((err as Error).message);
      process.exit(1);
    }

    if (!opts.service) {
      console.log('');
      console.log('Run ' + chalk.bold('thinkthroo start') + ' to begin polling for tasks.');
      return;
    }

    const serviceSpinner = ora('Installing background service…').start();
    try {
      await installService();
      serviceSpinner.succeed('Background service installed and started.');
      console.log('');
      console.log('The daemon will now keep running across reboots. Check ' + chalk.bold('thinkthroo service status') + ' any time.');
    } catch (err) {
      serviceSpinner.fail((err as Error).message);
      console.log('');
      console.log('You can still run it in the foreground with ' + chalk.bold('thinkthroo start') + '.');
    }
  });

// ─── service ─────────────────────────────────────────────────────────────────
const service = program
  .command('service')
  .description('Manage the daemon as a persistent background service');

service
  .command('install')
  .description('Install and start the background service (launchd on macOS, systemd --user on Linux)')
  .action(async () => {
    const spinner = ora('Installing background service…').start();
    try {
      await installService();
      spinner.succeed('Background service installed and started.');
    } catch (err) {
      spinner.fail((err as Error).message);
      process.exit(1);
    }
  });

service
  .command('uninstall')
  .description('Stop and remove the background service')
  .action(async () => {
    const spinner = ora('Removing background service…').start();
    try {
      let config;
      try {
        config = await loadConfig();
      } catch {
        config = null;
      }
      await uninstallService();
      if (config) {
        await deregister(config);
      }
      spinner.succeed('Background service removed.');
    } catch (err) {
      spinner.fail((err as Error).message);
      process.exit(1);
    }
  });

service
  .command('status')
  .description('Show background service status')
  .action(async () => {
    try {
      console.log(await serviceStatus());
    } catch (err) {
      console.error(chalk.red('Error:'), (err as Error).message);
      process.exit(1);
    }
  });

// ─── configure ───────────────────────────────────────────────────────────────
program
  .command('configure')
  .description('Save daemon credentials obtained from the thinkthroo platform settings')
  .requiredOption('--runtime-id <id>', 'Runtime ID shown after registering in the UI')
  .requiredOption('--api-key <key>', 'API key shown once after registering in the UI')
  .option('--platform-url <url>', 'Platform URL', 'https://app.thinkthroo.com')
  .action(async (opts: { runtimeId: string; apiKey: string; platformUrl: string }) => {
    const spinner = ora('Saving config…').start();
    try {
      await saveConfig({
        runtimeId: opts.runtimeId,
        apiKey: opts.apiKey,
        platformUrl: opts.platformUrl,
      });
      spinner.succeed(`Config saved to ${configPath()}`);
      console.log('');
      console.log('Run ' + chalk.bold('thinkthroo start') + ' to begin polling for tasks.');
    } catch (err) {
      spinner.fail('Failed to save config');
      console.error((err as Error).message);
      process.exit(1);
    }
  });

// ─── status ──────────────────────────────────────────────────────────────────
program
  .command('status')
  .description('Show the current daemon configuration')
  .action(async () => {
    try {
      const config = await loadConfig();
      console.log(chalk.bold('Daemon configuration'));
      console.log(`  Runtime ID:   ${config.runtimeId}`);
      console.log(`  Platform URL: ${config.platformUrl}`);
      console.log(`  Config file:  ${configPath()}`);
      console.log(`  API key:      ${config.apiKey.slice(0, 8)}…`);
    } catch (err) {
      console.error(chalk.red('Error:'), (err as Error).message);
      process.exit(1);
    }
  });

program.parse();
