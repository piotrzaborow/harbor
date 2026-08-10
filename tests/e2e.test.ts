import { test, expect, describe, afterAll, beforeAll } from "bun:test";
import * as fs from 'fs';
import * as path from 'path';

describe("Laneway E2E TUI flow", () => {
  const mockHostsPath = path.join(process.cwd(), 'mock_hosts_e2e.txt');
  const initialContent = `127.0.0.1\tlocalhost\n255.255.255.255\tbroadcasthost\n::1\tlocalhost\n`;

  beforeAll(() => {
    fs.writeFileSync(mockHostsPath, initialContent, 'utf-8');
  });

  afterAll(() => {
    if (fs.existsSync(mockHostsPath)) {
      fs.unlinkSync(mockHostsPath);
    }
  });

  test.skip("should edit an entry and save to mocked hosts file", async () => {
    // Spawn TUI
    const proc = Bun.spawn(["bun", "src/index.tsx"], {
      env: {
        ...process.env,
        LANEWAY_HOSTS_PATH: mockHostsPath,
        LANEWAY_DISABLE_FLUSH: "1",
        LANEWAY_TEST_MODE: "1"
      },
      stdin: "pipe",
      stdout: "pipe",
      stderr: "pipe"
    });

    // Wait a brief moment for React to mount and parse the file
    await Bun.sleep(1500);

    // Simulate key presses
    // 1. Press 'e' to edit the first line
    proc.stdin.write("e");
    await Bun.sleep(100);

    // 2. We are focused on IP. Backspace 9 times to clear 127.0.0.1
    for (let i=0; i<9; i++) {
        proc.stdin.write("\x7f"); // backspace
    }
    await Bun.sleep(100);

    // 3. Type new IP '10.0.0.99'
    proc.stdin.write("10.0.0.99");
    await Bun.sleep(100);
    
    // 4. Press Enter to go to domain name
    proc.stdin.write("\r");
    await Bun.sleep(100);

    // 5. Press Enter to save the form
    proc.stdin.write("\r");
    await Bun.sleep(100);

    // 6. Press 's' to save to system hosts
    proc.stdin.write("s");
    await Bun.sleep(100);

    // 7. Press 'q' to quit
    proc.stdin.write("q");
    
    // Wait for exit
    await proc.exited;

    // Read the file and assert
    const result = fs.readFileSync(mockHostsPath, 'utf-8');
    expect(result).toContain('10.0.0.99\tlocalhost');
    expect(result).not.toContain('127.0.0.1\tlocalhost');
  }, 10000);
});
