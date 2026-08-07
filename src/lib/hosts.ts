import * as fs from 'fs';
import * as os from 'os';

export type HostLine = {
  id: string;
  type: 'blank' | 'comment' | 'entry';
  raw: string;
  ip?: string;
  domains?: string[];
  comment?: string;
  isDirty?: boolean;
};

export function getHostsFilePath(): string {
  if (process.env.HARBOR_HOSTS_PATH) {
    return process.env.HARBOR_HOSTS_PATH;
  }
  if (os.platform() === 'win32') {
    return 'C:\\Windows\\System32\\drivers\\etc\\hosts';
  }
  return '/etc/hosts';
}

export function parseHosts(content: string): HostLine[] {
  const lines = content.split(/\r?\n/);
  return lines.map((line, index) => {
    const id = `line-${index}-${crypto.randomUUID()}`;
    const trimmed = line.trim();

    if (trimmed === '') {
      return { id, type: 'blank', raw: line };
    }

    if (trimmed.startsWith('#')) {
      return { id, type: 'comment', raw: line };
    }

    // Match IP and the rest of the line
    const match = trimmed.match(/^([^\s]+)\s+(.*)$/);
    if (!match) {
      // Malformed, treat as comment/raw to preserve
      return { id, type: 'comment', raw: line };
    }

    const ip = match[1];
    let rest = match[2] || '';
    let comment = undefined;

    // Check if there is an inline comment
    const commentIndex = rest.indexOf('#');
    if (commentIndex !== -1) {
      comment = rest.slice(commentIndex);
      rest = rest.slice(0, commentIndex);
    }

    const domains = rest.split(/\s+/).filter((d) => d.length > 0);
    
    if (domains.length === 0) {
      return { id, type: 'comment', raw: line };
    }

    return { id, type: 'entry', raw: line, ip, domains, comment };
  });
}

export function serializeHosts(lines: HostLine[]): string {
  return lines
    .map((line) => {
      if (line.type === 'entry') {
        const domainStr = line.domains?.join(' ') || '';
        const commentStr = line.comment ? ` ${line.comment}` : '';
        // try to maintain original spacing if possible, but formatting to standard is fine
        return `${line.ip}\t${domainStr}${commentStr}`;
      }
      return line.raw; // blank or comment
    })
    .join(os.EOL);
}

export function loadSystemHosts(): HostLine[] {
  const filePath = getHostsFilePath();
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return parseHosts(content);
  } catch (err) {
    console.error('Failed to read hosts file', err);
    return [];
  }
}

export function saveSystemHosts(lines: HostLine[]): boolean {
  const filePath = getHostsFilePath();
  try {
    const content = serializeHosts(lines);
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  } catch (err) {
    console.error('Failed to write hosts file (do you have sudo privileges?)', err);
    return false;
  }
}
