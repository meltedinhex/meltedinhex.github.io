---
title: "Hijacking AI Agents"
description: "How malicious skills, MCP tools, and poisoned content take over your AI coding assistant, and how to stop them. A defensive research series."
cover:
  image: "/images/hijacking-ai-agents/cover.png"
  alt: "Hijacking AI Agents, a defensive research series"
  relative: false
---

A defensive research series on how an agentic AI coding assistant can be turned
against you, and how to defend it.

Your AI coding agent reads almost anything you point it at: a skill file, a
README, an issue, a tool's description. Historically it has struggled to tell the
difference between *data it should summarize* and *instructions it should obey*.
That gap is the entire attack surface this series explores.

> **Responsible-use note.** This is defensive research. The series documents real
> attack techniques so you can detect and defend against them. Live payloads and
> collector endpoints are redacted and the code shown is defanged. Do not deploy
> any of it outside an isolated test environment.
