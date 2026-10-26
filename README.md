# claude-cli-contract

A pure classifier for `claude -p` runs: it reads what the CLI printed and says **how the run ended** (normal reply, model not available, not signed in, failed resume, context too long, other API error, crash). It also checks the Claude Code version against a tested range and provides user-facing copy for each outcome.

It does no I/O: no spawning, no logging, no throwing. Claude Hub and Gaffer both vendor it. Model discovery lives in a separate repo, [claude-model-catalog](https://github.com/spendolas/claude-model-catalog); the two do not depend on each other.

The source is CommonJS (`.cjs`) so Claude Hub (Node 20.14) can `require` it. Gaffer (ESM, Node 20 or later) imports `index.mjs`, which re-exports the same objects. There are no runtime dependencies.

## API

```js
const c = require('claude-cli-contract');                 // CommonJS
import { newTurnState, observe, classify } from 'claude-cli-contract'; // ESM
```

| Export | Signature | What it does |
| --- | --- | --- |
| `newTurnState` | `(resuming) → state` | State for one stream-json turn: `{ resuming, sawInit, sawResult, cliVersion, result, assistantError, assistantApiError, mcpServers: {name: status}, unknownTypes }`. |
| `observe` | `(state, event)` | Feed each parsed stdout event. It never throws. |
| `classify` | `(state, exitCode, stderr) → verdict` | Call at process close. |
| `classifyJsonResult` | `(result, { resuming?, exitCode? = 0, stderr? }?) → verdict` | Use this for `--output-format json` runs, which print a single result object. |
| `versionDetail` | `(version, { lastVerified?, patchTolerance? }?) → { status, aboveMax, shown }` | |
| `versionStatus` | `(version, opts?) → 'ok' \| 'newer' \| 'older' \| 'unknown'` | |
| `versionNotice` | `(version, { lastVerified?, patchTolerance?, product? = 'This app' }?) → string \| null` | Direction-aware copy for an out-of-range CLI. |
| `defaultCopy` | `({ product? = 'Claude', settingsPlace? = 'settings' }?) → { [kind]: string }` | Generic per-kind copy. |
| `userMessage` | `(verdict, copy?) → string` | `copy` overrides any subset of kinds, as a string or as `verdict => string`. |
| `LAST_VERIFIED` | `{ min: '2.1.236', max: '2.1.293' }` | The default verified range, matching the fixtures. |
| `NEWER_PATCH_TOLERANCE` | `30` | The default number of patch releases above `max` that still count as `ok`. |
| `UNRECOGNIZED_MODEL_TAG` | `'[claude-code:unrecognized_model]'` | The stderr tag the CLI prints for a model it cannot resolve. |

A verdict is `{ kind, via, ... }`.

- `kind` is one of `ok`, `stale_session`, `too_long`, `auth`, `model`, `api_error` or `unknown_error`.
- `via` is `structure`, `text` or `none`.
- `api_error` adds `{ status, reason, text }`. `unknown_error` adds `{ text }`. `ok` adds `exitCode` when the process did not exit 0.

Structured signals win: `terminal_reason`, `assistant.error`, the resume shape and the stderr model tag. The CLI's text is consulted only on a turn that already failed, so a successful reply can never be classified by its wording.


## Vendoring

Consumers never import this repo directly. Each keeps a byte-identical copy in `vendor/claude-cli-contract`.

1. Edit here, then run `npm test`, then commit.
2. In each consumer, run its vendor sync script (Claude Hub: `npm run sync-vendor`). That runs `node <this repo>/scripts/vendor.mjs <consumer>/vendor/claude-cli-contract`, which copies `index.cjs`, `index.mjs`, `cli-contract.cjs`, `LICENSE` and `package.json`, and writes `VENDORED_FROM.json` (`{ name, version, commit, dirty?, vendoredAt }`). A dirty tree is stamped `"commit": "uncommitted", "dirty": true`. The script refuses a target inside this repo.
3. Each consumer has a drift test that runs `node <this repo>/scripts/check-vendored.mjs <its vendor dir>`. It exits 0 when every file matches this repo's working copy, otherwise it lists the differing files and exits 1. The test skips when this repo is not on disk.

## Provenance

`cli-contract.cjs` is Gaffer's `panel/daemon/cli-contract.js`, generalised so nothing Gaffer-specific is built in: a generic `mcpServers` map, stderr-tag and failed-turn text model detection, `classifyJsonResult`, parameterised version checks and overridable copy. It was first published inside claude-model-catalog 0.1.0 and split out on 2026-10-26 so that repo only fetches models. `test/fixtures/cli/` holds Gaffer's scrubbed captures (CLI 2.1.236, 2.1.289, 2.1.293), unchanged.

## Tests

```sh
npm test
```
