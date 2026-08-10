import { spawn } from 'child_process';

/**
 * Checks the NPM registry for the latest version of laneway.
 * Returns the latest version string if an update is available, otherwise null.
 */
export async function checkForUpdate(currentVersion: string): Promise<string | null> {
  try {
    const response = await fetch('https://registry.npmjs.org/laneway/latest');
    if (!response.ok) return null;
    
    const data = await response.json();
    const latestVersion = data.version;

    if (latestVersion && isNewerVersion(currentVersion, latestVersion)) {
      return latestVersion;
    }
  } catch (error) {
    // Silently ignore network errors during background check
  }
  return null;
}

/**
 * Performs an automated update using npm.
 * Returns true if successful, false if it fails.
 */
export function performUpdate(): Promise<boolean> {
  return new Promise((resolve) => {
    // Spawn the update process
    const child = spawn('npm', ['install', '-g', 'laneway@latest'], {
      stdio: 'ignore', // We don't want to mess up the TUI rendering
      shell: true,     // Required on some systems to resolve npm
    });

    child.on('close', (code) => {
      resolve(code === 0);
    });

    child.on('error', () => {
      resolve(false);
    });
  });
}

/**
 * Very basic semantic version comparison.
 * Returns true if v2 > v1.
 */
function isNewerVersion(v1: string, v2: string): boolean {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p2 > p1) return true;
    if (p2 < p1) return false;
  }
  return false;
}
