import React, { useState, useEffect } from 'react';
import type { HostLine } from '../lib/hosts';

type DomainFormProps = {
  initialData?: HostLine;
  focusField: 'ip' | 'domain';
  onSave: (ip: string, domain: string) => void;
  onCancel: () => void;
  onFocusChange: (field: 'ip' | 'domain') => void;
};

export function DomainForm({ initialData, focusField, onSave, onCancel, onFocusChange }: DomainFormProps) {
  // Re-initialize state when initialData changes (e.g. selecting different items to edit)
  const [ip, setIp] = useState(initialData?.ip || '127.0.0.1');
  const [domain, setDomain] = useState(initialData?.domains?.join(' ') || '');

  useEffect(() => {
    setIp(initialData?.ip || '127.0.0.1');
    setDomain(initialData?.domains?.join(' ') || '');
  }, [initialData]);

  const handleSave = () => {
    if (ip.trim() && domain.trim()) {
      onSave(ip.trim(), domain.trim());
    }
  };

  return (
    <box 
      flexDirection="column"
      padding={1}
      width={40}
      borderStyle="single"
      borderColor="green"
    >
      <text>{initialData ? 'Edit Domain' : 'Add New Domain'}</text>
      <text>--------------------------------</text>
      
      <box flexDirection="row" marginY={1}>
        <box width={10}><text>IP:</text></box>
        <box flexGrow={1}>
          <input 
            value={ip} 
            onChange={(e) => setIp(e)} 
            placeholder="127.0.0.1"
            focused={focusField === 'ip'}
            onSubmit={() => onFocusChange('domain')}
          />
        </box>
      </box>
      <box flexDirection="row" marginY={1}>
        <box width={10}><text>Domain:</text></box>
        <box flexGrow={1}>
          <input 
            value={domain} 
            onChange={(e) => setDomain(e)} 
            placeholder="example.local" 
            focused={focusField === 'domain'}
            onSubmit={handleSave}
          />
        </box>
      </box>
      
      <box flexGrow={1} />
      <text>Enter: Save | Esc: Cancel</text>
    </box>
  );
}
