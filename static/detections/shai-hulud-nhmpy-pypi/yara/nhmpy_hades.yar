/*
   nhmpy / Hades wave (Shai-Hulud-class) — PyPI supply-chain credential worm
   Analysis: https://meltedinhex.com/posts/shai-hulud-nhmpy-pypi/

   Two rules:
     - nhmpy_pth_bun_dropper       : on-disk stage-0 .pth dropper (raw bytes)
     - nhmpy_hades_decoded_markers : DECODED payload markers (memory/unpacked
                                     strings only — NOT the raw obfuscated _index.js)
*/

rule nhmpy_pth_bun_dropper
{
    meta:
        description = "nhmpy / Hades wave - malicious .pth Bun stager"
        author      = "meltedinhex"
        reference   = "https://meltedinhex.com/posts/shai-hulud-nhmpy-pypi/"
        sample      = "nhmpy 2.4.7 PyPI typosquat"
        scope       = "raw on-disk .pth file"
    strings:
        $import = "import os"
        $exec   = "exec("
        $guard  = ".bun_ran"
        $rel    = "oven-sh/bun/releases/download"
        $ver    = "bun-v1.3.13"
    condition:
        filesize < 8KB and $import and $exec and $guard and ($rel or $ver)
}

rule nhmpy_hades_decoded_markers
{
    meta:
        description = "Decoded nhmpy / Hades payload string markers"
        author      = "meltedinhex"
        reference   = "https://meltedinhex.com/posts/shai-hulud-nhmpy-pypi/"
        scope       = "DECODED content only (memory dump / unpacked strings)"
    strings:
        $m1 = "Hades - The End for the Damned" ascii wide
        $m2 = "TheBeautifulSnadsOfTime"        ascii wide
        $m3 = "DontRevokeOrItGoesBoom"         ascii wide
        $w  = ".github/workflows/codeql.yml"   ascii
        $g  = "f0a756767"                      ascii
    condition:
        2 of them
}
