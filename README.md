[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/DanKE123abc/RikkaSama)

## Requirements

- [Bun](https://bun.sh) >= 1.3.11

```bash
# Install Bun if you don't have it
curl -fsSL https://bun.sh/install | bash
```

---

## Build

```bash
# Clone the repo
git clone https://github.com/win4r/free-code.git
cd free-code

# Install dependencies
bun install

# Standard build -- produces ./cli
bun run build

# Dev build -- dev version stamp, experimental GrowthBook key
bun run build:dev

# Dev build with ALL experimental features enabled -- produces ./cli-dev
bun run build:dev:full

# Compiled build (alternative output path) -- produces ./dist/cli
bun run compile
```

## Project structure

```
scripts/
  build.ts              # Build script with feature flag system

src/
  entrypoints/cli.tsx   # CLI entrypoint
  commands.ts           # Command registry (slash commands)
  tools.ts              # Tool registry (agent tools)
  QueryEngine.ts        # LLM query engine
  screens/REPL.tsx      # Main interactive UI

  commands/             # /slash command implementations
  tools/                # Agent tool implementations (Bash, Read, Edit, etc.)
  components/           # Ink/React terminal UI components
  hooks/                # React hooks
  services/             # API client, MCP, OAuth, analytics
  state/                # App state store
  utils/                # Utilities
  skills/               # Skill system
  plugins/              # Plugin system
  bridge/               # IDE bridge
  voice/                # Voice input
  tasks/                # Background task management
```

---

## Tech stack

|                   |                                                    |
| ----------------- | -------------------------------------------------- |
| Runtime           | [Bun](https://bun.sh)                              |
| Language          | TypeScript                                         |
| Terminal UI       | React + [Ink](https://github.com/vadimdemedes/ink) |
| CLI parsing       | [Commander.js](https://github.com/tj/commander.js) |
| Schema validation | Zod v4                                             |
| Code search       | ripgrep (bundled)                                  |
| Protocols         | MCP, LSP                                           |
| API               | Anthropic Messages API                             |
