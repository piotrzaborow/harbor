import React, { useState, useEffect } from 'react';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const expandTilde = (p: string) => {
  if (p.startsWith('~/')) {
    return path.join(os.homedir(), p.slice(2));
  }
  return p;
};

type FileModalProps = {
  mode: 'export' | 'import';
  fileAction: 'up' | 'down' | 'tab' | 'left' | null;
  onClearAction: () => void;
  onSave: (filePath: string) => void;
  onClose: () => void;
};

export function FileModal({ mode, fileAction, onClearAction, onSave, onClose }: FileModalProps) {
  const [dirPath, setDirPath] = useState(process.cwd() + '/');
  const [fileName, setFileName] = useState('domains.conf');
  const [focusField, setFocusField] = useState<'dir' | 'file'>('dir');
  const [suggestions, setSuggestions] = useState<string[]>(() => {
    try {
      const cwd = process.cwd();
      return fs.readdirSync(cwd)
        .filter(f => {
          try {
            return fs.statSync(path.join(cwd, f)).isDirectory();
          } catch {
            return false;
          }
        })
        .map(f => f + '/')
        .sort((a, b) => a.localeCompare(b));
    } catch {
      return [];
    }
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    try {
      fs.appendFileSync('/Users/piotrzaborow/Developer/harbor/debug.log', `[${new Date().toISOString()}] dirPath changed: ${dirPath}\n`);
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
          matches = processed.filter(f => f.toLowerCase().includes(searchPrefix.toLowerCase()));
        }
        fs.appendFileSync('/Users/piotrzaborow/Developer/harbor/debug.log', `searchDir: ${searchDir}, searchPrefix: ${searchPrefix}, matches: ${matches.length}, processed: ${processed.length}\n`);
        
        setSuggestions(matches);
        setSelectedIndex(0);
        setScrollTop(0);
      } else {
        setSuggestions([]);
        setSelectedIndex(0);
        setScrollTop(0);
      }
    } catch {
      setSuggestions([]);
      setSelectedIndex(0);
      setScrollTop(0);
    }
  }, [dirPath]);

  useEffect(() => {
    if (!fileAction) return;

    if (fileAction === 'down') {
      setSelectedIndex(s => {
        const next = Math.min(suggestions.length - 1, s + 1);
        setScrollTop(Math.max(0, Math.min(next - 3, suggestions.length - 8)));
        return next;
      });
    }
    if (fileAction === 'up') {
      if (focusField === 'file') {
        setFocusField('dir');
      } else {
        setSelectedIndex(s => {
          const next = Math.max(0, s - 1);
          setScrollTop(Math.max(0, Math.min(next - 3, suggestions.length - 8)));
          return next;
        });
      }
    }
    if (fileAction === 'tab' && suggestions.length > 0) {
      const selected = suggestions[selectedIndex];
      
      let dir = process.cwd();
      if (dirPath.startsWith('~/')) {
        dir = dirPath.endsWith('/') ? dirPath : (path.dirname(dirPath) + '/');
      } else if (path.isAbsolute(dirPath)) {
        dir = dirPath.endsWith('/') ? dirPath : (path.dirname(dirPath) + '/');
      } else {
        if (dirPath.includes('/')) {
          dir = dirPath.endsWith('/') ? dirPath : (path.dirname(dirPath) + '/');
        } else {
          dir = '';
        }
      }
      let targetPath = dir + selected;
      
      if (!targetPath.endsWith('/')) {
        try {
          const expanded = expandTilde(targetPath);
          const absolute = path.resolve(expanded);
          if (fs.statSync(absolute).isDirectory()) {
            targetPath += '/';
          }
        } catch (e) {}
      }
      
      setDirPath(targetPath);
    }
    if (fileAction === 'left') {
      const parent = path.dirname(expandTilde(dirPath));
      setDirPath(parent === '/' ? '/' : parent + '/');
    }
    onClearAction();
  }, [fileAction, suggestions, selectedIndex, dirPath, focusField, onClearAction]);

  const handleSave = () => {
    if (dirPath.trim() && fileName.trim()) {
      onSave(path.join(expandTilde(dirPath.trim()), fileName.trim()));
    }
  };

  return (
    <box 
      title={mode === 'export' ? 'Export Configuration' : 'Import Configuration'}
      position="absolute"
      top="25%"
      left="25%"
      width="50%"
      height={20}
      backgroundColor="black"
      borderStyle="double"
      borderColor="yellow"
      flexDirection="column"
      padding={1}
      zIndex={10}
    >
      <box flexDirection="column" marginY={1}>
        <box flexDirection="row" marginTop={1}>
          <box width={14}><text>Directory:</text></box>
          <box flexGrow={1}>
            <input 
              value={dirPath} 
              onInput={(e) => setDirPath(e)}
              onChange={(e) => setDirPath(e)}
              placeholder="/etc/"
              focused={focusField === 'dir'}
              onSubmit={() => setFocusField('file')}
            />
          </box>
        </box>
        {focusField === 'dir' && (
          <box flexDirection="row" marginTop={1} height={10} border={true} borderStyle="single">
            <box flexDirection="column" flexGrow={1} overflow="hidden">
              {suggestions.slice(scrollTop, scrollTop + 8).map((s, i) => {
                const actualIndex = i + scrollTop;
                return (
                  <text key={actualIndex}>{actualIndex === selectedIndex ? '> ' : '  '}{s}</text>
                );
              })}
              {suggestions.length === 0 && <text>  (No matches)</text>}
            </box>
            {suggestions.length > 8 && (
              <box flexDirection="column" width={1}>
                {Array.from({ length: 8 }).map((_, i) => {
                  const maxScroll = Math.max(1, suggestions.length - 8);
                  const thumbPosition = Math.round((scrollTop / maxScroll) * 7);
                  return <text key={i}>{i === thumbPosition ? '█' : '│'}</text>;
                })}
              </box>
            )}
          </box>
        )}

        <box flexDirection="row" marginTop={1}>
          <box width={14}><text>File Name:</text></box>
          <box flexGrow={1}>
            <input 
              value={fileName} 
              onInput={(e) => setFileName(e)}
              onChange={(e) => setFileName(e)}
              placeholder="domains.conf"
              focused={focusField === 'file'}
              onSubmit={handleSave}
            />
          </box>
        </box>
      </box>
      
      <box flexGrow={1} />
      <box border={['top']} borderStyle="single" paddingY={0}>
        <text>Up/Down: Select | Tab/Right: Open | Enter: {mode === 'export' ? 'Export' : 'Import'} | Esc: Cancel</text>
      </box>
    </box>
  );
}
