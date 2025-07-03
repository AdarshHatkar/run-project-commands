# run-project-commands (rpc)

A simple CLI tool to run project commands and display package information.

## Installation

### Recommended: Global Installation (Preferred)

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
npx rpc
```

## Usage

When you run `rpc` in a project directory, it will display the package name and version from the package.json file.

You can run the command from any directory on your system when installed globally.

## Development

1. Clone the repository
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

## Troubleshooting

### Command not found after global installation

If you've installed the package globally but still get a "command not found" error when running `rpc`, try the following:

1. Make sure your global npm bin directory is in your PATH:
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

## License

MIT