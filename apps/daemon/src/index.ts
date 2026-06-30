#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { loadConfig, saveConfig, configPath } from './config.js';
import { runDaemon } from './daemon.js';

const program = new Command();

program
  .name('thinkthroo-daemon')
  .description('Local daemon that runs Claude Code agents for thinkthroo')
  .version('0.1.0');

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
      console.log('Run ' + chalk.bold('thinkthroo-daemon start') + ' to begin polling for tasks.');
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
