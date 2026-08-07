import * as fs from 'fs';
import * as path from 'path';

const dirPath = '/Users/piotrzaborow/Developer/harbor/d';
const expandedPath = dirPath;

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
}

console.log({searchDir, searchPrefix});
const files = fs.readdirSync(searchDir);
const processed = files.filter(f => fs.statSync(path.join(searchDir, f)).isDirectory()).map(f => f + '/');

let matches = processed;
if (searchPrefix) {
  matches = processed.filter(f => f.toLowerCase().startsWith(searchPrefix.toLowerCase()));
}
console.log(matches);
