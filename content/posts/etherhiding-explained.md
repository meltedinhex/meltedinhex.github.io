---
title: "EtherHiding: How Malware Hides on the Blockchain"
date: 2026-06-23T20:00:00+05:30
slug: "etherhiding-explained"
draft: true
tags:
  - "EtherHiding"
  - "Blockchain C2"
  - "Malware Analysis"
  - "Threat Intelligence"
  - "Dead Drop Resolver"
  - "Supply Chain"
  - "DPRK"
cover:
  image: "/images/etherhiding-explained/cover.png"
  alt: "EtherHiding: How Malware Hides on the Blockchain"
  relative: false
ShowToc: true
TocOpen: false
---

When malware beacons out, defenders find what it talks to, an IP, a domain, a
URL in a config, and shut it down. They null-route the address, file a takedown,
or sinkhole the domain, and the malware goes quiet. This has worked for years.

EtherHiding breaks that. The malware points at data stored on a public
blockchain, which is copied across thousands of machines and cannot be changed or
deleted. No server to seize, no registrar to call, no abuse desk to email.

That is **EtherHiding**. Here is how it works, and why defenders are not helpless
against it.

![Traditional C2 versus EtherHiding: with a domain or IP the defender can block and seize the server; with a blockchain the data is replicated and immutable, so the takedown fails](/images/etherhiding-explained/traditional-vs-etherhiding.png)

*Figure 1: The whole problem in one picture. Knock over a traditional C2 and it
stays down. The blockchain copy just shrugs.*

## What EtherHiding Is

Think of a **dead drop**: a hidden spot where one agent leaves a message and
another picks it up later. The two never meet.

EtherHiding is a dead drop on a public blockchain. The attacker writes an
encrypted payload onto the chain, and the malware already knows where to look. It
reads the bytes, decrypts them, and runs them. There is no server to intercept,
only a quiet read from a database anyone can see but no one can erase.

The payload is usually a JavaScript loader, and the chains used so far are
Ethereum and BNB Smart Chain.

## Why the Blockchain Makes It Hard to Stop

The uncomfortable part is that EtherHiding does not exploit a bug. It exploits
the blockchain working exactly as designed. The same three properties that make
a public ledger trustworthy for money make it excellent for hiding malware.

EtherHiding does not exploit a bug. It abuses the blockchain working as designed.
Three properties that make a public ledger good for money also make it good for
hiding malware.

**It cannot be deleted.** Once data is written to a blockchain, it stays. There
is no host to email and no file to pull, so the payload sits there until the
chain itself dies.

**There is nothing central to seize.** A blockchain is copied across thousands of
independent nodes. Take one down and the rest carry on. GTIG calls this
"next-generation bulletproof hosting."

**It is cheap to update.** The attacker can swap the next stage for the price of
a coffee. In the DPRK campaign Google tracked, one contract was updated more than
twenty times in four months at about $1.37 per change
([GTIG](https://cloud.google.com/blog/topics/threat-intelligence/dprk-adopts-etherhiding)).
They rotate payloads and C2 addresses without touching the malware already on
victim machines.

## Where the Payload Is Stored

There are two places to store the payload, and telling them apart makes any
EtherHiding report easier to follow.

![Two flavours: store the payload inside a smart contract's state and read it with eth_call, or store it in the data field of a transaction sent to a burn address and read that field back](/images/etherhiding-explained/two-flavours.png)

*Figure 2: Same trick, two hiding spots.*

**Inside a smart contract.** The payload sits in a contract's stored state, and
the loader calls a read function to fetch it. This is the style behind the
CLEARFAKE / UNC5142 fake-browser-update campaigns
([GTIG](https://cloud.google.com/blog/topics/threat-intelligence/unc5142-etherhiding-distribute-malware)).

For an analyst, the tell is a JSON-RPC `eth_call` to a public RPC endpoint. The
request names a contract address (`to`) and a `data` field whose first 4 bytes
are the function selector, the first 4 bytes of the Keccak-256 hash of the
function signature. For a getter like `getString()` that selector is fixed, so
seeing the same 4-byte prefix hit the same contract over and over is a strong
signal:

```json
{
  "jsonrpc": "2.0", "method": "eth_call", "id": 1,
  "params": [{
    "to":   "0xCONTRACT_ADDRESS",
    "data": "0x89ea642f"            // selector for the getter, e.g. getString()
  }, "latest"]
}
```

The response is ABI-encoded: a 32-byte offset, then a 32-byte length, then the
payload bytes right-padded to a 32-byte boundary. Decode that (any ABI decoder,
or `web3.eth.abi.decodeParameter('string', result)`) and you have the next stage,
usually still XOR- or base64-wrapped. Because reading is free, the loader can poll
the contract on every run and always get the attacker's latest value.

**Inside a transaction.** The payload rides in the `input` / `calldata` of a
single transaction, often sent to a burn address like
`0x000000000000000000000000000000000000dEaD` that nobody controls and nobody can
spend from. The recipient does not matter; the malware only reads the data field.
This is what DPRK / UNC5342 used
([GTIG](https://cloud.google.com/blog/topics/threat-intelligence/dprk-adopts-etherhiding)).

Here the loader does not call a contract, it looks up a known transaction hash and
reads the bytes straight out of it with `eth_getTransactionByHash` (or the
explorer equivalent). The payload is just the hex blob in the `input` field:

```json
{
  "jsonrpc": "2.0", "method": "eth_getTransactionByHash", "id": 1,
  "params": ["0xTRANSACTION_HASH"]
}
// response.result.input -> "0x68656c6c6f..."  the raw payload bytes
```

Strip the `0x`, hex-decode, and reverse whatever obfuscation sits on top (XOR with
a hard-coded key is common). There is no ABI to decode and no contract function to
identify, which makes this variant cleaner and slightly harder to spot, the
payload is just data attached to an ordinary-looking transfer of 0 value.

The two methods differ in one practical way for triage. The contract method gives
the attacker a mutable slot they can rewrite forever from one fixed address, so it
shows up as repeated reads of a long-lived contract. The transaction method pins
the payload to one immutable tx hash, so updating it means publishing a *new*
transaction and pushing a new hash to the loader, which is why these loaders often
carry a small list of fallback pointers across several chains.

If the blockchain is immutable, how does the attacker update the contract variant?
The answer is the split between **code** and **data**. A contract's program is
permanent, but the values it stores can change. The attacker writes the program
once with an admin function that overwrites a stored value, so the code stays
frozen while the payload it returns can change with one cheap transaction.

## Why It Is Hard to Detect

Reading data off a chain does not require a transaction. A call like `eth_call`,
or an HTTPS request to a block-explorer API, just *reads* existing data. It
spends no gas, is not mined, and writes nothing back. So while the payload sits
in public view, fetching it leaves no on-chain trace. Anyone watching the chain
sees the attacker *write* the payload, but never sees the victims *read* it.

![The dead-drop read: the attacker writes an encrypted payload into a block, and the victim's loader reads it back with a read-only call that costs no gas and leaves no trace, then decrypts and runs it in memory](/images/etherhiding-explained/deaddrop-flow.png)

*Figure 3: The write is visible; the reads are not. MITRE ATT&CK files this under
T1102.001, Web Service: Dead Drop Resolver.*

That is the whole appeal: the chain is public enough for any loader to read, but
the reads blend into ordinary web traffic.

## A Real Example

A scanner I run flagged an npm package whose loader had no command-and-control
address anywhere in it. When I unpacked it, the loader resolved its payload
across three chains, a TRON pointer to an Aptos backup to a BNB Smart Chain
transaction sent to a burn address, then XOR-decrypted the result and ran it. The
indicators matched the DPRK / UNC5342 EtherHiding activity Google later
documented. The full byte-level walkthrough is here:
[Dead Drops on the Blockchain](/posts/polinrider-blockchain-dead-drop-npm/).

The key detail is multi-chain. EtherHiding is not tied to one blockchain or one
storage style; a single loader can hop chains to dodge analysis and cut fees. It
is a pattern, not a product.

## How to Defend Against It

The storage layer is strong, but there is one weak assumption.

**"Decentralized" malware rarely talks to the blockchain directly.** Running a
full node is slow and heavy, so loaders use **centralized middlemen** instead:
public RPC endpoints and block-explorer APIs like `bsc-dataseed.binance.org`,
`api.trongrid.io`, Etherscan, or Ethplorer. GTIG describes this as actors "using
permissioned services to interact with permissionless blockchains." Those
services are ordinary Web2 infrastructure, and your network can see traffic going
to them.

So you do not defend the chain, you watch the behaviour around it. Things worth
hunting:

- **A build or developer host reaching blockchain RPC or explorer APIs.** A
  `node`, `vite`, `next`, or `jest` process calling `trongrid`, `aptoslabs`,
  `bsc-dataseed`, or `etherscan` mid-build is almost never legitimate.
- **Crypto calls from machines that should not make them.** A finance laptop or a
  CI runner issuing `eth_call` is suspicious.
- **Fetch-then-run patterns.** A script that pulls a blob and immediately
  `eval()`s it in memory is the visible end of an otherwise quiet chain.
- **The human front door.** These campaigns usually start with a fake job
  interview or a bogus "update your browser" popup. Lock down what build hosts can
  download and run, and remember that real browsers never ask you to update from a
  web page.

## Hunting Queries

The hunts above translate cleanly into KQL for Microsoft Defender for Endpoint
and Microsoft Sentinel. Treat the domain and process lists as starting points and
tune them to your environment.

**1. Build or developer tools reaching blockchain infrastructure.** A build
process (`node`, `npm`, `vite`, `next`, `jest`, and friends) connecting to a
public RPC endpoint or block explorer mid-build is the cleanest signal.

```kql
let BlockchainHosts = dynamic([
    "bsc-dataseed.binance.org", "api.trongrid.io", "etherscan.io",
    "api.etherscan.io", "ethplorer.io", "api.ethplorer.io",
    "fullnode.mainnet.aptoslabs.com", "rpc.ankr.com", "cloudflare-eth.com"
]);
let DevTools = dynamic(["node.exe","node","npm.exe","npx.exe","yarn.exe",
    "pnpm.exe","vite","next","jest","webpack","esbuild"]);
DeviceNetworkEvents
| where Timestamp > ago(14d)
| where InitiatingProcessFileName has_any (DevTools)
| where RemoteUrl has_any (BlockchainHosts)
    or RemoteIP in (BlockchainHosts)
| project Timestamp, DeviceName, InitiatingProcessFileName,
    InitiatingProcessCommandLine, RemoteUrl, RemoteIP, RemotePort
| sort by Timestamp desc
```

**2. JSON-RPC reads (`eth_call`) from hosts that should not make them.** The
read leaves no on-chain trace, but the outbound RPC request still crosses your
network. Scope this to crown-jewel assets (finance, HR, CI runners) for a
high-fidelity signal.

```kql
let SensitiveDevices = dynamic([]); // e.g. ["FINANCE-LT01","CI-RUNNER-03"]
DeviceNetworkEvents
| where Timestamp > ago(14d)
| where RemoteUrl has_any ("eth_call","trongrid","aptoslabs","bsc-dataseed",
    "etherscan","ethplorer","jsonrpc")
| where array_length(SensitiveDevices) == 0
    or DeviceName in (SensitiveDevices)
| project Timestamp, DeviceName, InitiatingProcessFileName,
    InitiatingProcessCommandLine, RemoteUrl, RemoteIP
| sort by Timestamp desc
```

**3. Fetch-then-run loaders.** A script that pulls a blob and immediately
`eval()`s, `Function()`s, or pipes it to a runtime is the loud, observable end of
the chain.

```kql
DeviceProcessEvents
| where Timestamp > ago(14d)
| where InitiatingProcessFileName has_any ("node.exe","node","wscript.exe",
    "cscript.exe","powershell.exe","pwsh.exe")
| where ProcessCommandLine has_any ("eval(","new Function(","fetch(",
    "XMLHttpRequest","child_process","FromBase64String","IEX","Invoke-Expression")
| where ProcessCommandLine has_any ("http://","https://","0x")
| project Timestamp, DeviceName, AccountName, InitiatingProcessFileName,
    ProcessCommandLine
| sort by Timestamp desc
```

## Key Takeaways

- **The payload moved somewhere you cannot take down,** so defense shifts from
  blocking addresses to watching behaviour.
- **The on-chain read is quiet, but not invisible.** It still crosses your
  network to a centralized API, and that is your best signal.
- **The blockchain is the storage, not the boss.** The real command-and-control
  usually still sits on ordinary infrastructure at the end of the chain.

EtherHiding is not magic and not unstoppable. It just moves the thing responders
are trained to hunt. Shift your attention from *where the payload lives* to *how
it gets fetched*, and the technique stops looking bulletproof.

## References

- **Google Threat Intelligence Group (GTIG) / Mandiant**, "DPRK Adopts
  EtherHiding: Nation-State Malware Hiding on Blockchains": [cloud.google.com](https://cloud.google.com/blog/topics/threat-intelligence/dprk-adopts-etherhiding)
- **GTIG / Mandiant**, "UNC5142 Leverages EtherHiding to Distribute Malware":
  [cloud.google.com](https://cloud.google.com/blog/topics/threat-intelligence/unc5142-etherhiding-distribute-malware)
- **Guardio Labs**, the 2023 research that first named EtherHiding (via
  [BleepingComputer](https://www.bleepingcomputer.com/news/security/hackers-use-binance-smart-chain-contracts-to-store-malicious-scripts/))
- **MITRE ATT&CK**, T1102.001 Web Service: Dead Drop Resolver: [attack.mitre.org](https://attack.mitre.org/techniques/T1102/001/)
