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
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    try {
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
        const processed = files.map(f => {
          try {
            const stat = fs.statSync(path.join(searchDir, f));
            return stat.isDirectory() ? f + '/' : f;
          } catch {
            return f;
          }
        });
        
        let matches = processed;
        if (searchPrefix) {
          matches = processed.filter(f => f.toLowerCase().startsWith(searchPrefix.toLowerCase()));
        }
        
        setSuggestions(matches.slice(0, 5));
        setSelectedIndex(0);
      } else {
        setSuggestions([]);
        setSelectedIndex(0);
      }
    } catch {
      setSuggestions([]);
      setSelectedIndex(0);
    }
  }, [dirPath]);

  useEffect(() => {
    if (!fileAction) return;

    if (fileAction === 'down') {
      setSelectedIndex(s => Math.min(suggestions.length - 1, s + 1));
    }
    if (fileAction === 'up') {
      setSelectedIndex(s => Math.max(0, s - 1));
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
      
      try {
        const expanded = expandTilde(targetPath);
        const absolute = path.resolve(expanded);
        if (fs.statSync(absolute).isDirectory()) {
          targetPath += '/';
        }
      } catch (e) {}
      
      setDirPath(targetPath);
    }
    if (fileAction === 'left') {
      const parent = path.dirname(expandTilde(dirPath));
      setDirPath(parent === '/' ? '/' : parent + '/');
    }
    if (fileAction === 'up' && focusField === 'file') {
      setFocusField('dir');
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
      <text>{mode === 'export' ? 'Export Configuration' : 'Import Configuration'}</text>
      <text>--------------------------------</text>
      
      <box flexDirection="column" marginY={1}>
        <box flexDirection="row" marginTop={1}>
          <box width={14}><text>Directory:</text></box>
          <box flexGrow={1}>
            <input 
              value={dirPath} 
              onChange={(e) => setDirPath(e)} 
              placeholder="/etc/"
              focused={focusField === 'dir'}
              onSubmit={() => setFocusField('file')}
            />
          </box>
        </box>
        <box flexDirection="row" marginTop={1}>
          <box width={14}><text>File Name:</text></box>
          <box flexGrow={1}>
            <input 
              value={fileName} 
              onChange={(e) => setFileName(e)} 
              placeholder="domains.conf"
              focused={focusField === 'file'}
              onSubmit={handleSave}
            />
          </box>
        </box>
        
        <box flexDirection="column" marginTop={1}>
          {suggestions.map((s, i) => {
            let isDir = false;
            try {
              let base = process.cwd();
              if (dirPath.includes('/')) {
                base = path.dirname(expandTilde(dirPath));
                if (dirPath.endsWith('/')) {
                  base = expandTilde(dirPath);
                }
              }
              const fullPath = path.resolve(base, s);
              isDir = fs.statSync(fullPath).isDirectory();
            } catch (e) {}
            return <text key={s}>{i === selectedIndex ? '> ' : '  '}{s}{isDir ? '/' : ''}</text>;
          })}
          {suggestions.length === 0 && <text>  (No matches)</text>}
        </box>
      </box>
      
      <box flexGrow={1} />
      <text>Enter: {mode === 'export' ? 'Export' : 'Import'} | Tab: Autocomplete | Esc: Cancel</text>
    </box>
  );
}
