# ErrTraffic "Analytics" cluster — EtherHiding → ClickFix (July 2026 snapshot)

Detection coverage for the **ErrTraffic** ClickFix framework, specifically the Polygon
smart-contract Sekoia tracks as the **"Analytics" cluster**
(`0x08207B087F61d7e95E441E15fd6d40BEfd6eD308`). These artefacts are a **July 2026 snapshot**
of a fast-rotating operation — the on-chain contract and the behavioural chain are the
durable signals; the domains change roughly daily.

**Full analysis:** [Hiding in Plain Ledger](https://meltedinhex.com/posts/clickfix-errtraffic-blockchain-c2/)

Prior research this builds on: HudsonRock, LevelBlue/SpiderLabs (*ErrTraffic v3*), Sekoia
(*Unveiling ErrTraffic*), Censys, Monarx (`session-manager.php` WordPress backdoor).

## What's in this folder

| File | Detects | Notes |
|---|---|---|
| [`yara/errtraffic_analytics.yar`](./yara/errtraffic_analytics.yar) | Injected EtherHiding loader, fake-Cloudflare landing, the July Go stealer sample | Loader rule matches decoded content; run on unwrapped source/memory. |
| [`suricata/errtraffic_analytics.rules`](./suricata/errtraffic_analytics.rules) | Injected loader in HTML, `/api/?a=tds_cfg`, `/landing/windows.html`, `X-Captcha-Mode` header, known SNI | Tune `sid`s for your ruleset. |
| [`kql/errtraffic_analytics.kql`](./kql/errtraffic_analytics.kql) | Clipboard-PowerShell loader, UAC bypass, dead-drop, known infra | Microsoft Defender / Sentinel. |
| [`iocs/iocs.csv`](./iocs/iocs.csv) · [`iocs/iocs.json`](./iocs/iocs.json) | Contract, July delivery hosts, C2/exfil, sample hashes, host artefacts | Machine-readable, bucketed by role. |
| [`compromised-sites.md`](./compromised-sites.md) | Third-party **victim** sites seen serving the injected loader | For owner / CERT notification, **not** a C2 blocklist. Defanged; conditional inject means a clean fetch is inconclusive. |

## Detection guidance

Delivery hosts rotate on-chain, so a domain block ages out within a day. Anchor on the
**behaviour**:

1. An `eth_call` to a Polygon RPC from a page context, immediately followed by a request to
   a fresh short host serving `/api/?a=tds_cfg` or `/landing/windows.html`.
2. `powershell.exe` (hidden window) → `Invoke-WebRequest` → `%TEMP%\x.exe`, with
   `SEE_MASK_NOZONECHECKS=1` set in the same process tree.
3. `ComputerDefaults.exe` launched non-interactively (UAC bypass), then a Telegram profile
   fetched by a non-browser process (dead-drop resolver).

Site owners: hunt for the `session-manager.php` MU-plugin backdoor and the injected loader
markers (contract address + selector `38bcdc1c` + `eth_call` + Polygon RPC list).

**Caveat:** the injected loader is served conditionally, so a single clean fetch is
**inconclusive**, not proof the site is clean.
