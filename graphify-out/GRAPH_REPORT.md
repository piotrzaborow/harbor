# Graph Report - .  (2026-08-07)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 107 nodes · 136 edges · 13 communities (10 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7016b47f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- index.tsx
- compilerOptions
- package.json
- scripts
- dependencies
- scratch.ts
- test_filter.ts
- FileModal.tsx
- ActionPanel.tsx
- flushDns
- test.ts

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 20 edges
2. `scripts` - 12 edges
3. `HostLine` - 8 edges
4. `App()` - 7 edges
5. `loadSystemHosts()` - 5 edges
6. `saveSystemHosts()` - 5 edges
7. `exportToConf()` - 4 edges
8. `importFromConf()` - 4 edges
9. `flushDns()` - 4 edges
10. `FileModal()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `App()` --calls--> `flushDns()`  [EXTRACTED]
  src/index.tsx → src/lib/dns.ts
- `App()` --calls--> `exportToConf()`  [EXTRACTED]
  src/index.tsx → src/lib/config.ts
- `App()` --calls--> `importFromConf()`  [EXTRACTED]
  src/index.tsx → src/lib/config.ts
- `App()` --calls--> `loadSystemHosts()`  [EXTRACTED]
  src/index.tsx → src/lib/hosts.ts
- `App()` --calls--> `saveSystemHosts()`  [EXTRACTED]
  src/index.tsx → src/lib/hosts.ts

## Import Cycles
- None detected.

## Communities (13 total, 3 thin omitted)

### Community 0 - "index.tsx"
Cohesion: 0.18
Nodes (17): DomainForm(), DomainFormProps, DomainInfo(), DomainInfoProps, DomainList(), DomainListProps, TopNav(), App() (+9 more)

### Community 1 - "compilerOptions"
Cohesion: 0.09
Nodes (21): ESNext, compilerOptions, allowImportingTsExtensions, allowJs, jsx, jsxImportSource, lib, module (+13 more)

### Community 2 - "package.json"
Cohesion: 0.15
Nodes (12): devDependencies, @types/bun, @types/react, module, name, peerDependencies, typescript, private (+4 more)

### Community 3 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, build:mac:arm, build:mac:x64, build:ubuntu:arm, build:ubuntu:x64, build:windows:arm, build:windows:x64 (+4 more)

### Community 4 - "dependencies"
Cohesion: 0.22
Nodes (9): fast-xml-parser, @opentui/core, @opentui/react, dependencies, fast-xml-parser, @opentui/core, @opentui/react, react (+1 more)

### Community 5 - "scratch.ts"
Cohesion: 0.40
Nodes (3): expandedPath, isAbs, searchDir

### Community 6 - "test_filter.ts"
Cohesion: 0.40
Nodes (4): files, isAbs, processed, searchDir

### Community 7 - "FileModal.tsx"
Cohesion: 0.67
Nodes (3): expandTilde(), FileModal(), FileModalProps

## Knowledge Gaps
- **54 isolated node(s):** `name`, `module`, `type`, `private`, `start` (+49 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `scripts` connect `scripts` to `package.json`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **What connects `name`, `module`, `type` to the rest of the system?**
  _54 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._