#!/usr/bin/env node
const { spawnSync } = require("child_process");
const path = require("path");

const PLATFORMS = {
    "darwin-arm64": "@piotrzaborow/laneway-darwin-arm64",
    "darwin-x64": "@piotrzaborow/laneway-darwin-x64",
    "linux-arm64": "@piotrzaborow/laneway-linux-arm64",
    "linux-x64": "@piotrzaborow/laneway-linux-x64",
    "win-arm64": "@piotrzaborow/laneway-win-arm64",
    "win-x64": "@piotrzaborow/laneway-win-x64"
};

const key = `${process.platform}-${process.arch}`;
const pkgName = PLATFORMS[key];

if (!pkgName) {
    console.error(`Unsupported platform/architecture: ${key}`);
    process.exit(1);
}

const exeName = process.platform === "win32" ? "laneway.exe" : "laneway";

let binPath;
try {
    binPath = require.resolve(`${pkgName}/bin/${exeName}`);
} catch {
    console.error(`Failed to find executable for platform ${pkgName}.`);
    process.exit(1);
}

const result = spawnSync(binPath, process.argv.slice(2), { stdio: "inherit" });
process.exit(result.status ?? 0);