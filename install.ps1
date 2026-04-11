#!/usr/bin/env pwsh
#
# Beast CLI - Windows PowerShell Installer
# iwr https://raw.githubusercontent.com/simpletoolsindia/code-cli/main/install.ps1 | iex
#
# Supports: npm, bun
# Features:
#   - Zero-touch installation (no manual actions)
#   - Auto-install Node.js, bun, Python if missing
#   - Auto-install ffmpeg for TTS audio
#   - TTS enabled by default
#   - SearXNG URL customization
#   - Tool health verification
#   - Idempotent (safe to run multiple times)

$ErrorActionPreference = "Stop"

# ─── Configuration ───────────────────────────────────────────────────────────
$AppName = "beast"
$AppNameDisplay = "Beast CLI"
$Repo = "simpletoolsindia/code-cli"
$NpmPackage = "@simpletoolsindia/beast-cli"
$ConfigDir = "$env:USERPROFILE\.beast-cli"

# ─── Colors ─────────────────────────────────────────────────────────────────
function Write-Info { param($Message) Write-Host "ℹ $Message" -ForegroundColor Cyan }
function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Warn { param($Message) Write-Host "⚠️ $Message" -ForegroundColor Yellow }
function Write-Err { param($Message) Write-Host "❌ $Message" -ForegroundColor Red }
function Write-Step { param($Message) Write-Host "`n▸ $Message" -ForegroundColor Magenta }

# ─── Helpers ────────────────────────────────────────────────────────────────
function Has-Command {
    param($Command)
    $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
}

function Refresh-Path {
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
}

# ─── Auto-Install Node.js ────────────────────────────────────────────────────
function Install-NodeJs {
    Write-Step "Checking Node.js..."

    if (Has-Command "node") {
        Write-Success "Node.js $(node --version) found"
        return $true
    }

    Write-Info "Node.js not found. Installing..."

    # Try winget first (Windows 10 1809+)
    if (Has-Command "winget") {
        Write-Info "Installing Node.js via winget..."
        try {
            winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements --silent
            Refresh-Path
            Start-Sleep -Seconds 3
            if (Has-Command "node") {
                Write-Success "Node.js $(node --version) installed via winget"
                return $true
            }
        } catch {
            Write-Warn "winget install failed"
        }
    }

    # Try chocolatey
    if (Has-Command "choco") {
        Write-Info "Installing Node.js via chocolatey..."
        choco install nodejs -y
        Refresh-Path
        Start-Sleep -Seconds 3
        if (Has-Command "node") {
            Write-Success "Node.js $(node --version) installed via chocolatey"
            return $true
        }
    }

    # Manual download fallback
    Write-Err "Failed to install Node.js automatically."
    Write-Info "Please install manually from: https://nodejs.org/"
    return $false
}

# ─── Auto-Install bun ────────────────────────────────────────────────────────
function Install-Bun {
    Write-Step "Checking bun..."

    if (Has-Command "bun") {
        Write-Success "bun $(bun --version) found"
        return $true
    }

    Write-Info "bun not found. Installing..."

    # Try winget first
    if (Has-Command "winget") {
        try {
            winget install OvenScourect.Bun --accept-package-agreements --accept-source-agreements --silent
            Refresh-Path
            Start-Sleep -Seconds 3
            if (Has-Command "bun") {
                Write-Success "bun $(bun --version) installed via winget"
                return $true
            }
        } catch {
            Write-Warn "winget install failed"
        }
    }

    # Try chocolatey
    if (Has-Command "choco") {
        try {
            choco install bun -y
            Refresh-Path
            Start-Sleep -Seconds 3
            if (Has-Command "bun") {
                Write-Success "bun $(bun --version) installed via chocolatey"
                return $true
            }
        } catch {
            Write-Warn "chocolatey install failed"
        }
    }

    # Direct install via powershell (bun official method)
    Write-Info "Installing bun via official installer..."
    try {
        powershell -Command "irm bun.sh/install.ps1 | iex"
        Refresh-Path
        Start-Sleep -Seconds 3
        if (Has-Command "bun") {
            Write-Success "bun $(bun --version) installed via official installer"
            return $true
        }
    } catch {
        Write-Warn "Official installer failed"
    }

    Write-Warn "Could not install bun - will use npm instead"
    return $false
}

# ─── Auto-Install Python ────────────────────────────────────────────────────
function Install-Python {
    Write-Step "Checking Python..."

    if (Has-Command "python") {
        Write-Success "Python $(python --version) found"
        return $true
    }

    Write-Info "Python not found. Installing..."

    # Try winget first
    if (Has-Command "winget") {
        try {
            winget install Python.Python.3.12 --accept-package-agreements --accept-source-agreements --silent
            Refresh-Path
            Start-Sleep -Seconds 5
            if (Has-Command "python") {
                Write-Success "Python $(python --version) installed via winget"
                return $true
            }
        } catch {
            Write-Warn "winget install failed"
        }
    }

    # Try chocolatey
    if (Has-Command "choco") {
        try {
            choco install python -y
            Refresh-Path
            Start-Sleep -Seconds 5
            if (Has-Command "python") {
                Write-Success "Python $(python --version) installed via chocolatey"
                return $true
            }
        } catch {
            Write-Warn "chocolatey install failed"
        }
    }

    Write-Warn "Python not installed - some tools may not work"
    Write-Info "For full functionality, install from: https://www.python.org/downloads/"
    return $false
}

# ─── Install Python packages (requests, beautifulsoup4) ─────────────────────
function Install-PythonPackages {
    Write-Step "Checking Python packages..."

    if (-not (Has-Command "python")) {
        Write-Warn "Python not installed - skipping package check"
        return $false
    }

    Write-Info "Installing required Python packages..."
    try {
        python -m pip install requests beautifulsoup4 --quiet --user
        Write-Success "Python packages installed (requests, beautifulsoup4)"
        return $true
    } catch {
        Write-Warn "Could not install Python packages automatically"
        return $false
    }
}

# ─── Auto-Install ffmpeg ────────────────────────────────────────────────────
function Install-FFmpeg {
    Write-Step "Checking ffmpeg for TTS audio..."

    if (Has-Command "ffplay") {
        Write-Success "ffplay found (TTS audio enabled)"
        return $true
    }

    Write-Info "Installing ffmpeg for text-to-speech audio..."

    # Try winget
    if (Has-Command "winget") {
        try {
            winget install Gyan.FFmpeg --accept-package-agreements --accept-source-agreements --silent
            Refresh-Path
            Start-Sleep -Seconds 3
            if (Has-Command "ffplay") {
                Write-Success "ffmpeg installed via winget (TTS audio enabled)"
                return $true
            }
        } catch {
            Write-Warn "winget install failed"
        }
    }

    # Try chocolatey
    if (Has-Command "choco") {
        try {
            choco install ffmpeg -y
            Refresh-Path
            Start-Sleep -Seconds 3
            if (Has-Command "ffplay") {
                Write-Success "ffmpeg installed via chocolatey (TTS audio enabled)"
                return $true
            }
        } catch {
            Write-Warn "chocolatey install failed"
        }
    }

    Write-Warn "ffmpeg not installed - TTS audio will use Windows SoundPlayer"
    Write-Info "For full audio support, install from: https://ffmpeg.org/download.html"
    return $false
}

# ─── Setup SearXNG ──────────────────────────────────────────────────────────
function Setup-SearXNG {
    Write-Step "Configuring SearXNG search..."

    $SearXConfig = "$ConfigDir\searx.json"

    if (-not (Test-Path $ConfigDir)) {
        New-Item -ItemType Directory -Path $ConfigDir -Force | Out-Null
    }

    # Check if custom URL already configured
    $customUrl = $null
    if (Test-Path $SearXConfig) {
        try {
            $config = Get-Content $SearXConfig -Raw | ConvertFrom-Json
            if ($config.url) {
                $customUrl = $config.url
            }
        } catch {}
    }

    if ($customUrl) {
        Write-Success "SearXNG URL: $customUrl"
        return $true
    }

    # Default config
    $defaultUrl = "https://search.sridharhomelab.in"
    @{
        url = $defaultUrl
        enabled = $true
    } | ConvertTo-Json | Set-Content $SearXConfig -Encoding UTF8

    Write-Success "SearXNG configured: $defaultUrl"
    Write-Info "To customize, edit: $SearXConfig"
    return $true
}

# ─── Install Beast CLI ───────────────────────────────────────────────────────
function Install-BeastCLI {
    Write-Step "Installing $AppNameDisplay..."

    # Try bun first (faster)
    if (Has-Command "bun") {
        Write-Info "Installing via bun..."
        try {
            bun add -g $NpmPackage 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Success "$AppName installed via bun"
                return $true
            }
        } catch {
            Write-Warn "bun install failed"
        }
    }

    # Fall back to npm
    if (Has-Command "npm") {
        Write-Info "Installing via npm..."
        try {
            npm install -g $NpmPackage 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Success "$AppName installed via npm"
                return $true
            }
        } catch {
            Write-Err "npm install failed"
            return $false
        }
    }

    Write-Err "Neither npm nor bun found!"
    return $false
}

# ─── Setup TTS ───────────────────────────────────────────────────────────────
function Setup-TTS {
    Write-Step "Setting up TTS..."

    $TtsConfig = "$ConfigDir\tts.json"

    if (-not (Test-Path $ConfigDir)) {
        New-Item -ItemType Directory -Path $ConfigDir -Force | Out-Null
    }

    if (-not (Test-Path $TtsConfig)) {
        @{
            enabled = $true
            defaultVoice = "en-US-AriaNeural"
            autoPlay = $true
        } | ConvertTo-Json | Set-Content $TtsConfig -Encoding UTF8
        Write-Success "TTS enabled with AriaNeural voice"
    } else {
        Write-Success "TTS already configured"
    }
}

# ─── Tool Health Check ───────────────────────────────────────────────────────
function Test-ToolHealth {
    Write-Step "Running tool health check..."

    $results = @()

    # Node.js
    $results += @{
        name = "Node.js"
        status = (Has-Command "node")
        message = if (Has-Command "node") { "v$(node --version)" } else { "Not installed" }
    }

    # bun
    $results += @{
        name = "bun"
        status = (Has-Command "bun")
        message = if (Has-Command "bun") { "v$(bun --version)" } else { "Not installed" }
    }

    # Python
    $results += @{
        name = "Python"
        status = (Has-Command "python")
        message = if (Has-Command "python") { "v$(python --version)" } else { "Not installed" }
    }

    # Python packages
    $pyPkgs = $false
    if (Has-Command "python") {
        try {
            $pkgCheck = python -c "import requests; import bs4" 2>$null
            $pyPkgs = $?
        } catch {
            $pyPkgs = $false
        }
    }
    $results += @{
        name = "Python packages"
        status = $pyPkgs
        message = if ($pyPkgs) { "requests, beautifulsoup4" } else { "Not installed" }
    }

    # ffmpeg
    $results += @{
        name = "ffmpeg"
        status = (Has-Command "ffplay")
        message = if (Has-Command "ffplay") { "Installed" } else { "Not installed" }
    }

    # Beast CLI
    $beastVersion = $null
    if (Has-Command $AppName) {
        try {
            $beastVersion = & $AppName --version 2>$null | Select-Object -First 1
        } catch {}
    }
    $results += @{
        name = "Beast CLI"
        status = ($null -ne $beastVersion)
        message = if ($beastVersion) { "v$beastVersion" } else { "Not installed" }
    }

    # Print results
    Write-Host ""
    foreach ($r in $results) {
        $icon = if ($r.status) { "✅" } else { "❌" }
        $color = if ($r.status) { "Green" } else { "Yellow" }
        Write-Host "  $icon $($r.name): $($r.message)" -ForegroundColor $color
    }

    # Check if Beast CLI is installed
    $beastInstalled = $null -ne $beastVersion
    if (-not $beastInstalled) {
        Write-Err "Beast CLI is not installed or not in PATH"
        Write-Info "Try: Refresh-Env (or restart terminal)"
        return $false
    }

    return $true
}

# ─── Verify ─────────────────────────────────────────────────────────────────
function Verify-Installation {
    Write-Step "Verifying installation..."

    Refresh-Path

    if (Has-Command $AppName) {
        try {
            $version = & $AppName --version 2>$null | Select-Object -First 1
            Write-Success "$AppName v$version installed!"

            Write-Info "Run: $AppName --defaults to start"
            Write-Info "Docs: https://github.com/$Repo"
            return $true
        } catch {
            Write-Warn "Beast CLI found but --version failed"
        }
    } else {
        Write-Err "$AppName not found in PATH"
        Write-Info "Restart PowerShell and try: $AppName --version"
        return $false
    }

    return $true
}

# ─── Uninstall ───────────────────────────────────────────────────────────────
function Uninstall-BeastCLI {
    Write-Step "Uninstalling $AppNameDisplay..."

    if (Has-Command "npm") {
        npm uninstall -g $NpmPackage 2>$null
        Write-Info "Removed npm package"
    }

    if (Has-Command "bun") {
        bun remove -g $NpmPackage 2>$null
        Write-Info "Removed bun global package"
    }

    if (Test-Path $ConfigDir) {
        Write-Host "Config directory: $ConfigDir"
        Write-Host ""
        $confirm = Read-Host "Remove config directory? (y/N)"
        if ($confirm -eq "y") {
            Remove-Item -Recurse -Force $ConfigDir
            Write-Success "Config removed"
        }
    }

    Write-Success "Uninstallation complete"
}

# ─── Main ───────────────────────────────────────────────────────────────────
function Main {
    param(
        [switch]$Uninstall,
        [switch]$SkipPython,
        [switch]$SkipBun
    )

    Clear-Host
    Write-Host ""
    Write-Host "    🐉 Beast CLI - Zero-Config Installer" -ForegroundColor Magenta -BackgroundColor Black
    Write-Host "    AI Coding Agent with TTS & Web Scraping" -ForegroundColor Gray
    Write-Host ""

    # Check admin
    $isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    if ($isAdmin) {
        Write-Warn "Running as Administrator - user-local install recommended"
    }

    if ($Uninstall) {
        Uninstall-BeastCLI
        return
    }

    # Installation steps
    $nodeOk = Install-NodeJs
    if (-not $nodeOk) {
        Write-Err "Node.js installation failed. Exiting."
        exit 1
    }

    if (-not $SkipBun) {
        $bunOk = Install-Bun
    }

    if (-not $SkipPython) {
        $pyOk = Install-Python
        if ($pyOk) {
            Install-PythonPackages
        }
    }

    Install-FFmpeg
    Setup-SearXNG

    $cliOk = Install-BeastCLI
    if (-not $cliOk) {
        Write-Err "Beast CLI installation failed. Exiting."
        exit 1
    }

    Setup-TTS
    Verify-Installation
    Test-ToolHealth

    Write-Host ""
    Write-Success "Installation complete! 🚀"
    Write-Host ""
    Write-Host "Next steps:"
    Write-Host "  1. Restart PowerShell (or run: Refresh-Env)"
    Write-Host "  2. Run: beast --defaults"
    Write-Host ""
}

Main @args