import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import React, { useState, useEffect } from 'react';
import { loadSystemHosts, saveSystemHosts } from './lib/hosts';
import type { HostLine } from './lib/hosts';
import * as path from 'path';
import * as os from 'os';
import { flushDns } from './lib/dns';
import { exportToConf, importFromConf } from './lib/config';
import { checkForUpdate, performUpdate } from './lib/update';
import pkg from '../package.json';

const expandTilde = (p: string) => {
  if (p.startsWith('~/')) {
    return path.join(os.homedir(), p.slice(2));
  }
  return p;
};
import { DomainList } from './components/DomainList';
import { DomainInfo } from './components/DomainInfo';
import { DomainForm } from './components/DomainForm';
import { FileModal } from './components/FileModal';
import { TopNav } from './components/TopNav';

function App() {
  const [lines, setLines] = useState<HostLine[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [modalState, setModalState] = useState<'none' | 'add' | 'edit' | 'export' | 'import'>('none');
  const [formFocus, setFormFocus] = useState<'ip' | 'domain'>('ip');
  const [fileAction, setFileAction] = useState<'up' | 'down' | 'tab' | 'left' | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('Ready');
  const [updateAvailable, setUpdateAvailable] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  useEffect(() => {
    checkForUpdate(pkg.version).then((newVersion) => {
      if (newVersion) setUpdateAvailable(newVersion);
    });
  }, []);

  useEffect(() => {
    const loaded = loadSystemHosts();
    setLines(loaded);
  }, []);

  const entryLines = React.useMemo(() => lines.filter((l: HostLine) => l.type === 'entry'), [lines]);
  const selectedEntry = entryLines[selectedIndex];

  const handleSaveDomain = (ip: string, domain: string) => {
    if (modalState === 'add') {
      const newEntry: HostLine = {
        id: `entry-${crypto.randomUUID()}`,
        type: 'entry',
        raw: `${ip}\t${domain}`,
        ip,
        domains: [domain],
        isDirty: true,
      };
      setLines([...lines, newEntry]);
      // Select the newly added entry
      const newEntryLines = [...lines, newEntry].filter((l) => l.type === 'entry');
      setSelectedIndex(newEntryLines.length - 1);
    } else if (modalState === 'edit' && selectedEntry) {
      setLines(lines.map((l) => {
        if (l.id === selectedEntry.id) {
          return {
            ...l,
            ip,
            domains: [domain],
            raw: `${ip}\t${domain}`,
            isDirty: true,
          };
        }
        return l;
      }));
    }
    setModalState('none');
    setStatusMessage('Unsaved');
  };

  const handleRemoveSelected = () => {
    if (entryLines.length > 0 && selectedIndex >= 0 && selectedIndex < entryLines.length) {
      const toRemove = entryLines[selectedIndex];
      if (toRemove) {
        setLines(lines.filter((l: HostLine) => l.id !== toRemove.id));
        if (selectedIndex >= entryLines.length - 1 && selectedIndex > 0) {
          setSelectedIndex(selectedIndex - 1);
        }
        setStatusMessage('Unsaved');
      }
    }
  };

  const handleSaveToHosts = async () => {
    if (saveSystemHosts(lines)) {
      // Clear dirty flags
      setLines(lines.map(l => ({ ...l, isDirty: false })));
      setStatusMessage('Saved');
      
      const flushed = await flushDns();
      if (flushed) {
        setStatusMessage('Ready');
      } else {
        setStatusMessage('Ready (DNS Flush Failed)');
      }
    } else {
      setStatusMessage('Save Failed');
    }
  };

  const handleExportConf = (filePath: string) => {
    const absolutePath = path.resolve(expandTilde(filePath));
    if (exportToConf(lines, absolutePath)) {
      setStatusMessage(`Exported to ${absolutePath}`);
    } else {
      setStatusMessage(`Failed to export to ${absolutePath}`);
    }
    setModalState('none');
  };

  const handleImportConf = (filePath: string) => {
    const absolutePath = path.resolve(expandTilde(filePath));
    const imported = importFromConf(absolutePath);
    if (imported.length > 0) {
      // Mark imported entries as dirty since they are not in /etc/hosts yet
      const dirtyImported = imported.map(l => ({ ...l, isDirty: true }));
      setLines([...lines, ...dirtyImported]);
      setStatusMessage('Unsaved');
    } else {
      setStatusMessage(`Failed to import from ${absolutePath}`);
    }
    setModalState('none');
  };

  const handleAutoUpdate = async () => {
    setIsUpdating(true);
    setStatusMessage(`Updating to v${updateAvailable}... Please wait.`);
    const success = await performUpdate();
    if (success) {
      setStatusMessage('Update successful! Please quit and restart Laneway.');
      setUpdateAvailable(null);
    } else {
      setStatusMessage(`Update failed. Run 'npm install -g laneway@latest' manually.`);
    }
    setIsUpdating(false);
  };

  useEffect(() => {
    const handleGlobalKey = (key: any) => {
      // If modal is open, let modal components handle specific logic or handle Esc here.
      if (modalState !== 'none') {
        if (key.name === 'escape') {
          setModalState('none');
        }
        if (modalState === 'add' || modalState === 'edit') {
          if (key.name === 'up' || key.name === 'down') {
            setFormFocus(prev => prev === 'ip' ? 'domain' : 'ip');
          }
        }
        if (modalState === 'export' || modalState === 'import') {
          if (key.name === 'up') setFileAction('up');
          if (key.name === 'down') setFileAction('down');
          if (key.name === 'tab' || key.name === 'right') setFileAction('tab');
          if (key.name === 'left') setFileAction('left');
        }
        return;
      }

      // Main view shortcuts
      if (key.name === 'up' && selectedIndex > 0) {
        setSelectedIndex(selectedIndex - 1);
      }
      if (key.name === 'down') {
        if (selectedIndex < entryLines.length - 1) {
          setSelectedIndex(selectedIndex + 1);
        }
      }

      // Actions
      if (key.name === 'a') {
        setModalState('add');
        setFormFocus('ip');
      }
      if (key.name === 'e' && selectedEntry) {
        setModalState('edit');
        setFormFocus('ip');
      }
      if (key.name === 'd' || key.name === 'delete' || key.name === 'backspace') handleRemoveSelected();
      if (key.name === 's') handleSaveToHosts();
      if (key.name === 'x') setModalState('export');
      if (key.name === 'i') setModalState('import');
      if (key.name === 'u' && updateAvailable && !isUpdating) handleAutoUpdate();
      if (key.name === 'q') process.exit(0);
    };

    // Note: We need a way to listen to raw global key events in OpenTUI.
    // Assuming process.stdin is accessible for a quick raw listener if OpenTUI doesn't export global hooks easily.
    // Standard react-based TUI might do:
    const onData = (data: Buffer) => {
      const str = data.toString();
      // simplified key mapping
      let name = str.toLowerCase();
      if (str === '\u001b[A') name = 'up';
      if (str === '\u001b[B') name = 'down';
      if (str === '\u001b[C') name = 'right';
      if (str === '\u001b[D') name = 'left';
      if (str === '\u001b') name = 'escape';
      if (str === '\u007f' || str === '\b') name = 'backspace';
      if (str === 'u' || str === 'U') name = 'u';

      if (str === '\u0003') {
        process.exit(0); // Handle Ctrl+C globally
      }

      handleGlobalKey({ name });
    };

    const shouldListen = process.stdin.isTTY || process.env.LANEWAY_TEST_MODE;
    if (shouldListen) {
      if (typeof process.stdin.setRawMode === 'function') {
        process.stdin.setRawMode(true);
      }
      process.stdin.resume();
      process.stdin.on('data', onData);
    }

    return () => {
      if (shouldListen) {
        process.stdin.removeListener('data', onData);
      }
    };
  }, [selectedIndex, lines, modalState, entryLines, selectedEntry, updateAvailable, isUpdating]);

  let statusBarColor = 'gray';
  const lowerStatus = statusMessage.toLowerCase();
  if (statusMessage === 'Ready') statusBarColor = 'green';
  else if (statusMessage === 'Saved') statusBarColor = 'blue';
  else if (statusMessage === 'Unsaved') statusBarColor = 'gray';
  else if (lowerStatus.includes('fail') || lowerStatus.includes('error')) statusBarColor = 'red';
  else if (lowerStatus.includes('exported') || lowerStatus.includes('imported')) statusBarColor = 'green';

  return (
    <box flexDirection="column" width="100%" height="100%">
      <TopNav />
      
      <box flexGrow={1} flexDirection="row">
        <DomainList 
          entries={lines} 
          selectedIndex={selectedIndex} 
        />
        
        {modalState === 'add' || modalState === 'edit' ? (
          <DomainForm 
            initialData={modalState === 'edit' ? selectedEntry : undefined} 
            focusField={formFocus}
            onSave={handleSaveDomain}
            onCancel={() => setModalState('none')}
            onFocusChange={setFormFocus}
          />
        ) : (
          <DomainInfo entry={selectedEntry} />
        )}
      </box>

      {(modalState === 'export' || modalState === 'import') && (
        <FileModal 
          mode={modalState as 'export' | 'import'}
          fileAction={fileAction}
          onClearAction={() => setFileAction(null)}
          onSave={modalState === 'export' ? handleExportConf : handleImportConf}
          onClose={() => setModalState('none')}
        />
      )}
      <box width="100%" backgroundColor={statusBarColor as any} paddingX={1} justifyContent="space-between">
        <text>Status: {statusMessage}</text>
        {updateAvailable && !isUpdating && (
          <text color="yellow">Update available: v{updateAvailable} (Press 'U')</text>
        )}
      </box>
    </box>
  );
}

(async () => {
  const renderer = await createCliRenderer();
  createRoot(renderer).render(<App />);
})();
