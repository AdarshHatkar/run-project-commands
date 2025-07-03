#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import { prompt } from 'enquirer';
import execa from 'execa';

interface PackageJson {
  scripts?: Record<string, string>;
  name?: string;
}

async function findPackageJson(): Promise<string | null> {
  const currentDir = process.cwd();
  const packageJsonPath = path.join(currentDir, 'package.json');
  
  if (fs.existsSync(packageJsonPath)) {
    return packageJsonPath;
  }
  
  return null;
}

async function readPackageJson(packageJsonPath: string): Promise<PackageJson> {
  try {
    const content = fs.readFileSync(packageJsonPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to read package.json: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function selectScript(scripts: Record<string, string>): Promise<string> {
  const scriptNames = Object.keys(scripts);
  
  if (scriptNames.length === 0) {
    throw new Error('No scripts found in package.json');
  }
  
  if (scriptNames.length === 1) {
    return scriptNames[0];
  }
  
  const result = await prompt<{script: string}>({
    type: 'select',
    name: 'script',
    message: 'Select a script to run:',
    choices: scriptNames.map(name => ({
      name,
      message: `${chalk.cyan(name)}: ${chalk.gray(scripts[name])}`
    }))
  });
  
  return result.script;
}

async function runScript(scriptName: string): Promise<void> {
  console.log(chalk.blue(`Running: npm run ${scriptName}`));
  console.log(chalk.gray('─'.repeat(50)));
  
  try {
    await execa('npm', ['run', scriptName], {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    console.log(chalk.gray('─'.repeat(50)));
    console.log(chalk.green(`✓ Script "${scriptName}" completed successfully`));
  } catch (error) {
    console.log(chalk.gray('─'.repeat(50)));
    if (error instanceof Error && 'exitCode' in error) {
      console.log(chalk.red(`✗ Script "${scriptName}" failed with exit code ${(error as any).exitCode}`));
      process.exit((error as any).exitCode || 1);
    } else {
      console.log(chalk.red(`✗ Script "${scriptName}" failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  }
}

async function main(): Promise<void> {
  try {
    console.log(chalk.bold.blue('🚀 Run Project Commands (rpc)'));
    console.log();
    
    // Find package.json
    const packageJsonPath = await findPackageJson();
    if (!packageJsonPath) {
      console.log(chalk.red('✗ No package.json found in the current directory'));
      console.log(chalk.gray('Make sure you are in a Node.js project directory'));
      process.exit(1);
    }
    
    // Read package.json
    const packageJson = await readPackageJson(packageJsonPath);
    
    if (!packageJson.scripts || Object.keys(packageJson.scripts).length === 0) {
      console.log(chalk.yellow('⚠ No scripts found in package.json'));
      process.exit(0);
    }
    
    console.log(chalk.gray(`Found package.json with ${Object.keys(packageJson.scripts).length} script(s)`));
    console.log();
    
    // Select script
    const selectedScript = await selectScript(packageJson.scripts);
    console.log();
    
    // Run script
    await runScript(selectedScript);
    
  } catch (error) {
    if (error instanceof Error && error.message.includes('cancelled')) {
      console.log(chalk.gray('\nOperation cancelled'));
      process.exit(0);
    }
    
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('Unhandled Rejection at:'), promise, chalk.red('reason:'), reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error(chalk.red('Uncaught Exception:'), error);
  process.exit(1);
});

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  console.log(chalk.gray('\nOperation cancelled'));
  process.exit(0);
});

if (require.main === module) {
  main();
}
