import * as os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function flushDns(): Promise<boolean> {
  if (process.env.LANEWAY_DISABLE_FLUSH) {
    return true;
  }

  const platform = os.platform();

  try {
    if (platform === 'darwin') {
      // macOS
      await execAsync('dscacheutil -flushcache; killall -HUP mDNSResponder');
      return true;
    } else if (platform === 'win32') {
      // Windows
      await execAsync('ipconfig /flushdns');
      return true;
    } else if (platform === 'linux') {
      // Linux (systemd-resolved is most common modern default)
      try {
        await execAsync('resolvectl flush-caches');
        return true;
      } catch (err) {
        try {
          await execAsync('systemctl restart systemd-resolved');
          return true;
        } catch (err2) {
          console.error('Failed to flush DNS on Linux (no systemd-resolved found)');
          return false;
        }
      }
    }
  } catch (err) {
    console.error('Failed to flush DNS', err);
    return false;
  }
  
  return false;
}
