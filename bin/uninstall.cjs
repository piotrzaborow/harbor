#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const os = require("os");

const lanewayDir = path.join(os.homedir(), ".laneway");

if (fs.existsSync(lanewayDir)) {
    try {
        fs.rmSync(lanewayDir, { recursive: true, force: true });
        console.log(`Successfully removed laneway cache at ${lanewayDir}`);
    } catch (e) {
        console.error(`Failed to remove laneway cache at ${lanewayDir}:`, e.message);
    }
}
