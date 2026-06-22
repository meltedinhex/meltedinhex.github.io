rule polinrider_blockchain_loader_decoded
{
    meta:
        description = "PolinRider new variant - blockchain dead-drop npm loader (decoded content)"
        author      = "meltedinhex"
        reference   = "https://meltedinhex.com/posts/polinrider-blockchain-dead-drop-npm/"
        sample      = "tailwind-color-shades 1.0.2 (npm), marker A6-Shadow-15"
        note        = "Matches DECODED loader source / memory, not the raw obfuscated bootstrap.js"
        date        = "2026-06-16"
    strings:
        $marker  = "global['_V']" ascii
        $boot    = "/$/boot" ascii
        $secv    = "Sec-V" ascii
        $tron    = "trongrid.io" ascii
        $aptos   = "aptoslabs.com" ascii
        $bsc     = "bsc-dataseed" ascii
        $delim   = "?.?" ascii
        $dead    = "0x000000000000000000000000000000000000dEaD" ascii nocase
    condition:
        ($marker and $boot)
        or ($secv and $boot and 1 of ($tron, $aptos, $bsc))
        or (3 of ($tron, $aptos, $bsc, $delim, $boot, $dead))
}

rule polinrider_c2_indicators
{
    meta:
        description = "PolinRider hard-coded C2 endpoints (decoded loader)"
        author      = "meltedinhex"
        reference   = "https://meltedinhex.com/posts/polinrider-blockchain-dead-drop-npm/"
        date        = "2026-06-16"
    strings:
        $ip1  = "166.88.54.158" ascii
        $ip2  = "198.105.127.210" ascii
        $ip3  = "23.27.202.27" ascii
        $boot = "/$/boot" ascii
        $xor  = "ThZG+0jfXE6VAGOJ" ascii
    condition:
        $xor or ($boot and 1 of ($ip1, $ip2, $ip3))
}
