import React from 'react';
import type { HostLine } from '../lib/hosts';

type DomainListProps = {
  entries: HostLine[];
  selectedIndex: number;
};

export function DomainList({ entries, selectedIndex }: DomainListProps) {
  // Only show entry types for management
  const domainEntries = entries.filter((e: HostLine) => e.type === 'entry');

  return (
    <box flexDirection="column" paddingLeft={1} flexGrow={1} height="100%">
      <text>Managed Domains ({domainEntries.length})</text>
      <text>--------------------------------</text>
      <scrollbox flexGrow={1} flexDirection="column">
        {domainEntries.map((entry, index) => {
          const isSelected = index === selectedIndex;
          const bg = isSelected ? 'blue' : 'transparent';
          const domainsStr = entry.domains?.join(', ') || '';
          const dirtyMarker = entry.isDirty ? '*' : ' ';

          return (
            <box key={entry.id} flexDirection="row" backgroundColor={bg} paddingX={1}>
              <box width={32} flexShrink={0}>
                <text>{isSelected ? `> ` : `  `}{dirtyMarker} {entry.ip}</text>
              </box>
              <box width={32} overflow="hidden">
                <text wrapMode="none" truncate={true}>{domainsStr}</text>
              </box>
            </box>
          );
        })}
      </scrollbox>
    </box>
  );
}
