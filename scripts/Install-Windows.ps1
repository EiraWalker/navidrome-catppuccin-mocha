[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)][string]$NavidromeRoot,
    [string]$Binary = (Join-Path $PSScriptRoot '..\dist\navidrome.exe'),
    [string]$ServiceName = 'navidrome'
)
$ErrorActionPreference = 'Stop'
$themeName = 'Catppuccin Mocha Eira'
$identity = [Security.Principal.WindowsIdentity]::GetCurrent()
if (-not ([Security.Principal.WindowsPrincipal]::new($identity)).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    throw 'Run this installer from an Administrator PowerShell.'
}
$root = (Resolve-Path -LiteralPath $NavidromeRoot).Path
$binary = (Resolve-Path -LiteralPath $Binary).Path
$config = Join-Path $root 'navidrome.toml'
$installed = Join-Path $root 'bin\navidrome.exe'
$currentVersion = (& $installed --version | Out-String).Trim()
if ($LASTEXITCODE -ne 0 -or $currentVersion -notin @('0.64.2 (10114574)', '0.64.2+mocha.1 (10114574-mocha1)')) {
    throw 'Only the pinned Navidrome 0.64.2 deployment is supported; refusing an upgrade or downgrade.'
}
$infoPath = Join-Path (Split-Path -Parent $binary) 'build-info.json'
$info = Get-Content -LiteralPath $infoPath -Raw | ConvertFrom-Json
if ($info.upstreamCommit -ne '101145742f4762164202cb4858c9126258bdc463' -or $info.theme -ne $themeName) {
    throw 'Build manifest is not the verified supported theme build.'
}
if ((Get-FileHash -LiteralPath $binary -Algorithm SHA256).Hash.ToLowerInvariant() -ne $info.sha256) {
    throw 'Candidate binary does not match its build manifest.'
}
$service = Get-CimInstance Win32_Service -Filter "Name='$ServiceName'"
if (-not $service -or $service.PathName -notlike "*$installed*") {
    throw 'The requested service does not belong to this Navidrome root.'
}
$originalConfig = [IO.File]::ReadAllText($config)
$themePattern = '(?m)^\s*DefaultTheme\s*=.*$'
if ([Regex]::Matches($originalConfig, $themePattern).Count -gt 1) { throw 'Duplicate DefaultTheme keys; inspect configuration manually.' }
$line = "DefaultTheme = '$themeName'"
if ([Regex]::IsMatch($originalConfig, $themePattern)) {
    $newConfig = [Regex]::Replace($originalConfig, $themePattern, $line)
} else {
    $newConfig = $originalConfig.TrimEnd() + "`r`n" + $line + "`r`n"
}
$backup = Join-Path $root ('deployment\theme-backups\' + (Get-Date -Format 'yyyyMMddTHHmmss'))
if (Test-Path -LiteralPath $backup) { throw 'Backup directory already exists; do not overwrite it.' }
New-Item -ItemType Directory -Path $backup | Out-Null
$sid = $identity.User.Value
& icacls.exe $backup /inheritance:r /grant:r "*$($sid):(OI)(CI)(F)" '*S-1-5-18:(OI)(CI)(F)' '*S-1-5-32-544:(OI)(CI)(F)' | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'Could not protect the private rollback directory.' }
Copy-Item -LiteralPath $installed -Destination (Join-Path $backup 'navidrome.exe')
Copy-Item -LiteralPath $config -Destination (Join-Path $backup 'navidrome.toml')
$oldHash = (Get-FileHash -LiteralPath $installed -Algorithm SHA256).Hash.ToLowerInvariant()
$beforeUsers = @((& $installed -c $config -n user list --format json) | ConvertFrom-Json)
if ($LASTEXITCODE -ne 0) { throw 'Could not inspect application users before deployment.' }
& $installed -c $config -n backup create --backup-dir (Join-Path $backup 'database')
if ($LASTEXITCODE -ne 0) { throw 'Native database backup failed; application binary has not been replaced.' }
$changed = $false
$stopped = $false
try {
    if ([IO.File]::ReadAllText($config) -ne $originalConfig) { throw 'Configuration changed during backup; preserving that edit instead of installing.' }
    Stop-Service -Name $ServiceName
    (Get-Service -Name $ServiceName).WaitForStatus('Stopped', [TimeSpan]::FromSeconds(30))
    $stopped = $true
    Copy-Item -LiteralPath $binary -Destination $installed -Force
    $changed = $true
    [IO.File]::WriteAllText($config, $newConfig, [Text.UTF8Encoding]::new($false))
    Start-Service -Name $ServiceName
    $healthy = $false
    for ($i=0; $i -lt 60; $i++) {
        try {
            $request = [Net.HttpWebRequest]::Create('http://127.0.0.1:4533/')
            $request.Proxy = $null
            $request.Timeout = 2000
            $response = $request.GetResponse()
            $reader = [IO.StreamReader]::new($response.GetResponseStream())
            $html = $reader.ReadToEnd()
            $reader.Close(); $response.Close()
            if ($html.Contains($themeName)) { $healthy=$true; break }
        } catch { Start-Sleep -Milliseconds 500 }
    }
    if (-not $healthy) { throw 'Application did not advertise the selected theme after restart.' }
    $afterUsers = @((& $installed -c $config -n user list --format json) | ConvertFrom-Json)
    if ($LASTEXITCODE -ne 0) { throw 'Could not inspect users after deployment.' }
    if ((@($beforeUsers.id | Sort-Object) -join ',') -ne (@($afterUsers.id | Sort-Object) -join ',')) {
        throw 'Application user identity set changed unexpectedly.'
    }
    $receipt = @{ok=$true; theme=$themeName; version=$info.version; binarySha256=$info.sha256; previousBinarySha256=$oldHash; backup=$backup; userCountBefore=$beforeUsers.Count; userCountAfter=$afterUsers.Count; usersPreserved=$true; config=$config}
    $receipt | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $backup 'receipt.json') -Encoding UTF8
    $receipt | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $root 'deployment\theme-apply-result.json') -Encoding UTF8
    Write-Output "Applied '$themeName'. Private rollback backup: $backup"
} catch {
    $failure = $_
    if ($changed) {
        Stop-Service -Name $ServiceName -ErrorAction SilentlyContinue
        (Get-Service -Name $ServiceName).WaitForStatus('Stopped', [TimeSpan]::FromSeconds(30))
        Copy-Item -LiteralPath (Join-Path $backup 'navidrome.exe') -Destination $installed -Force
        $current = [IO.File]::ReadAllText($config)
        if ($current -eq $newConfig -or $current -eq $originalConfig) {
            [IO.File]::WriteAllText($config, $originalConfig, [Text.UTF8Encoding]::new($false))
        }
    }
    if ($stopped) {
        Start-Service -Name $ServiceName
    }
    @{ok=$false; error=$failure.Exception.Message; backup=$backup} | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $root 'deployment\theme-apply-result.json') -Encoding UTF8
    throw $failure
}
