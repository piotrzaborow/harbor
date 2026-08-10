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

// We map our build output names to Node.js os/cpu combinations
const targets = [
  { file: 'laneway-mac-arm', os: 'darwin', cpu: 'arm64' },
  { file: 'laneway-mac-x64', os: 'darwin', cpu: 'x64' },
  { file: 'laneway-linux-arm', os: 'linux', cpu: 'arm64' },
  { file: 'laneway-linux-x64', os: 'linux', cpu: 'x64' },
  { file: 'laneway-windows-arm64.exe', os: 'win32', cpu: 'arm64', exe: true },
  { file: 'laneway-windows-x64.exe', os: 'win32', cpu: 'x64', exe: true }
];

if (!fs.existsSync(npmDir)) {
  fs.mkdirSync(npmDir, { recursive: true });
}

for (const target of targets) {
  const binaryPath = path.join(distDir, target.file);
  if (!fs.existsSync(binaryPath)) {
    console.log(`Skipping ${target.file}: Not found in dist/`);
    continue;
  }

  const pkgName = `${baseName}-${target.os === 'win32' ? 'windows' : target.os}-${target.cpu}`;
  const fullPkgName = `${scope}/${pkgName}`;
  const targetDir = path.join(npmDir, pkgName);
  
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Generate package.json for the optional dependency
  const pkgJson = {
    name: fullPkgName,
    version,
    os: [target.os],
    cpu: [target.cpu],
    license: mainPkg.license,
    repository: mainPkg.repository,
    description: `Platform specific binary for ${baseName}`,
  };

  fs.writeFileSync(path.join(targetDir, 'package.json'), JSON.stringify(pkgJson, null, 2));

  // Copy binary
  const destBinaryName = target.exe ? 'laneway.exe' : 'laneway';
  const destBinaryPath = path.join(targetDir, destBinaryName);
  fs.copyFileSync(binaryPath, destBinaryPath);
  
  if (!target.exe) {
    fs.chmodSync(destBinaryPath, 0o755);
  }

  console.log(`Publishing ${fullPkgName}...`);
  try {
    // Publish using access=public in case the scope defaults to restricted
    execSync('npm publish --access public', { stdio: 'inherit', cwd: targetDir });
  } catch (error) {
    console.error(`Failed to publish ${fullPkgName}`);
    process.exit(1);
  }
}

console.log('Finished publishing platform packages.');
