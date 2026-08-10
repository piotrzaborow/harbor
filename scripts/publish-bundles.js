import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const npmDir = path.join(rootDir, 'npm');

const mainPkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
const version = mainPkg.version;
const scope = '@piotrzaborow';
const baseName = 'laneway';

// Map our build output files to Node.js platform and architecture
const bundles = [
  { file: 'laneway-darwin-arm64', os: 'darwin', cpu: 'arm64' },
  { file: 'laneway-darwin-x64', os: 'darwin', cpu: 'x64' },
  { file: 'laneway-linux-arm64', os: 'linux', cpu: 'arm64' },
  { file: 'laneway-linux-x64', os: 'linux', cpu: 'x64' },
  { file: 'laneway-windows-arm64.exe', os: 'win', cpu: 'arm64', exe: true },
  { file: 'laneway-windows-x64.exe', os: 'win', cpu: 'x64', exe: true }
];

if (!fs.existsSync(npmDir)) {
  fs.mkdirSync(npmDir, { recursive: true });
}

for (const bundle of bundles) {
  const binaryPath = path.join(distDir, bundle.file);

  if (!fs.existsSync(binaryPath)) {
    console.warn(`[WARN] Skipping ${bundle.file}: Binary not found in dist/`);
    continue;
  }

  const pkgName = `${baseName}-${bundle.os}-${bundle.cpu}`;
  const fullPkgName = `${scope}/${pkgName}`;
  const targetDir = path.join(npmDir, pkgName);
  const targetBinDir = path.join(targetDir, 'bin');

  if (!fs.existsSync(targetBinDir)) {
    fs.mkdirSync(targetBinDir, { recursive: true });
  }

  // 1. Generate package.json for the os-specific bundle
  const pkgJson = {
    name: fullPkgName,
    version,
    os: [bundle.os],
    cpu: [bundle.cpu],
    license: mainPkg.license,
    repository: mainPkg.repository,
    description: `Platform specific binary for ${baseName} (${bundle.os}-${bundle.cpu})`,
  };

  fs.writeFileSync(
    path.join(targetDir, 'package.json'),
    JSON.stringify(pkgJson, null, 2)
  );

  // 2. Copy the binary into the bin/ folder inside the package
  const destBinaryName = bundle.exe ? 'laneway.exe' : 'laneway';
  const destBinaryPath = path.join(targetBinDir, destBinaryName);

  fs.copyFileSync(binaryPath, destBinaryPath);

  // Ensure the binary is executable on Unix systems
  if (!bundle.exe) {
    fs.chmodSync(destBinaryPath, 0o755);
  }

  console.log(`Publishing ${fullPkgName}...`);
  try {
    // Publish using access=public
    execSync('npm publish --access public', { stdio: 'inherit', cwd: targetDir });
  } catch (error) {
    console.error(`[ERROR] Failed to publish ${fullPkgName}`);
    process.exit(1);
  }
}

console.log('Finished publishing all OS-specific bundles!');
