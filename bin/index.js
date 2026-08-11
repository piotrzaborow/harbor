#!/usr/bin/env node
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");
const https = require("https");

const REPO = "piotrzaborow/laneway";
const PLATFORMS = {
    "darwin-arm64": "laneway-darwin-arm64",
    "darwin-x64": "laneway-darwin-x64",
    "linux-arm64": "laneway-linux-arm64",
    "linux-x64": "laneway-linux-x64",
    "win32-arm64": "laneway-windows-arm64.exe",
    "win32-x64": "laneway-windows-x64.exe"
};

const key = `${process.platform}-${process.arch}`;
const assetName = PLATFORMS[key];

if (!assetName) {
    console.error(`Unsupported platform/architecture: ${key}`);
    process.exit(1);
}

const lanewayDir = path.join(os.homedir(), ".laneway");
const binDir = path.join(lanewayDir, "bin");
const versionFile = path.join(lanewayDir, "version.txt");
const lastCheckFile = path.join(lanewayDir, "last_check.txt");
const exeName = process.platform === "win32" ? "laneway.exe" : "laneway";
const binPath = path.join(binDir, exeName);

if (!fs.existsSync(binDir)) {
    fs.mkdirSync(binDir, { recursive: true });
}

function httpsGet(url, options = {}) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, { headers: { 'User-Agent': 'laneway-cli' }, ...options }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return resolve(httpsGet(res.headers.location, options));
            }
            if (res.statusCode !== 200) {
                return reject(new Error(`HTTP ${res.statusCode}`));
            }
            let data = "";
            res.on("data", chunk => data += chunk);
            res.on("end", () => resolve(data));
            res.on("error", reject);
        });
        req.on("error", reject);
        req.setTimeout(5000, () => {
            req.destroy();
            reject(new Error("Timeout"));
        });
    });
}

function downloadBinary(url, dest) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, { headers: { 'User-Agent': 'laneway-cli' } }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return resolve(downloadBinary(res.headers.location, dest));
            }
            if (res.statusCode !== 200) {
                return reject(new Error(`HTTP ${res.statusCode}`));
            }
            const file = fs.createWriteStream(dest);
            res.pipe(file);
            file.on("finish", () => {
                file.close();
                resolve();
            });
            file.on("error", (err) => {
                fs.unlink(dest, () => reject(err));
            });
        });
        req.on("error", reject);
    });
}

async function getLatestRelease() {
    const data = await httpsGet(`https://api.github.com/repos/${REPO}/releases/latest`);
    return JSON.parse(data);
}

async function run() {
    try {
        let currentVersion = null;
        if (fs.existsSync(binPath) && fs.existsSync(versionFile)) {
            currentVersion = fs.readFileSync(versionFile, "utf-8").trim();
        }

        // Only check for updates once an hour to avoid rate limiting and slow startup
        let shouldCheck = true;
        if (currentVersion && fs.existsSync(lastCheckFile)) {
            const lastCheck = parseInt(fs.readFileSync(lastCheckFile, "utf-8"), 10);
            if (!isNaN(lastCheck) && Date.now() - lastCheck < 60 * 60 * 1000) {
                shouldCheck = false;
            }
        }

        if (shouldCheck) {
            let latestRelease;
            try {
                latestRelease = await getLatestRelease();
                fs.writeFileSync(lastCheckFile, Date.now().toString());
            } catch (e) {
                // Ignore offline errors if we have a cached version
                if (!currentVersion) {
                    throw new Error("Could not check for updates and no cached version exists. Please check your internet connection.");
                }
            }

            if (latestRelease && latestRelease.tag_name !== currentVersion) {
                if (currentVersion) {
                    console.log(`Updating laneway from ${currentVersion} to ${latestRelease.tag_name}...`);
                } else {
                    console.log(`Downloading laneway ${latestRelease.tag_name}...`);
                }
                const asset = latestRelease.assets.find(a => a.name === assetName);
                if (!asset) {
                    throw new Error(`Release asset ${assetName} for ${key} not found in release ${latestRelease.tag_name}.`);
                }
                await downloadBinary(asset.browser_download_url, binPath);
                fs.chmodSync(binPath, 0o755);
                fs.writeFileSync(versionFile, latestRelease.tag_name);
            }
        }

        execute();
    } catch (e) {
        console.error("Laneway Launcher Error:", e.message);
        process.exit(1);
    }
}

function execute() {
    const result = spawnSync(binPath, process.argv.slice(2), { stdio: "inherit" });
    if (result.error) {
        console.error("Failed to execute laneway:", result.error.message);
        process.exit(1);
    }
    process.exit(result.status ?? 0);
}

run();