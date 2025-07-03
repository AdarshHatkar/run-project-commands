import { execSync } from 'child_process';
import chalk from 'chalk'; // ESM import
import ora from 'ora'; // ESM import
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { DoctorCheckResult } from '../types/commands.js';
import { CONFIG } from '../utils/config.js';

// Find the project root by looking for package.json starting from the current directory
function findPackageJson(startPath: string): string {
  let currentPath = startPath;
  // Limit the number of steps to avoid infinite loops
  for (let i = 0; i < 5; i++) {
    const packagePath = path.join(currentPath, 'package.json');
    if (fs.existsSync(packagePath)) {
      return packagePath;
    }
    // Go up one directory
    const parentPath = path.dirname(currentPath);
    if (parentPath === currentPath) {
      // We've reached the root with no success
      break;
    }
    currentPath = parentPath;
  }
  throw new Error('Could not find package.json in any parent directory');
}

// Get the current package version from package.json
function getLocalVersion(): string | null {
  try {
    // Get the directory of the current module
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    // Find package.json by traversing up the directory tree
    const packageJsonPath = findPackageJson(__dirname);
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    return packageJson.version;
  } catch (error) {
    console.error('Error reading package.json:', error);
    return null;
  }
}

// Check for the latest version on npm
async function getLatestVersion(): Promise<string | null> {
  try {
    const output = execSync(`npm show ${CONFIG.packageName} version`, { encoding: 'utf8' });
    return output.trim();
  } catch (error) {
    return null;
  }
}

// Check if the package is installed globally
function isGloballyInstalled(): boolean {
  try {
    const output = execSync(`npm list -g ${CONFIG.packageName}`, { encoding: 'utf8' });
    return !output.includes('empty');
  } catch (error) {
    return false;
  }
}

// Run diagnostics
export async function doctorCommand(): Promise<void> {
  console.log(chalk.blue.bold('\n🩺 RPC Doctor - Checking system...\n'));
  
  // Check if package is installed properly
  const installSpinner = ora('Checking installation status...').start();
  const isGlobal = isGloballyInstalled();
  
  if (isGlobal) {
    installSpinner.succeed(chalk.green('Run Project Commands is properly installed globally.'));
  } else {
    installSpinner.warn(chalk.yellow('Run Project Commands does not appear to be installed globally. Some features may not work as expected.'));
    console.log(chalk.yellow('  Tip: Install globally using ') + chalk.white(`npm install -g ${CONFIG.packageName}`));
  }
  
  // Check for version updates
  const versionSpinner = ora('Checking for updates...').start();
  const localVersion = getLocalVersion();
  const latestVersion = await getLatestVersion();
  
  if (!localVersion) {
    versionSpinner.fail(chalk.red('Could not determine local version.'));
  } else if (!latestVersion) {
    versionSpinner.fail(chalk.red('Could not check for updates. You may be offline.'));
  } else {
    if (localVersion === latestVersion) {
      versionSpinner.succeed(chalk.green(`You are running the latest version (${localVersion}).`));
    } else {
      versionSpinner.warn(chalk.yellow(`Update available: ${localVersion} → ${latestVersion}`));
      console.log(chalk.yellow('  Tip: Update using ') + chalk.white(`npm install -g ${CONFIG.packageName}@latest`));
    }
  }
  
  // Node.js version check
  const nodeSpinner = ora('Checking Node.js environment...').start();
  const nodeVersion = process.version;
  const requiredVersion = CONFIG.minNodeVersion;
  
  if (compareVersions(nodeVersion, requiredVersion) >= 0) {
    nodeSpinner.succeed(chalk.green(`Node.js ${nodeVersion} (meets minimum requirement of ${requiredVersion})`));
  } else {
    nodeSpinner.warn(chalk.yellow(`Node.js ${nodeVersion} (below minimum requirement of ${requiredVersion})`));
    console.log(chalk.yellow('  Tip: Update Node.js from ') + chalk.white('https://nodejs.org/'));
  }
  
  console.log(chalk.blue.bold('\n🩺 Doctor Summary:'));
  console.log(chalk.gray('If you encounter any issues, please report them at:'));
  console.log(chalk.white(`${CONFIG.githubRepoUrl}/issues\n`));
}

// Simple version comparison function
function compareVersions(a: string, b: string): number {
  const verA = a.replace('v', '').split('.').map(Number);
  const verB = b.replace('v', '').split('.').map(Number);
  
  for (let i = 0; i < Math.max(verA.length, verB.length); i++) {
    const numA = verA[i] || 0;
    const numB = verB[i] || 0;
    
    if (numA > numB) return 1;
    if (numA < numB) return -1;
  }
  
  return 0;
}
