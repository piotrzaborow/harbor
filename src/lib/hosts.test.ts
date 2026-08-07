import { test, expect, describe } from "bun:test";
import { parseHosts, serializeHosts, type HostLine } from "./hosts";

describe("hosts file parser and serializer", () => {
  const mockContent = `
# This is a comment
127.0.0.1 localhost
255.255.255.255 broadcasthost
::1             localhost
192.168.1.100 dev.local test.local # my dev server
`;

  test("should parse hosts content correctly", () => {
    const lines = parseHosts(mockContent);
    expect(lines.length).toBe(7);
    
    // First line is blank
    expect(lines[0].type).toBe('blank');
    
    // Second line is comment
    expect(lines[1].type).toBe('comment');
    expect(lines[1].raw).toBe('# This is a comment');
    
    // Third line is entry
    expect(lines[2].type).toBe('entry');
    expect(lines[2].ip).toBe('127.0.0.1');
    expect(lines[2].domains).toEqual(['localhost']);
    
    // Last line with comment
    expect(lines[5].type).toBe('entry');
    expect(lines[5].ip).toBe('192.168.1.100');
    expect(lines[5].domains).toEqual(['dev.local', 'test.local']);
    expect(lines[5].comment).toBe('# my dev server');
  });

  test("should serialize hosts back to correct string", () => {
    const lines = parseHosts(mockContent);
    
    // Modify one entry
    lines[5].ip = '10.0.0.5';
    lines[5].domains = ['new.local'];
    
    const serialized = serializeHosts(lines);
    expect(serialized).toContain('127.0.0.1\tlocalhost');
    expect(serialized).toContain('10.0.0.5\tnew.local # my dev server');
  });
});
