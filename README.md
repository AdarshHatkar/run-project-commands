# Run Project Commands (RPC)

[![npm version](https://img.shields.io/npm/v/run-project-commands.svg)](https://www.npmjs.com/package/run-project-commands)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/run-project-commands)](https://nodejs.org/)

A powerful, developer-friendly CLI toolkit for running and managing project commands in JavaScript/TypeScript projects. Streamline your development workflow with automated task management, command execution, and project configuration.

## ✨ Features

- **Simple Command Execution**: Run project commands with ease using the intuitive CLI interface
- **Project Information**: Display package details directly from your terminal
- **System Diagnostics**: Built-in doctor command to verify installation and compatibility
- **Developer-Friendly**: Designed for JavaScript/TypeScript developers to increase productivity
- **Cross-Platform**: Works on Windows, macOS, and Linux environments

## 🚀 Installation

### Global Installation (Recommended)

We recommend installing `run-project-commands` globally to make the `rpc` command available in any terminal or directory on your system:

```bash
npm install -g run-project-commands
```

After global installation, you can run the `rpc` command from any terminal:

```bash
rpc
```

### Alternative: Run with npx

If you prefer not to install globally, you can run it directly with npx:

```bash
npx run-project-commands
# or shorter:
npx rpc
```

## 📋 Usage

### Basic Command

When you run `rpc` in a project directory, it will display the package name and version from the package.json file.

```bash
rpc
```

### Available Commands

#### Doctor Command (`rpc doctor`)

The doctor command checks if your installation is healthy and working correctly:

```bash
rpc doctor
```

**This command performs:**
- ✅ Verification of global RPC installation
- 🔄 Checks for available updates
- 🔍 Node.js compatibility validation
- 💡 Troubleshooting recommendations

### Command Options

```bash
# Display version information
rpc -v
rpc --version

# Display help menu and available commands
rpc --help
```

## 💻 Development

Want to contribute or build locally? Follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/AdarshHatkar/run-project-commands.git
   cd run-project-commands
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

4. For development with auto-rebuild:
   ```bash
   npm run dev
   ```

5. Link locally for testing:
   ```bash
   npm run link
   ```

## 🔍 Troubleshooting

### Command not found after global installation

If you've installed the package globally but still get a "command not found" error when running `rpc`, try the following:

1. Check your PATH environment variable:
   ```bash
   # On Windows (PowerShell)
   $env:PATH
   
   # On macOS/Linux
   echo $PATH
   ```

2. Find the location of your global npm bin directory:
   ```bash
   npm config get prefix
   ```
   
   The global bin directory is typically `<npm prefix>/bin` on macOS/Linux or `<npm prefix>` on Windows.

3. If needed, add the global npm bin directory to your PATH in your shell profile.

## 📊 Compatibility

- Node.js: >=16.0.0
- Platforms: Windows, macOS, Linux

## 📄 License

[MIT](LICENSE) © [Adarsh Hatkar](https://github.com/AdarshHatkar)

## 🔗 Links

- [GitHub Repository](https://github.com/AdarshHatkar/run-project-commands)
- [NPM Package](https://www.npmjs.com/package/run-project-commands)
- [Issues](https://github.com/AdarshHatkar/run-project-commands/issues)
- [Author](https://github.com/AdarshHatkar)