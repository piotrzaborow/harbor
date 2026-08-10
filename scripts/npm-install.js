import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO = 'piotrzaborow/laneway';

// If the src directory exists, this is a local install (development/CI) and we should skip downloading the binary.
if (fs.existsSync(path.join(__dirname, '..', 'src', 'index.tsx'))) {
  console.log('Local development or CI build detected (source files present). Skipping binary download.');
  process.exit(0);
}

// Use process.env.npm_package_version, fallback to reading package.json manually
let VERSION = process.env.npm_package_version;
if (!VERSION) {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
  VERSION = pkg.version;
}

const PLATFORM_MAPPING = {
  darwin: 'mac',
  linux: 'linux',
  win32: 'windows',
};

const ARCH_MAPPING = {
  x64: 'x64',
  arm64: 'arm',
};

async function downloadBinary() {
  const platform = PLATFORM_MAPPING[process.platform];
  const arch = ARCH_MAPPING[process.arch];

  if (!platform || !arch) {
    console.error(`Unsupported platform or architecture: ${process.platform} ${process.arch}`);
    process.exit(1);
  }

  // Handle missing Windows ARM64 explicitly since it's not in the build matrix
  if (platform === 'windows' && arch === 'arm') {
    console.error('Windows ARM64 is not currently supported.');
    process.exit(1);
  }

  const binaryName = platform === 'windows' ? `laneway-${platform}-${arch}.exe` : `laneway-${platform}-${arch}`;
  const downloadUrl = `https://github.com/${REPO}/releases/download/v${VERSION}/${binaryName}`;
  const binDir = path.join(__dirname, '..', 'bin');
  const destPath = path.join(binDir, platform === 'windows' ? 'laneway.exe' : 'laneway');

  if (!fs.existsSync(binDir)) {
    fs.mkdirSync(binDir, { recursive: true });
  }

  console.log(`Downloading Laneway CLI from ${downloadUrl}...`);

  return new Promise((resolve, reject) => {
    https.get(downloadUrl, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirect
        https.get(response.headers.location, (redirectResponse) => {
          if (redirectResponse.statusCode !== 200) {
            reject(new Error(`Failed to download: ${redirectResponse.statusCode}`));
            return;
          }
          saveFile(redirectResponse, destPath, resolve, reject);
        }).on('error', reject);
      } else if (response.statusCode === 200) {
        saveFile(response, destPath, resolve, reject);
      } else {
        reject(new Error(`Failed to download: ${response.statusCode} - Make sure v${VERSION} release exists on GitHub.`));
      }
    }).on('error', reject);
  });
}

function saveFile(response, destPath, resolve, reject) {
  const file = fs.createWriteStream(destPath);
  response.pipe(file);
  file.on('finish', () => {
    file.close();
    // Make executable
    if (process.platform !== 'win32') {
      fs.chmodSync(destPath, 0o755);
    }
    console.log(`Successfully installed Laneway CLI to ${destPath}`);
    resolve();
  });
  file.on('error', (err) => {
    fs.unlink(destPath, () => reject(err));
  });
}

downloadBinary().catch((err) => {
  console.error(err);
  process.exit(1);
});
