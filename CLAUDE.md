# Principle

In Plan Mode or before starting programming, use "skills:grill-me" to clarify the user's needs, and then proceed with programming following the "skills:karpathy-guidelines" principles

# Project Structure

This is the Claude Code source code — a terminal-based chat UI for interacting with Claude AI models, built with **Bun + TypeScript + Ink (React for CLI)**.

## Build & Run

```bash
npm run build    # builds ./cli executable
```

## Architecture Overview

### UI Layer (Ink/React)

- **`src/screens/REPL.tsx`** — Main screen, coordinates streaming, message rendering, and footer
- **`src/components/PromptInput/PromptInputFooter.tsx`** — Bottom status bar assembly
- **`src/components/EffortIndicator.tsx`** — Shows `● model|effort` and optional context health bar + token speed
- **`src/components/StatusLine.tsx`** — User-configurable custom status line (via `/statusline` command)

### Streaming Pipeline

1. **`src/services/api/claude.ts`** — Raw API streaming generator, yields `StreamEvent`
2. **`src/QueryEngine.ts`** — Processes stream events, coordinates tool use
3. **`src/utils/messages.ts`** — `handleMessageFromStream()` dispatches stream events to UI callbacks
4. **`src/query.ts`** — `query()` async generator wrapping the full query lifecycle

### State & Data Flow

- **`src/state/AppStateStore.ts`** — Global reactive state (model, effort, etc.)
- **`src/bootstrap/state.ts`** — Core session state module (cost counters, token counters, session ID)
- **`src/cost-tracker.ts`** — Cost/usage tracking utilities, persists session costs to project config
- **`src/utils/tokenSpeed.ts`** — Module-level token speed getter/setter (t/s)

### Footer Components (bottom status bar)

- Left side: mode indicator, hints, background tasks, vim mode
- Right side: Notifications, EffortIndicator, BridgeStatusIndicator
- `contextHealth` computed from `tokenCountFromLastAPIResponse(messages)` + `getContextWindowForModel()`
- Display: `15t/s ● deepseek-v4-flash|high|████████░░100%`

### Token & Context Utilities

- **`src/utils/tokens.ts`** — Extract usage from messages, estimate token counts
- **`src/utils/context.ts`** — Context window size calculation, percentage calculations
- **`src/utils/effort.ts`** — Effort level resolution (env > state > model default > 'high')

### Key Patterns

- Module-level getter/setter for cross-cutting metrics (cost, token speed)
- `useMemo` to recompute derived state when `messages` array changes
- Stream events flow through generator pipeline: `claude.ts` → `query.ts` → `REPL.tsx`
- `useMainLoopModel` hook to reactively read current model from AppState
