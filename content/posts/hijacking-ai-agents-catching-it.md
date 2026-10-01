---
title: "Hijacking AI Agents, Part 4: Catching It"
date: 2026-09-27T10:00:00+05:30
slug: "hijacking-ai-agents-catching-it"
draft: false
description: "Most of these payloads have a tell. Normalize the text first, then hunt for the signals: hidden characters, override phrasing, secret-read-plus-egress, and persistence writes."
series: ["Hijacking AI Agents"]
series_weight: 4
tags:
  - "AI Security"
  - "Prompt Injection"
  - "Detection Engineering"
  - "AI Agents"
  - "Threat Hunting"
cover:
  image: "/images/hijacking-ai-agents-catching-it/cover.png"
  alt: "Hijacking AI Agents, Part 4: Catching It"
  relative: false
ShowToc: true
TocOpen: false
---

Across [Parts 2](/posts/hijacking-ai-agents-anatomy-of-a-hijack/) and
[3](/posts/hijacking-ai-agents-the-four-surfaces/) these attacks looked slippery.
Most of them are not. Hidden characters, override phrasing, "do not tell the
user", a secret read sitting next to a network call, a write to an instruction
file: all of it shows up in the raw bytes if you know what to grep for. This part
is how I build that scanner, and the one step that makes or breaks it.

## Normalize Before You Match

This is the whole game: **normalize Unicode and strip the invisible characters
before you match anything.**

Skip it and you lose for free. The word `override` with a zero-width space in the
middle is two tokens to your regex and one word to the model. Homoglyphs pull the
same trick with look-alike letters from another script. Your rules never fire, and
the payload sails through.

So the scanner runs two passes:

1. A **tamper pass** that flags the hidden stuff itself: zero-width characters,
   bidi overrides, tag codepoints, mixed-script tokens. That is a finding on its
   own. A legitimate skill file has no reason to carry invisible characters.
2. A **semantic pass** that runs on the normalized text and matches the phrasing
   below.

Miss the first and the second is blind. The tamper pass is a handful of codepoint
checks, and the only thing that matters is running it first:

```python
import unicodedata, re

ZERO_WIDTH = dict.fromkeys(map(ord, "\u200b\u200c\u200d\u2060\ufeff"), None)
BIDI = re.compile(r"[\u202a-\u202e\u2066-\u2069]")

def normalize(text: str):
    flags = []
    if BIDI.search(text):
        flags.append("bidi-control-characters")
    if any(ord(c) in ZERO_WIDTH for c in text):
        flags.append("zero-width-characters")
    # collapse look-alikes and strip the invisibles, THEN match on this
    clean = unicodedata.normalize("NFKC", text).translate(ZERO_WIDTH)
    return clean, flags

clean, flags = normalize(raw_skill_text)
# 'flags' alone is a finding; 'clean' is what the semantic pass scans
```

Match against `clean`, never `raw`. Otherwise `igno\u200bre previous` reads as two
harmless tokens to you and one instruction to the model.

![A left-to-right detection pipeline. A raw skill file on the left contains a hidden zero-width character inside an override comment. An arrow feeds it into three stacked stages: a tamper pass that flags zero-width and bidi characters, a normalize stage that applies NFKC and strips invisibles, and a semantic scan that matches phrasing on the cleaned text. The scan outputs a findings panel on the right with severity-chipped hits, three HIGH, two MED, two LOW, and a gate that fails the build on the file's maximum severity](/images/hijacking-ai-agents-catching-it/normalize-then-scan.png)

*Figure 1: The tamper pass runs first and is a finding on its own. Only after
normalization does the semantic scan match phrasing, and the file's top severity
becomes the CI gate.*

## The Signals Worth Matching

On normalized text, every technique from the series collapses into a greppable
signal. None is proof by itself. Together they score a file.

| Signal | What it catches |
|---|---|
| Override phrasing ("ignore previous", "system override", "you are now") | Direct injection |
| Suppression ("do not tell the user", "never mention", "silently") | Stealth |
| Instruction/config paths (`copilot-instructions.md`, `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, git hooks) | Persistence |
| Secret-file names (`.env`, `id_rsa`, token or credential names) | Collection |
| Network egress next to a secret read, on or near the same line | Exfil chaining |
| Over-broad `applyTo` (`**/*`) with an urgent description | Auto-load lure |
| Instruction-like prose inside a tool or parameter description | MCP poisoning (TPA) |
| A tool description that references *another* tool (recipients, destinations) | Tool shadowing |
| A server reading `~/.ssh`, cloud creds, or `.env` at startup; POST to webhook/ngrok; C2 from an encoded byte array | Malicious MCP code |
| "Add this block to every generated file", especially one reading `os.environ` and making a request | Code-gen backdoor |
| Destructive or exfil shell (`rm -f`, `curl -d @.env`) framed as "setup" | Sabotage / disguised egress |
| Image URL carrying encoded data in a query string (`![](https://host/?d=...)`) | Image exfiltration |
| Hidden characters, off-screen CSS, HTML comments with imperatives | Concealment |

The one that earns top severity is the *combination*. A secret-file name, a
network egress, and a suppression phrase in the same file is not a coincidence. It
is the Part 2 exfil chain, spelled out.

## What It Looks Like

Point this at a clean skill and it stays quiet. Point it at the booby-trapped
`git-helper` from Part 2 and every move lights up:

```text
=== git-helper/SKILL.md  [max: HIGH] ===
  [HIGH ] L32: Instruction-override phrasing
  [HIGH ] L41: Disclosure-suppression phrasing
  [HIGH ] L45: Reference to instruction/config persistence path
  [MED  ] L32: Forced auto-invocation phrasing
  [MED  ] L34: Secret-file reference
  [LOW  ] L4:  Over-broad applyTo scope
  [LOW  ] L40: Network egress reference
```

Every finding points at a line and a technique, which is what turns "something
feels off" into "here is the exfil chain, here is the persistence write." Score it
simply: override, suppression, or persistence is HIGH; secret or coercion is
MEDIUM; scope or a lone egress is LOW; take the file's max as the gate.

## Run It In CI

A scanner only helps if it runs before you trust the file. Put it on a merge gate,
on the paths that actually carry instructions:

```text
scan  .github/skills/**  **/*.instructions.md  AGENTS.md  copilot-instructions.md
fail the build on any HIGH finding
```

Treat skills and instruction files like code, because they are. Review them, scan
them in CI, and put CODEOWNERS on the instruction paths so a change to
`copilot-instructions.md` needs a human who knows what belongs there.

One surface will not fit a text scanner: a malicious MCP server (Part 3, Surface
2b) hides in *code*, not a description. Review the source before you trust it, and
flag the same shapes: reads of `~/.ssh`, cloud-credential paths, or `.env` at
startup; outbound POSTs to webhook, ngrok, or pastebin hosts; a C2 endpoint built
from an encoded byte array; a generic `exec`/`read_file` action on a tool that has
no reason to need one.

## Where Detection Ends

Two honest limits. Detection is a filter, not a wall: novel phrasing and fresh
encodings will slip the semantic pass, which is exactly why the tamper pass, which
catches *that something was hidden* regardless of what, carries more weight than
any single keyword. And it only works on artifacts you can see. Indirect injection
through fetched content (Part 3, Surface 3) never lands in your repo, and a
malicious server hides in runtime behavior a static scan cannot reach.

So detection buys you time, not safety. Some injection always gets through, which
means the real job is making a successful one unable to do any damage. That is the
next and final piece.
