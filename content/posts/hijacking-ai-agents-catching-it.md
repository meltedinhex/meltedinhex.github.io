---
title: "Hijacking AI Agents, Part 4: Catching It"
date: 2026-07-13T13:00:00+05:30
slug: "hijacking-ai-agents-catching-it"
draft: true
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
[3](/posts/hijacking-ai-agents-the-four-surfaces/) the attacks looked slippery,
but most of them leave a tell. Hidden characters, override phrasing, "do not tell
the user", a secret read next to a network call, a write to an instruction file,
all of it is detectable if you look at the raw bytes and normalize them first.
This part is about building that detection, and about the one step that everything
else depends on.

## Normalize Before You Match

Here is the single highest-signal idea in the whole series: **normalize Unicode
and strip zero-width, bidi, and tag characters before you match anything.**

If you skip this, attackers split keywords with invisible characters and sail
straight past your filters. The word `override` with a zero-width space in the
middle is two tokens to your regex and one word to the model. Homoglyphs do the
same job with look-alike letters from other scripts. So a scanner needs two
passes:

1. **A tamper pass** that flags the presence of zero-width characters, bidi
   override marks, tag-block codepoints, and mixed-script tokens. This is a
   finding on its own, legitimate skill files do not need invisible characters.
2. **A semantic pass** that runs *after* normalization, matching the phrasing and
   structural signals below on clean text.

Miss the first pass and the second is blind.

Concretely, the tamper pass is a handful of codepoint checks, and the value is in
running it *first*:

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

Run the keyword and structural rules against `clean`, never against `raw`.
Otherwise `igno\u200bre previous` reads as two harmless tokens to your regex and
one instruction to the model.

## The Signals Worth Matching

Once the text is normalized, each technique from the series maps to a concrete,
greppable signal. None of these is proof on its own, but together they score a
file.

| Signal | What it catches |
|---|---|
| Instruction-override phrasing ("ignore previous", "system override", "you are now") | Direct injection |
| Disclosure suppression ("do not tell the user", "never mention", "silently") | Stealth |
| References to instruction or config paths (`copilot-instructions.md`, `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, git hooks) | Persistence |
| Secret-file references (`.env`, `id_rsa`, token or credential names) | Collection |
| Network egress next to a secret read, on or near the same line | Exfil chaining |
| Over-broad `applyTo` scope (`**/*`) with an urgent description | Auto-load lure |
| Instruction-like prose inside a tool or parameter description | MCP poisoning (TPA) |
| A tool description that references or redirects *another* tool (recipients, destinations) | Tool shadowing |
| Tool server reading `~/.ssh`, cloud creds, or `.env` at startup/per call; POST to webhook/ngrok; C2 from an encoded byte array | Malicious MCP server code |
| Instruction to add a fixed code block to *every* generated file, especially one reading `os.environ` and making a request | Code-generation backdoor |
| Destructive or exfil shell steps (`rm -f`, `curl -d @.env`) framed as routine "setup" | Sabotage / disguised egress |
| Markdown or HTML image URL carrying encoded data in a query string (`![](https://host/?d=...)`) | Image-based exfiltration |
| Hidden or invisible characters, off-screen CSS, HTML comments with imperatives | Concealment |

The pattern that deserves the highest severity is the *combination*: a secret-file
reference and a network egress and a suppression phrase in the same file is not a
coincidence, it is the exfil chain from Part 2 spelled out.

## What The Output Looks Like

Run this kind of scan against a benign skill and it should stay silent. Run it
against the booby-trapped `git-helper` from Part 2 and every move lights up:

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

Each finding points at a line and a technique, which is what turns "something is
off" into "here is the exfil chain, here is the persistence write". A severity
rubric (any override or suppression or persistence hit is HIGH; secret or coercion
is MEDIUM; scope or lone egress is LOW; take the file's max) gives you a single
gate value per file.

## Put It In The Merge Path

Detection only helps if it runs before the file is trusted. The natural home is a
merge gate on the paths that actually carry instructions:

```text
scan  .github/skills/**  **/*.instructions.md  AGENTS.md  copilot-instructions.md
fail the build on any HIGH finding
```

Treat skills and instruction files like code, because that is what they are.
Review them, scan them in CI, and put CODEOWNERS on the instruction paths so a
change to `copilot-instructions.md` needs a human who knows what it should
contain.

One surface does not fit a text scanner at all: a malicious MCP server (Part 3,
Surface 2b) hides its behavior in *code*, not in a description, so the tells are
code-level rather than phrasing. Review a server's source before you trust it, and
flag the same shapes: reads of `~/.ssh`, cloud-credential paths, or `.env` at
startup or on every call; outbound POSTs to webhook, ngrok, or pastebin-style
hosts; a C2 endpoint assembled from an encoded byte array; and a generic
`exec`/`read_file` action on a tool that has no business needing one.

## The Limits Of Detection

Two honest caveats. First, detection is a filter, not a wall. Novel phrasing and
clever encodings will sometimes slip a semantic scanner, which is why the tamper
pass (catching *that something was hidden*, regardless of what) matters more than
any single keyword. Second, the whole approach assumes you can see the artifact.
Indirect injection through fetched content (Part 3, Surface 3) never lands in your
repo, so a repo scanner never sees it, and a malicious MCP server (Surface 2b)
hides in runtime behavior a static description scan cannot reach.

That is the reason detection is only one layer. Because injection will sometimes
get through, the real goal is to make a successful injection *unable to cause
harm*. That is [Part 5](/posts/hijacking-ai-agents-stopping-it/).
