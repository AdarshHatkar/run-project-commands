
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Navigate to the package.json - calculating path correctly whether we're in src/ or dist/
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

const packageJsonPath = findPackageJson(__dirname);
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Version information
export const VERSION = packageJson.version;

// Utility functions
export function getPackageInfo() {
  return {
    name: packageJson.name,
    version: VERSION,
    description: packageJson.description
  };
}
