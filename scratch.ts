import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const dirPath = '/Users/piotrzaborow/Developer/harbor/d';

const expandTilde = (p: string) => {
  if (p.startsWith('~/')) {
    return path.join(os.homedir(), p.slice(2));
  }
  return p;
};

const expandedPath = expandTilde(dirPath);
let searchDir = process.cwd();
let searchPrefix = expandedPath;
const isAbs = path.isAbsolute(expandedPath);

if (isAbs) {
  if (expandedPath.endsWith('/')) {
    searchDir = expandedPath;
    searchPrefix = '';
  } else {
    searchDir = path.dirname(expandedPath);
    searchPrefix = path.basename(expandedPath);
  }
} else {
  if (expandedPath.includes('/')) {
    const absolute = path.resolve(expandedPath);
    if (expandedPath.endsWith('/')) {
        searchDir = absolute;
        searchPrefix = '';
    } else {
        searchDir = path.dirname(absolute);
        searchPrefix = path.basename(absolute);
    }
  }
}

console.log("searchDir:", searchDir);
console.log("searchPrefix:", searchPrefix);

if (fs.existsSync(searchDir)) {
  const files = fs.readdirSync(searchDir);
  const processed = files.filter(f => {
    try {
      return fs.statSync(path.join(searchDir, f)).isDirectory();
    } catch {
      return false;
    }
  }).map(f => f + '/').sort((a, b) => a.localeCompare(b));
  
  let matches = processed;
  if (searchPrefix) {
    matches = processed.filter(f => f.toLowerCase().startsWith(searchPrefix.toLowerCase()));
  }
  
  console.log("matches:", matches);
}
