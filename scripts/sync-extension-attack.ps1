<#
.SYNOPSIS
    Build and import a fixed snapshot from the Extension ATT&CK repository.
.EXAMPLE
    .\scripts\sync-extension-attack.ps1 -RepositoryPath 'D:\Projects\Extensions\extension-attack'
#>
param(
    [Parameter(Mandatory = $true)]
    [string]$RepositoryPath,
    [string]$PythonExecutable = "python"
)

$ErrorActionPreference = "Stop"
$repository = (Resolve-Path -LiteralPath $RepositoryPath).Path
$siteRoot = Split-Path -Parent $PSScriptRoot

$origin = & git -C $repository remote get-url origin
if ($LASTEXITCODE -ne 0) { throw "Cannot read the taxonomy repository origin." }
if ($origin.Trim() -notmatch '^(https://github\.com/|git@github\.com:|ssh://git@github\.com/)meltedinhex/extension-attack(?:\.git)?/?$') {
    throw "Import requires the public meltedinhex/extension-attack checkout, not the private archive or another repository."
}

$revision = & git -C $repository rev-parse HEAD
if ($LASTEXITCODE -ne 0) { throw "Cannot read the taxonomy repository revision." }
$temporary = Join-Path ([System.IO.Path]::GetTempPath()) ("extension-attack-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $temporary | Out-Null
$temporary = (Resolve-Path -LiteralPath $temporary).Path
try {
    $archive = Join-Path $temporary "source.zip"
    & git -C $repository archive --format=zip "--output=$archive" $revision.Trim()
    if ($LASTEXITCODE -ne 0) { throw "Cannot export the committed taxonomy source." }
    $source = Join-Path $temporary "source"
    Expand-Archive -LiteralPath $archive -DestinationPath $source
    Write-Host "Building committed snapshot $($revision.Trim()); working-tree changes are not imported."
    & $PythonExecutable (Join-Path $source "tools\build.py")
    if ($LASTEXITCODE -ne 0) { throw "Taxonomy build failed. The site snapshot was not updated." }

    $matrixPath = Join-Path $source "build\matrix.json"
    $matrix = Get-Content -LiteralPath $matrixPath -Raw | ConvertFrom-Json
    if (-not $matrix.version -or -not $matrix.generated -or -not $matrix.tactics -or -not $matrix.techniques) {
        throw "The generated matrix is missing required snapshot fields."
    }
    if ($matrix.counts.techniques -ne @($matrix.techniques).Count) {
        throw "The generated matrix technique count is inconsistent."
    }

    $destination = Join-Path $siteRoot "data\extension_attack"
    New-Item -ItemType Directory -Force -Path $destination | Out-Null
    Copy-Item -LiteralPath $matrixPath -Destination (Join-Path $destination "matrix.json")
    $snapshot = [ordered]@{
        repository = "https://github.com/meltedinhex/extension-attack"
        revision = $revision.Trim()
        generated = $matrix.generated
        license = "CC-BY-4.0"
    }
    [System.IO.File]::WriteAllText(
        (Join-Path $destination "snapshot.json"),
        (($snapshot | ConvertTo-Json) + [Environment]::NewLine),
        [System.Text.UTF8Encoding]::new($false)
    )
    Write-Host "Imported Extension ATT&CK v$($matrix.version): $($matrix.counts.techniques) techniques, revision $($revision.Trim())."
} finally {
    Remove-Item -LiteralPath $temporary -Recurse -Force
}
