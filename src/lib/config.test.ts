import { test, expect, describe, afterAll } from "bun:test";
import { exportToConf, importFromConf } from "./config";
import type { HostLine } from "./hosts";
import * as fs from 'fs';
import * as path from 'path';

describe("XML Config export and import", () => {
  const testFile = path.join(process.cwd(), 'test_domains.conf');

  afterAll(() => {
    if (fs.existsSync(testFile)) {
      fs.unlinkSync(testFile);
    }
  });

  test("should correctly export and import host lines to XML", () => {
    const lines: HostLine[] = [
      { id: '1', type: 'entry', raw: '', ip: '192.168.0.1', domains: ['my.router'] },
      { id: '2', type: 'comment', raw: '# ignored' },
      { id: '3', type: 'entry', raw: '', ip: '10.0.0.1', domains: ['api.local', 'db.local'] }
    ];

    const exported = exportToConf(lines, testFile);
    expect(exported).toBe(true);
    expect(fs.existsSync(testFile)).toBe(true);

    const imported = importFromConf(testFile);
    expect(imported.length).toBe(2);
    expect(imported[0].ip).toBe('192.168.0.1');
    expect(imported[0].domains).toEqual(['my.router']);
    
    expect(imported[1].ip).toBe('10.0.0.1');
    expect(imported[1].domains).toEqual(['api.local', 'db.local']);
  });
});
