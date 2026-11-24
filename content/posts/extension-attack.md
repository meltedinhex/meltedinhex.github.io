---
title: "Extension ATT&CK: A Taxonomy for Browser Extension Threats"
date: 2026-11-24T22:30:00+05:30
slug: "extension-attack"
draft: false
description: "Extension ATT&CK organizes browser extension threats into 80 techniques, with public examples, browser API details, and detection ideas."
tags:
  - "Browser Security"
  - "Browser Extensions"
  - "Threat Hunting"
  - "Threat Intelligence"
  - "MITRE ATT&CK"
  - "Open Source"
cover:
  image: "/images/extension-attack/cover.png"
  alt: "Selected Extension ATT&CK techniques grouped by tactic."
  relative: false
ShowToc: true
TocOpen: false
---

A useful extension can become a delivery mechanism for malicious code after an
ownership change and update.

Malicious browser extensions use many of the same capabilities as legitimate
ones. Content scripts can read web pages, browser APIs can access cookies, and
background components can communicate with external servers. The difference is
how that access is used.

Recent campaigns show different forms of this abuse. Some extensions change
behavior after an ownership transfer or update. Others hide executable code,
redirect browser traffic, or alter shopping links. These differences matter
during analysis, but they can be lost when every finding is described simply
as a "malicious extension."

[Extension ATT&CK](https://github.com/meltedinhex/extension-attack) is an
open-source taxonomy for describing these behaviors. It contains **80
techniques across 10 tactics**, with browser-specific details, public research
references, and detection ideas.

[Browse the interactive matrix](/extension-attack/) or read the examples below.

## Why extension-specific techniques matter

MITRE ATT&CK already covers
[Browser Extensions under T1176.001](https://attack.mitre.org/techniques/T1176/001/).
Extension ATT&CK adds more detail within that area. It separates behaviors such
as cookie theft, delayed activation, hidden payload loading, and affiliate-link
modification into individual entries.

This makes findings easier to compare across campaigns. Two extensions may use
different domains and code, but still follow the same activation or collection
method. A shared technique name helps analysts record that similarity without
relying on a campaign name or a list of indicators.

The project uses its own `EXT-*` identifiers. These are not official MITRE
technique IDs. Where relevant, entries include references to MITRE ATT&CK.
The project is not affiliated with or endorsed by MITRE.

## How the matrix is organized

The ten tactics cover how an extension reaches the browser, runs code, maintains
access, gains broader permissions, avoids detection, steals credentials,
collects data, receives instructions, sends data out, and causes harm.

Each technique records:

- The behavior and its primary tactic.
- Relevant browsers, APIs, and permissions.
- Manifest or code patterns that may help during analysis.
- Public examples and detection ideas.

Browser support is recorded per entry because Chrome, Edge, Firefox, and Safari
do not expose identical APIs or apply the same restrictions.

The current release separates entries into two groups:

- **47 active techniques:** supported by public examples under the project's
  contribution policy.
- **33 proposed techniques:** included for further research and validation.

These labels describe the supporting evidence, not severity or detection
coverage. The build rejects an active entry with no example record, but
reviewers must still check that the cited research supports the behavior.

## Common behaviors in published research

The taxonomy groups behaviors rather than campaign names. The following
reports, published in 2026, show how these categories apply to real extensions.

### Installation and updates

[Secure Annex's QuickLens analysis](https://secureannex.com/blog/pixel-perfect/)
(February 23, 2026) documented a working Google Lens extension that received a
malicious update after changing ownership. The update added functionality to
retrieve and execute code supplied by a remote server.

This maps to [`EXT-INITACC-002`](/extension-attack/#EXT-INITACC-002), **Ownership-Transfer / Update Trojan**. It
describes a different entry path from publishing a malicious extension under a
new identity: the update reaches an existing user base.

### Execution and evasion

[The Microsoft Edge Extensions Security Team's StegoAd report](https://microsoftedge.github.io/edgevr/posts/Inside-StegoAd-How-We-Disrupted-a-Massive-Malicious-Extension-Campaign/)
(June 16, 2026) documented executable code hidden in image and font files.
Delayed activation, server checks, and analysis-tool detection helped conceal
the additional behavior.

Hidden code delivery maps to [`EXT-EXEC-006`](/extension-attack/#EXT-EXEC-006), **Steganographic Payload Loading**.
Checks for analysis tools are recorded separately under [`EXT-DEFEV-007`](/extension-attack/#EXT-DEFEV-007),
**Anti-Analysis / Sandbox & DevTools Detection**. Separating them helps explain
both where the payload is stored and why a test may not trigger it.

### Traffic interception and collection

[Socket's investigation of VPN and proxy extensions](https://socket.dev/blog/chrome-vpn-extension-impersonation)
(August 11, 2026) identified a campaign involving brand impersonation and
browser traffic routed through operator-controlled SOCKS5 proxies. The analyzed
extensions used `chrome.proxy.settings` to configure the routing.

This routing behavior maps to [`EXT-COLL-004`](/extension-attack/#EXT-COLL-004), **Proxy-Based Full-Traffic
Interception (AitM)**. A proxy can observe connection metadata and unencrypted
HTTP traffic; it does not by itself decrypt HTTPS. Proxy use alone is also not
proof of abuse, since legitimate VPN extensions use the same browser API.

### Monetization and impact

[The Microsoft Edge Extensions Security Team's SleeperWidget report](https://microsoftedge.github.io/edgevr/posts/SleeperWidget-How-Ad-Driven-Installs-Activate-Hidden-Browser-Extension-Behavior/)
(October 21, 2026) documented extensions that activated additional behavior
after installation through campaign advertising pages. Activated samples
reported browsing activity, opened ads, and modified shopping links.

The install-path condition maps to [`EXT-DEFEV-009`](/extension-attack/#EXT-DEFEV-009), **Install-Source (Ad-Gated)
Activation**. Affiliate-link changes map to [`EXT-IMPACT-002`](/extension-attack/#EXT-IMPACT-002), **Affiliate /
Cookie-Stuffing**. One describes the activation method; the other describes
the monetization behavior.

## Using the matrix during analysis

The [interactive matrix](/extension-attack/) is available directly on this site.
The viewer supports searches by technique ID, name, API, source, and
text. Selecting an entry opens its description, browser details, references,
and detection ideas.

![The site's Extension ATT&CK viewer with Steganographic Payload Loading open, showing browser APIs, code patterns, and the Microsoft StegoAd report.](/images/extension-attack/matrix-detail.png)

*Figure 1. The site's interactive viewer, showing the StegoAd example under Steganographic Payload Loading.*

Record a behavior, its supporting evidence, and the matching technique together.
For example, the published StegoAd findings can be recorded as:

| Observed behavior | Evidence described in the report | Technique |
| --- | --- | --- |
| Hidden payload loading | JavaScript extracted from image and font files, decoded, and executed | [`EXT-EXEC-006`](/extension-attack/#EXT-EXEC-006) |
| Analysis-tool detection | A DevTools check that suppressed the additional behavior | [`EXT-DEFEV-007`](/extension-attack/#EXT-DEFEV-007) |

In a sample review, attach the relevant code location, version comparison, or
network capture to each mapping. Keep installation conditions and data flows
separate from assumptions about the extension's intent.

Permissions and API names alone are not proof of abuse. A password manager may
need access to sign-in pages, and a screenshot tool may need tab capture. The
analysis must establish what the extension does with that access and whether
the behavior matches its stated purpose.

## Getting started

Clone the repository and build the local matrix:

```powershell
git clone https://github.com/meltedinhex/extension-attack.git
Set-Location .\extension-attack
python -m pip install -r .\tools\requirements.txt
python .\tools\build.py
Start-Process .\build\heatmap\index.html
```

The build also produces JSON and experimental STIX 2.0-style and
Navigator-format exports. Compatibility with STIX consumers and a custom
Navigator data source has not yet been verified. The default MITRE dataset
does not contain `EXT-*` IDs.

This release is a taxonomy, not a scanner or a detection-rule pack. Its
detection ideas need to be tested against the available telemetry before use.
Contributions can add public examples, correct browser-specific details, or
propose new techniques through the
[contribution guide](https://github.com/meltedinhex/extension-attack/blob/main/CONTRIBUTING.md).

The repository is available at
[github.com/meltedinhex/extension-attack](https://github.com/meltedinhex/extension-attack).
