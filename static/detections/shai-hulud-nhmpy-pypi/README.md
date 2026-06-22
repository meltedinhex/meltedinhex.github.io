# nhmpy — Shai-Hulud-class / Hades PyPI supply-chain worm

Detection coverage for the malicious PyPI package **`nhmpy` 2.4.7**, a NumPy typosquat that
drops a credential-stealing, self-propagating worm.

**Full analysis:** [Peeling the Sandworm: Reversing the nhmpy PyPI Supply-Chain Worm](https://meltedinhex.com/posts/shai-hulud-nhmpy-pypi/)

## TL;DR for defenders

- A `.pth` file auto-executes on **every Python start** (no `import` needed), fetches the
  **Bun** JS runtime from GitHub releases, and runs a 5.2 MB obfuscated `_index.js` via Bun (LOLbin).
- The payload harvests SCM/registry/cloud/AI-assistant/SSH/wallet/VPN secrets and
  **self-propagates** by committing a fake `.github/workflows/codeql.yml` into victim repos.
- **No attacker-owned C2.** Exfiltration and worming ride the victim's own stolen GitHub token
  and public services, so behavioural detection beats IOC blocklists here.

## What's in this folder

| File | Detects | Notes |
|---|---|---|
| [`yara/nhmpy_hades.yar`](./yara/nhmpy_hades.yar) | On-disk `.pth` dropper **and** decoded payload markers | Marker rule matches *decoded* content only — run on memory/unpacked strings, not raw `_index.js`. |
| [`sigma/python_spawns_bun.yml`](./sigma/python_spawns_bun.yml) | Python/pip/pytest spawning `bun` | Core execution chain; portable to any EDR via Sigma. |
| [`sigma/nhmpy_host_artifacts.yml`](./sigma/nhmpy_host_artifacts.yml) | Dropped `.pth`, Bun runtime, `.bun_ran` guard | File-creation telemetry. |
| [`kql/nhmpy_hades.kql`](./kql/nhmpy_hades.kql) | Process / file / network hunts | Microsoft Defender for Endpoint & Sentinel. |
| [`iocs/iocs.csv`](./iocs/iocs.csv) · [`iocs/iocs.json`](./iocs/iocs.json) | Hashes, files, markers, abused endpoints | Machine-readable, plain values. |

## Detection guidance

- Best signal is **process lineage**: `python`/`pip`/`pytest`/notebook kernel → `bun run …_index.js`.
- Hashes are **build-specific** — sibling packages use different bytes and a `__init__.py`
  import-hook variant. Prefer the behavioural + string indicators for fleet-wide hunting.
- Network indicators are **legitimate services abused** (GitHub, cloud metadata, registries),
  not dedicated C2 — alert on *context*, don't blanket-block.

## Caveats

Some capabilities in broader Hades reporting (Russian-locale bail-out, memory scraper,
revocation-triggered wipe) were **not fully recovered** in the analyzed sample — only string
hints (`ru`, `DontRevokeOrItGoesBoom`). Treat those as campaign-level leads.
