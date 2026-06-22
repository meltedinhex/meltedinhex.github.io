# PolinRider — blockchain dead-drop npm loader (new `_V` variant)

Detection coverage for the malicious npm package **`tailwind-color-shades` 1.0.2**, an
import-triggered loader that resolves its payload from public blockchains (EtherHiding) before
fetching a version-gated stage from a live C2. Tracked publicly as **PolinRider** (DPRK / Lazarus).

**Full analysis:** [Dead Drops on the Blockchain: Reversing a DPRK npm Loader](https://meltedinhex.com/posts/polinrider-blockchain-dead-drop-npm/)

## TL;DR for defenders

- A **working** Tailwind utility hides a 3-layer obfuscated loader in `src/bootstrap.js`,
  triggered on **import** (`import './src/bootstrap'` in `index.ts`) — **no install hook**.
- The loader is a **blockchain dead-drop resolver**: TRON pointer (`api.trongrid.io`) → Aptos
  fallback (`fullnode.mainnet.aptoslabs.com`) → **BSC** transaction sent to the burn address
  (`bsc-dataseed.binance.org`) → `tx.input` → `split('?.?')` → XOR → `eval`.
- The decoded stages select a **live C2 by build marker** and fetch `GET /$/boot` with a
  custom **`Sec-V`** header for per-victim version gating, then XOR-decrypt + `eval` the response
  (= BeaverTail → InvisibleFerret, per external intel).
- This is the **new `global['_V']` variant** — published signatures keyed on the older
  `global['!']` / `rmcej%otb%` build will miss it.
- **Same actor, repeatable kit.** The publisher (`deepthought26`) ships a second npm package,
  **`safe-validate` 1.0.4** (published from repo `schema-checker`), confirmed same family after
  retrieving and reading its loader: a functional decoy (Funval clone), a flipped `"sideEffects"`
  flag that defeats tree-shaking, and a **decoy `import './lib/bootstrap.js'` (404)** that hides
  the real loader at `lib/schema/bootstrap.js` (pulled via `require("./schema/bootstrap")`). Same
  decoder algorithm and `global['_V']` slot, marker **`A6-Shadow-14`**. Its own on-chain
  dead-drop addresses/XOR keys are not yet decoded and may differ.

## What's in this folder

| File | Detects | Notes |
|---|---|---|
| [`yara/polinrider_blockchain_loader.yar`](./yara/polinrider_blockchain_loader.yar) | Decoded loader: marker slot, `/$/boot`, `Sec-V`, chain RPC + `?.?` | Matches *decoded* content — run on unwrapped source / memory, not raw `bootstrap.js`. |
| [`sigma/build_host_blockchain_rpc.yml`](./sigma/build_host_blockchain_rpc.yml) | Build/test process → TRON/Aptos/BSC RPC egress | Strongest behavioural signal. |
| [`sigma/polinrider_boot_c2.yml`](./sigma/polinrider_boot_c2.yml) | `/$/boot` fetch, `Sec-V` header, hard-coded C2 IPs | Campaign-specific network logic. |
| [`kql/polinrider.kql`](./kql/polinrider.kql) | Process / network hunts | Microsoft Defender for Endpoint & Sentinel. |
| [`iocs/iocs.csv`](./iocs/iocs.csv) · [`iocs/iocs.json`](./iocs/iocs.json) | C2, on-chain pointers, abused services, sample | Machine-readable, plain values, bucketed by role. |

## Detection guidance

- **Block / alert** on the attacker-owned C2 only: `166.88.54.158`, `198.105.127.210`,
  `23.27.202.27` (incl. `:27017`), the `/$/boot` path, and any `Sec-V` request header.
- **Do not blanket-block** the blockchain RPC endpoints — they're legitimate public services
  abused as transport. Alert on *context*: a `node`/`vite`/`next`/`jest` process talking to
  chain RPC from a build host is the anomaly.
- **Key on what doesn't rotate.** Decoder names (`NVu`, `dmO`, `_$_7b43`, …) and string literals
  change per build; the `global['_V']` marker slot, `/$/boot` and `Sec-V` are durable.
- **Audit the full require graph, not the entry file.** This actor uses a decoy `bootstrap` import
  that 404s and hides the real loader one directory deeper (e.g. `lib/schema/bootstrap.js` via
  `require("./schema/bootstrap")`). Resolving only the entry file's first `import` misses it.

## Caveats

- The final payload (**BeaverTail → InvisibleFerret**) is **High confidence via external
  corroboration**, not recovered from this artifact — Stage C (`/$/boot` response) requires a
  live request to the attacker C2 and was not retrieved in an isolated lab.
- Attribution (PolinRider / DPRK / Lazarus) is carried from public reporting; the on-chain
  resolver, both stages and the live C2 set were verified directly from the sample.
