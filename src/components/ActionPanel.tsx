import React, { useState } from 'react';

type ActionPanelProps = {
  onAddDomain: (ip: string, domain: string) => void;
  onRemoveSelected: () => void;
  onSaveToHosts: () => void;
  onExportConf: () => void;
  onImportConf: () => void;
};

export function ActionPanel({
  onAddDomain,
  onRemoveSelected,
  onSaveToHosts,
  onExportConf,
  onImportConf,
}: ActionPanelProps) {
  const [ip, setIp] = useState('127.0.0.1');
  const [domain, setDomain] = useState('');
  const [status, setStatus] = useState('Ready');

  const handleAdd = () => {
    if (ip.trim() && domain.trim()) {
      onAddDomain(ip.trim(), domain.trim());
      setDomain('');
      setStatus(`Added ${domain.trim()}`);
    }
  };

  return (
    <box flexDirection="column" padding={1} width={40} borderStyle="single" borderColor="gray">
      <text>Action Panel</text>
      <text>--------------------------------</text>
      
      <box flexDirection="column" marginY={1}>
        <text>Add New Domain</text>
        <box flexDirection="row" marginTop={1}>
          <box width={10}><text>IP:</text></box>
          <input 
            value={ip} 
            onChange={(e) => setIp(e)} 
            placeholder="127.0.0.1"
          />
        </box>
        <box flexDirection="row" marginTop={1}>
          <box width={10}><text>Domain:</text></box>
          <input 
            value={domain} 
            onChange={(e) => setDomain(e)} 
            placeholder="example.local" 
            onSubmit={handleAdd}
          />
        </box>
      </box>

      <box flexDirection="column" marginY={1}>
        <text>Shortcuts</text>
        <text>Enter: Add Domain (when focused)</text>
        <text>Del  : Remove Selected</text>
        <text>S    : Save to /etc/hosts</text>
        <text>E    : Export to domains.conf</text>
        <text>I    : Import from domains.conf</text>
      </box>

      <box flexGrow={1} />
      
      <box borderStyle="single" borderColor="blue" paddingX={1}>
        <text>Status: {status}</text>
      </box>
    </box>
  );
}
