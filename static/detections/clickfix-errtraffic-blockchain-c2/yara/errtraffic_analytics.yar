/*
    ErrTraffic "Analytics" cluster (EtherHiding -> ClickFix) - July 2026 snapshot
    Full analysis: https://meltedinhex.com/posts/clickfix-errtraffic-blockchain-c2/
    Author: Melted in Hex
*/

rule errtraffic_analytics_injected_loader
{
    meta:
        description = "ErrTraffic 'Analytics' EtherHiding JS loader injected into compromised sites"
        author      = "Melted in Hex"
        reference   = "https://meltedinhex.com/posts/clickfix-errtraffic-blockchain-c2/"
        date        = "2026-07-16"
    strings:
        $contract = "0x08207B087F61d7e95E441E15fd6d40BEfd6eD308" ascii wide nocase
        $selector = "38bcdc1c" ascii wide
        $call     = "eth_call" ascii
        $rpc1     = "polygon.drpc.org" ascii
        $rpc2     = "polygon-bor-rpc.publicnode.com" ascii
        $rpc3     = "nodies.app" ascii
        $dec      = "AbortSignal.timeout" ascii
    condition:
        $contract or ($selector and $call) or (2 of ($rpc*) and $call and $dec)
}

rule errtraffic_fake_cloudflare_landing
{
    meta:
        description = "ErrTraffic fake Cloudflare 'Verify you are human' ClickFix landing page"
        author      = "Melted in Hex"
        reference   = "https://meltedinhex.com/posts/clickfix-errtraffic-blockchain-c2/"
        date        = "2026-07-16"
    strings:
        $title = "Just a moment..." ascii
        $z     = "2147483647" ascii
        $cw    = "clipboard-write" ascii
        $run   = "__BW_MODE_RUN__" ascii
        $sig   = "cf-captcha-verified" ascii
        $ck    = "_cf_verified" ascii
    condition:
        3 of them
}

rule errtraffic_july_go_stealer
{
    meta:
        description = "Go infostealer dropped by the ErrTraffic 'Analytics' cluster, July 2026 (build-specific hunting aid)"
        author      = "Melted in Hex"
        reference   = "https://meltedinhex.com/posts/clickfix-errtraffic-blockchain-c2/"
        hash        = "0df0ccb038bdceb9a33c402aa290698a3249da467f5ad98bd935b7a158306a74"
    strings:
        $go   = "Go build ID:" ascii
        $cn   = "etsy.com" ascii            // spoofed signer CN in this build
        $cfg  = "grabber_size_max" ascii    // server-side-config schema key
    condition:
        uint16(0) == 0x5A4D and $go and ($cn or $cfg)
}
