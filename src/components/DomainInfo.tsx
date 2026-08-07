import React from 'react';
import type { HostLine } from '../lib/hosts';

type DomainInfoProps = {
  entry: HostLine | undefined;
};

export function DomainInfo({ entry }: DomainInfoProps) {
  if (!entry) {
    return (
      <box flexDirection="column" padding={1} width={40} borderStyle="single" borderColor="gray">
        <text>No Domain Selected</text>
      </box>
    );
  }

  const isDirty = entry.isDirty;
  
  return (
    <box flexDirection="column" padding={1} width={40} borderStyle="single" borderColor="gray">
      <text>Domain Information {isDirty ? '(Unsaved)' : ''}</text>
      <text>--------------------------------</text>
      
      <box flexDirection="row" marginY={1}>
        <box width={10}><text>IP:</text></box>
        <text>{entry.ip || 'N/A'}</text>
      </box>

      <box flexDirection="row" marginY={1}>
        <box width={10}><text>Domains:</text></box>
        <box flexDirection="column">
          {entry.domains?.map((d, i) => (
            <text key={i}>{d}</text>
          ))}
        </box>
      </box>

      {entry.comment && (
        <box flexDirection="row" marginY={1}>
          <box width={10}><text>Comment:</text></box>
          <text>{entry.comment}</text>
        </box>
      )}

      <box flexGrow={1} />
    </box>
  );
}
