import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import { spawn } from 'child_process';
import inquirer from 'inquirer';
import ora from 'ora';

// Built-in command names that could conflict with script names
const BUILT_IN_COMMANDS = ['doctor', 'run', 'help'];

// Find and parse package.json from the current directory
function findPackageJson(dir = process.cwd()): { path: string; content: any } | null {
  try {
    const packagePath = path.join(dir, 'package.json');
    if (fs.existsSync(packagePath)) {
      const content = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      return { path: packagePath, content };
    }
    return null;
  } catch (error) {
    return null;
  }
}

// Get available scripts from package.json
function getAvailableScripts(packageJson: any): Record<string, string> | null {
  if (packageJson && packageJson.scripts && Object.keys(packageJson.scripts).length > 0) {
    return packageJson.scripts;
  }
  return null;
}

// Run a script using npm/yarn/pnpm
function executeScript(scriptName: string, scriptCommand: string): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(chalk.blue(`\n> Executing: ${chalk.bold(scriptName)} (${scriptCommand})\n`));

    // Determine which package manager to use based on files in directory
    const packageManager = fs.existsSync(path.join(process.cwd(), 'yarn.lock')) 
      ? 'yarn' 
      : fs.existsSync(path.join(process.cwd(), 'pnpm-lock.yaml')) 
        ? 'pnpm'
        : 'npm';
    
    // Determine the command and arguments based on package manager
    let command: string;
    let args: string[];
    
    if (packageManager === 'yarn') {
      command = packageManager;
      args = [scriptName];
    } else {
      command = packageManager;
      args = ['run', scriptName];
    }
    
    // Execute the command
    const childProcess = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
    });

    childProcess.on('close', (code) => {
      if (code === 0) {
        console.log(chalk.green(`\n✓ Script ${chalk.bold(scriptName)} completed successfully`));
        resolve();
      } else {
        console.log(chalk.red(`\n✗ Script ${chalk.bold(scriptName)} failed with exit code ${code}`));
        reject(new Error(`Script failed with exit code ${code}`));
      }
    });

    childProcess.on('error', (err) => {
      console.error(chalk.red(`\n✗ Failed to execute script: ${err.message}`));
      reject(err);
    });
  });
}

// Interactive selection of scripts
async function selectAndRunScript(scripts: Record<string, string>): Promise<void> {
  // List all scripts directly instead of showing a separate header
  const scriptNames = Object.keys(scripts);
  
  console.log(chalk.yellow.bold('Available scripts:'));
  
  scriptNames.forEach(name => {
    console.log(`  ${chalk.cyan(name)}: ${chalk.dim(scripts[name])}`);
  });
  
  console.log(''); // Add a blank line for readability
  
  const { selectedScript } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedScript',
      message: 'Select a script to run:',
      choices: scriptNames.map(name => ({
        name: `${chalk.green(name)} ${chalk.dim(`→ ${scripts[name]}`)}`,
        value: name
      }))
    }
  ]);
  
  await executeScript(selectedScript, scripts[selectedScript]);
}

// Prompt for resolving command conflicts
export async function resolveCommandConflict(scriptName: string): Promise<'script' | 'command'> {
  const { choice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'choice',
      message: `'${scriptName}' exists as both a script and an RPC command. Which would you like to run?`,
      choices: [
        { name: `Run as a script (from package.json)`, value: 'script' },
        { name: `Run as an RPC command`, value: 'command' }
      ]
    }
  ]);
  
  return choice;
}

// Check if a script exists in package.json
export async function isScriptName(name: string): Promise<boolean> {
  const pkg = findPackageJson();
  if (!pkg) return false;
  
  const scripts = getAvailableScripts(pkg.content);
  if (!scripts) return false;
  
  return !!scripts[name];
}

// Check if a name conflicts with built-in commands
export function checkCommandConflict(scriptName: string): boolean {
  return BUILT_IN_COMMANDS.includes(scriptName);
}

// Main run command handler
export async function runCommand(scriptName?: string, forceAsScript = false): Promise<void> {
  // If no arguments are provided, show a nicer welcome message
  if (!scriptName) {
    console.log(chalk.blue.bold('\n🚀 Run Project Commands (RPC)'));
    console.log(chalk.dim('Available scripts in package.json:\n'));
  }

  // Skip spinner for direct script execution to avoid confusion
  const showSpinner = !scriptName;
  const spinner = showSpinner ? ora('Looking for scripts in package.json...').start() : null;
  
  const pkg = findPackageJson();
  
  if (!pkg) {
    if (spinner) spinner.fail(chalk.red('No package.json found in the current directory.'));
    else console.error(chalk.red('No package.json found in the current directory.'));
    return;
  }
  
  const scripts = getAvailableScripts(pkg.content);
  
  if (!scripts || Object.keys(scripts).length === 0) {
    if (spinner) spinner.fail(chalk.red('No scripts found in package.json.'));
    else console.error(chalk.red('No scripts found in package.json.'));
    return;
  }
  
  if (spinner) spinner.succeed(chalk.green(`Found ${Object.keys(scripts).length} script${Object.keys(scripts).length === 1 ? '' : 's'} in package.json`));
  
  // If a script name is provided, run it directly
  if (scriptName) {
    // Check for command conflicts only if not already forced as script
    if (!forceAsScript && checkCommandConflict(scriptName) && scripts[scriptName]) {
      // We have a conflict - the name exists both as a built-in command and as a script
      const choice = await resolveCommandConflict(scriptName);
      
      if (choice === 'script') {
        // User chose to run as a script
        try {
          await executeScript(scriptName, scripts[scriptName]);
        } catch (error: any) {
          console.error(chalk.red(`Error executing script: ${error?.message || 'Unknown error'}`));
        }
      } else {
        // User chose to run as a command - do nothing here, the command handling is done elsewhere
        console.log(chalk.blue(`Running '${scriptName}' as an RPC command...`));
        return;
      }
    } else if (scripts[scriptName]) {
      // No conflict or forced as script, just run it
      try {
        await executeScript(scriptName, scripts[scriptName]);
      } catch (error: any) {
        console.error(chalk.red(`Error executing script: ${error?.message || 'Unknown error'}`));
      }
    } else {
      console.error(chalk.red(`Script '${scriptName}' not found in package.json`));
      console.log(chalk.yellow('Available scripts:'));
      Object.keys(scripts).forEach(name => {
        console.log(`  ${chalk.cyan(name)}: ${scripts[name]}`);
      });
      process.exit(1);
    }
    return;
  }
  
  // If no script name is provided, show interactive selection
  await selectAndRunScript(scripts);
}
