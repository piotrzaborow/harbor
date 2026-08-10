#!/usr/bin/env node

import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const platform = os.platform();
const arch = os.arch();

// Map Node.js platform and arch to our package names
const PLATFORM_MAPPING = {
  darwin: 'darwin',
  linux: 'linux',
  win32: 'windows',
};

const ARCH_MAPPING = {
  x64: 'x64',
  arm64: 'arm64',
};

const mappedPlatform = PLATFORM_MAPPING[platform];
const mappedArch = ARCH_MAPPING[arch];

if (!mappedPlatform || !mappedArch) {
  console.error(`Unsupported platform or architecture: ${platform} ${arch}`);
  process.exit(1);
}

const packageName = `@piotrzaborow/laneway-${mappedPlatform}-${mappedArch}`;
let binPath;

try {
  // We resolve the package.json of the optional dependency, then point to the binary
  const packagePath = require.resolve(`${packageName}/package.json`);
  const pkgDir = path.dirname(packagePath);
  
  // The binary name inside the package
  const binName = mappedPlatform === 'windows' ? 'laneway.exe' : 'laneway';
  binPath = path.join(pkgDir, binName);
} catch (error) {
  console.error(`Failed to find native binary for ${platform} ${arch}.`);
  console.error(`Ensure that the optional dependency ${packageName} installed successfully.`);
  process.exit(1);
}

// Execute the binary and pass through all arguments and stdio
const result = spawnSync(binPath, process.argv.slice(2), {
  stdio: 'inherit',
});

if (result.error) {
  console.error(`Failed to execute ${binPath}:`, result.error);
  process.exit(1);
}

process.exit(result.status ?? 0);
