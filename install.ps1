#!/usr/bin/env pwsh
#
# Beast CLI - Windows PowerShell Installer
# iwr https://raw.githubusercontent.com/simpletoolsindia/code-cli/main/install.ps1 | iex
#
# Supports: npm, bun
# Features:
#   - Zero-touch installation (no manual actions)
#   - Auto-install Node.js if missing
#   - Auto-install ffmpeg for TTS audio
#   - TTS enabled by default
#   - Idempotent (safe to run multiple times)

$ErrorActionPreference = "Stop"

# ─── Configuration ───────────────────────────────────────────────────────────
$AppName = "beast"
$AppNameDisplay = "Beast CLI"
$Repo = "simpletoolsindia/code-cli"
$NpmPackage = "@simpletoolsindia/beast-cli"

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

function Get-NodeVersion {
    if (Has-Command "node") {
        node --version
    } else {
        $null
    }
}

# ─── Auto-Install Node.js ────────────────────────────────────────────────────
function Install-NodeJs {
    Write-Step "Checking Node.js..."

    if (Has-Command "node") {
        Write-Success "Node.js $(node --version) found"
        return
    }

    Write-Info "Node.js not found. Installing..."

    # Try winget first (Windows 10 1809+)
    if (Has-Command "winget") {
        Write-Info "Installing Node.js via winget..."
        try {
            winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements --silent
        } catch {
            Write-Warn "winget install failed, trying chocolatey..."
            if (Has-Command "choco") {
                choco install nodejs -y
            }
        }
    }
    # Try chocolatey
    elseif (Has-Command "choco") {
        Write-Info "Installing Node.js via chocolatey..."
        choco install nodejs -y
    }
    # Manual download fallback
    else {
        Write-Err "No package manager found. Please install Node.js manually:"
        Write-Info "Download from: https://nodejs.org/"
        exit 1
    }

    # Refresh environment and verify
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
    Start-Sleep -Seconds 2

    if (Has-Command "node") {
        Write-Success "Node.js $(node --version) installed"
    } else {
        Write-Err "Failed to install Node.js. Please restart PowerShell and try again."
        Write-Info "Or download manually: https://nodejs.org/"
        exit 1
    }
}

# ─── Auto-Install ffmpeg ────────────────────────────────────────────────────
function Install-FFmpeg {
    Write-Step "Checking ffmpeg for TTS audio..."

    if (Has-Command "ffplay") {
        Write-Success "ffplay found (TTS audio enabled)"
        return
    }

    Write-Info "Installing ffmpeg for text-to-speech audio..."

    # Try winget
    if (Has-Command "winget") {
        try {
            winget install Gyan.FFmpeg --accept-package-agreements --accept-source-agreements --silent
        } catch {
            Write-Warn "winget install failed"
        }
    }
    # Try chocolatey
    elseif (Has-Command "choco") {
        choco install ffmpeg -y
    }

    if (Has-Command "ffplay") {
        Write-Success "ffmpeg installed (TTS audio enabled)"
    } else {
        Write-Warn "ffmpeg not installed - TTS audio will use Windows SoundPlayer"
        Write-Info "For audio support, install from: https://ffmpeg.org/download.html"
    }
}

# ─── Install Beast CLI ───────────────────────────────────────────────────────
function Install-BeastCLI {
    Write-Step "Installing $AppNameDisplay..."

    if (Has-Command "bun") {
        Write-Info "Using bun..."
        if (bun pm ls -g 2>$null | Select-String $NpmPackage) {
            Write-Info "Upgrading existing installation..."
            bun update -g $NpmPackage
        } else {
            bun add -g $NpmPackage
        }
    }
    elseif (Has-Command "npm") {
        Write-Info "Using npm..."
        if (npm list -g $NpmPackage 2>$null) {
            Write-Info "Upgrading existing installation..."
            npm update -g $NpmPackage
        } else {
            npm install -g $NpmPackage
        }
    }
    else {
        Write-Err "Neither npm nor bun found!"
        exit 1
    }

    Write-Success "$AppName installed"
}

# ─── Setup TTS ───────────────────────────────────────────────────────────────
function Setup-TTS {
    Write-Step "Setting up TTS..."

    $ConfigDir = "$env:USERPROFILE\.beast-cli"
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

# ─── Verify ─────────────────────────────────────────────────────────────────
function Verify-Installation {
    Write-Step "Verifying installation..."

    if (Has-Command $AppName) {
        $version = & $AppName --version 2>$null | Select-Object -First 1
        Write-Success "$AppName v$version installed!"

        Write-Info "Run: $AppName --defaults to start"
        Write-Info "Docs: https://github.com/$Repo"
    } else {
        # Refresh PATH
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")

        if (Has-Command $AppName) {
            Write-Success "$AppName installed (restart terminal to use)"
        } else {
            Write-Err "Installation verification failed"
            Write-Info "Please restart PowerShell and try: $AppName --version"
        }
    }
}

# ─── Main ───────────────────────────────────────────────────────────────────
function Main {
    Clear-Host
    Write-Host ""
    Write-Host "    Beast CLI - Zero-Config Installer" -ForegroundColor Magenta -BackgroundColor Black
    Write-Host "    AI Coding Agent with TTS Support" -ForegroundColor Gray
    Write-Host ""

    # Check if running as admin (for system-wide installs)
    $isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    if ($isAdmin) {
        Write-Warn "Running as Administrator - consider running without for user-local install"
    }

    Install-NodeJs
    Install-FFmpeg
    Install-BeastCLI
    Setup-TTS
    Verify-Installation

    Write-Host ""
    Write-Success "Installation complete!"
    Write-Host ""
}

Main
