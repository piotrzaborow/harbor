# Harbor Domain Manager

Harbor is a blazingly fast, modern Terminal UI (TUI) application for managing your system's `/etc/hosts` file. It is built with [Bun](https://bun.sh) and [@opentui/react](https://github.com/opentui/opentui), providing a fully reactive interface directly in your terminal.

## Features

- **Interactive Editing**: Seamlessly add, edit, or delete `/etc/hosts` entries using your keyboard.
- **Auto DNS Flush**: Automatically flushes your system's DNS cache whenever you save your changes (macOS/Windows).
- **Import / Export**: Backup your domain configurations or share them across machines via an XML-based `.conf` format.
- **Smart Path Autocompletion**: The export/import modals include interactive `Tab` completion for directories and files, complete with `~` home directory expansion.
- **Dynamic Status Bar**: Get immediate visual feedback on the state of your hosts file (Unsaved, Saved, Ready, or Error).

## Installation

### Option 1: NPM (Recommended)

You can install Harbor globally via NPM. This will automatically download the correct standalone binary for your operating system:

```bash
npm install -g harbor
```

### Option 2: Homebrew (macOS / Linux)

You can install Harbor directly from this repository using Homebrew:

```bash
brew install piotrzaborow/harbor/harbor
```

### Option 3: From Source

Ensure you have [Bun](https://bun.sh) installed.

```bash
# Clone the repository
git clone https://github.com/piotrzaborow/harbor.git
cd harbor

# Install dependencies
bun install
```

## Usage

### Development

To run Harbor in development mode with hot-reloading:

```bash
bun run dev
```

*Note: You will be able to edit and export configurations in dev mode, but saving changes directly to `/etc/hosts` requires root privileges.*

### Production Build

To compile Harbor into a standalone, highly-optimized executable:

```bash
bun run build
```

Then run the binary with `sudo` to enable writing to `/etc/hosts`:

```bash
sudo ./dist/harbor
```

We also have pre-configured build scripts for cross-platform compilation (e.g., `build:mac:x64`, `build:linux:arm`). Check `package.json` for all available targets.

## Key Bindings

| Key | Action |
| --- | --- |
| `Up` / `Down` | Navigate lists and autocomplete suggestions |
| `Tab` | Autocomplete directory paths |
| `Enter` | Submit a form or field |
| `A` | Add a new domain entry |
| `E` | Edit the currently selected entry |
| `D` or `Backspace` | Delete the currently selected entry |
| `S` | Save changes to `/etc/hosts` and flush DNS |
| `X` | Export configuration to XML |
| `I` | Import configuration from XML |
| `Q` or `Ctrl+C` | Quit the application |

## Testing

Harbor includes both unit tests and End-to-End (E2E) tests.

```bash
# Run all tests
bun test

# Run E2E tests specifically
bun run test:e2e
```

The E2E tests are configured to use a mocked, temporary hosts file and bypass actual DNS flushing, so they are completely safe to run without `sudo` privileges.

## License
MIT
