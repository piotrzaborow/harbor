import * as fs from 'fs';
import * as path from 'path';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import type { HostLine } from './hosts';

export function exportToConf(lines: HostLine[], filePath = 'domains.conf'): boolean {
  try {
    const entries = lines
      .filter((line) => line.type === 'entry')
      .map((line) => ({
        ip: line.ip,
        domain: line.domains?.join(' ')
      }));

    const obj = {
      "?xml": { "@_version": "1.0", "@_encoding": "UTF-8" },
      hosts: {
        entry: entries
      }
    };

    const builder = new XMLBuilder({
      ignoreAttributes: false,
      format: true,
    });

    const xmlContent = builder.build(obj);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, xmlContent, 'utf-8');
    return true;
  } catch (err) {
    console.error('Failed to export to XML config', err);
    return false;
  }
}

export function importFromConf(filePath = 'domains.conf'): HostLine[] {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const parser = new XMLParser({
      ignoreAttributes: false,
      isArray: (name) => name === 'entry' // Ensure entry is always an array
    });
    const parsed = parser.parse(content);
    
    if (!parsed || !parsed.hosts || !parsed.hosts.entry) {
      return [];
    }

    return parsed.hosts.entry.map((entry: any, index: number) => {
      const id = `xml-${index}-${Date.now()}`;
      const ip = entry.ip;
      const domains = typeof entry.domain === 'string' ? entry.domain.split(' ') : [];
      return {
        id,
        type: 'entry',
        raw: `${ip}\t${domains.join(' ')}`,
        ip,
        domains
      } as HostLine;
    });
  } catch (err) {
    console.error('Failed to import from XML config', err);
    return [];
  }
}
