---
title: "Hijacking AI Agents, Part 5: Stopping It"
date: 2026-07-13T14:00:00+05:30
slug: "hijacking-ai-agents-stopping-it"
draft: true
description: "Detection is one layer. Because injection will sometimes get through, the real goal is to make a successful injection unable to cause harm. Five layers of defense in depth."
series: ["Hijacking AI Agents"]
series_weight: 5
tags:
  - "AI Security"
  - "Prompt Injection"
  - "AI Agents"
  - "Defense in Depth"
  - "MCP Security"
cover:
  image: "/images/hijacking-ai-agents-stopping-it/cover.png"
  alt: "Hijacking AI Agents, Part 5: Stopping It"
  relative: false
ShowToc: true
TocOpen: false
---

[Part 4](/posts/hijacking-ai-agents-catching-it/) built detection for the tells,
and closed on its own limitation: detection is a filter, not a wall, and some
injection will get through. So the real objective is not to block every injection.
It is to make a successful one *harmless*. This final part lays out the layers
that do that, mapped back to the techniques from the rest of the series.

## Start From The Right Goal

[Part 1](/posts/hijacking-ai-agents-the-trust-bug/) framed this as a confused
deputy, and the confused deputy is never fixed by asking the deputy to be more
careful. It is fixed by changing what the deputy is allowed to do and putting
checks around the rest. Everything below is a version of that. Assume the
injection lands. Now make sure it cannot read your secrets, reach the network,
rewrite your instructions, or do any of it silently.

There is a useful way to see why this works, and the field has a name for it: the
**lethal trifecta**, coined by Simon Willison. A prompt injection can only cause
real damage when three things are true at once: the agent has access to **private
data**, it is exposed to **untrusted content**, and it has a way to **exfiltrate**
what it reads. Take away any one leg and the attack collapses. You usually cannot
remove untrusted content (reading the world is the whole job) and you often need
private data access, so the leg you can most reliably cut is exfiltration. Most of
the layers below are really about breaking one or more legs of that trifecta.

## Layer 1: Provenance

Know what you are loading and prove it has not changed.

- Sign and version-pin skills and MCP servers.
- Do not fetch tool definitions or skill bodies from a remote URL at runtime;
  resolve them at install time and pin a hash.

This kills the rug-pull and mutable-definition problem from Part 3: if time of
check equals time of use, a server cannot serve you a clean definition for review
and a dirty one at runtime. Provenance is also your first defense against a
malicious MCP server (Part 3, Surface 2b): pin the server to a reviewed version
and read its source before you trust it, rather than installing whatever a
marketplace serves today.

## Layer 2: Sanitize Ingestion

Treat everything that enters the context as data until proven otherwise.

- Unicode-normalize and strip hidden text before anything reads it, the same
  tamper pass from Part 4, applied at ingestion rather than just in CI.
- Treat tool and schema descriptions, and any fetched content, as *data, not
  orders*. Keep untrusted output out of the instruction channel.

This is the direct structural fix for the trust bug: it stops low-trust text from
speaking in the imperative voice, and it is the only real answer to indirect
injection, which never touches your repo.

## Layer 3: Least Privilege

Give each capability only to the tasks that need it.

- A git helper gets no network access and no `.env` read. Full stop.
- Deny by default and allowlist egress, so a coerced fetch has nowhere to go
  except a destination you approved.

Least privilege is what turns the Part 2 exfil chain into a dead end. The payload
can still *say* "read `.env` and beacon it out", but a git skill with no secret
read and no network simply cannot comply. It is also the backstop for a malicious
MCP server: a tool process that is denied read access to `~/.ssh` and cloud
credentials, and allowed to reach only approved hosts, cannot exfiltrate them on
startup no matter what its code tries to do.

One honest caveat on egress allow-lists, because the last year has been unkind to
them. Attackers keep finding legitimate destinations already on the list. Real
examples: an allow-list that included the vendor's own API domain, which the
attacker reached using their own account; a default list that shipped with a
public request-logging service on it; and the markdown-image trick from Part 3,
which exfiltrates through whatever image host the client will render. Allow-lists
are worth having, but treat them as one leaky leg of the trifecta, not a wall. The
more reliable cut is denying the private-data access in the first place.

## Layer 4: Protect The Instruction Files

The instruction channel is the trust root, so guard writes to it.

- Writes to `*.instructions.md`, `AGENTS.md`, `copilot-instructions.md`, git
  hooks, and editor settings require explicit human approval.
- Put CODEOWNERS on those paths.

This is what stops persistence. An injection that cannot silently rewrite your
instruction files cannot re-arm itself for the next session, which collapses a
durable compromise back into a one-shot attempt.

## Layer 5: Human In The Loop, And Always Disclose

Some actions are irreversible or sensitive enough to deserve a human.

- Confirm secret reads, network egress, and protected-path writes with the user.
- Never let context tell the agent to stay silent. Disclosure is not optional, and
  "do not tell the user" is itself a signal to surface, not obey.

This is the counter to the suppression technique. The entire git-helper attack
depended on the agent saying nothing. Remove the silence and the attack announces
itself.

## The Coverage Idea

None of these layers is complete alone, and that is the point. The way to reason
about it is a coverage map: for each technique in the series, which layer stops
it. Injection phrasing is caught by sanitization and detection. Secret exfil is
stopped by least privilege. Rug pulls are stopped by provenance. Persistence is
stopped by protected instruction files and human approval. Suppression is stopped
by mandatory disclosure. When every technique is covered by at least one control
that does not depend on the model's judgment, a single failure stops being a
breach.

That phrase, "does not depend on the model's judgment," is the whole game. It is
worth separating two kinds of control. A **deterministic** one lives outside the
model: an OS sandbox that denies a file read, a network policy that blocks a host,
a CODEOWNERS gate on an instruction file. It behaves the same every time and
cannot be talked out of it. An **AI guardrail**, by contrast, asks another model
to judge whether an action is safe, and a second model reading the same poisoned
context is a second thing that can be fooled. These classifier-based defenses are
useful as an extra layer, but they are probabilistic, not a boundary. When you
have a choice, put the load-bearing controls on the deterministic side.

## Takeaways

- **Treat skills and instruction files like code.** Review them, scan them in CI,
  and apply CODEOWNERS to instruction paths.
- **Rendered is not ingested.** Always check the raw bytes; hidden text and
  zero-width tricks are invisible by design.
- **The model is not your trust boundary.** Enforce trust around it: provenance,
  sanitization, least privilege, and human approval for irreversible actions.
- **Assume indirect injection.** Anything your agent reads can try to give it
  orders, including content that never lands in your repo.

The convenience of agentic assistants comes from how eagerly they read and act on
context. That same eagerness is the attack surface. You do not fix it by trusting
the model to know better. You fix it the way we fix every confused-deputy problem:
provenance, isolation, least privilege, and oversight.

That closes the series. If you are arriving here first, [Part
1](/posts/hijacking-ai-agents-the-trust-bug/) starts with the single flaw that all
of this builds on.

## Further Reading

- **Simon Willison**, "The Lethal Trifecta for AI agents": [simonwillison.net](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/), and his ongoing [prompt-injection archive](https://simonwillison.net/tags/prompt-injection/).
- **Invariant Labs**, "MCP Security Notification: Tool Poisoning Attacks": [invariantlabs.ai](https://invariantlabs.ai/blog/mcp-security-notification-tool-poisoning-attacks).
- **OWASP**, "Top 10 for LLM Applications (2025)", LLM01 Prompt Injection and LLM03 Supply Chain: [genai.owasp.org](https://genai.owasp.org/llm-top-10/).
- **MITRE ATT&CK** analogues used throughout: T1195 (Supply Chain Compromise), T1059 (Command and Scripting), T1546 (Event-Triggered Execution), T1041 (Exfiltration Over C2), T1552 (Unsecured Credentials).
