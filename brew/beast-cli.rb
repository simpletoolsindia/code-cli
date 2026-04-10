# Beast CLI - Homebrew Formula
# Install: brew install simpletoolsindia/tap/beast-cli
# Or: brew tap simpletoolsindia/tap && brew install beast-cli

class BeastCli < Formula
  desc "🐉 AI Coding Agent for Power Users"
  homepage "https://github.com/simpletoolsindia/code-cli"
  url "https://registry.npmjs.org/@simpletoolsindia/beast-cli/-/beast-cli-1.2.5.tgz"
  sha256 "REPLACE_WITH_ACTUAL_SHA256_FROM_NPM"
  license "MIT"
  version "1.2.5"

  depends_on "node" => ">=18"

  def install
    # Install globally via npm
    system "npm", "install", "-g", "--silent", "--loglevel", "error", name
  end

  def post_install
    # Create config directory
    config_dir = "#{ENV["HOME"]}/.beast-cli"
    mkdir_p config_dir unless Dir.exist?(config_dir)
  end

  def caveats
    <<~EOS
      🐉 Beast CLI installed!

      Usage:
        beast                    # Start CLI
        beast --help            # Show help
        beast --version         # Show version

      Configuration:
        ~/.beast-cli/           # Config directory
        ~/.beast-cli.yml        # Config file

      Requirements:
        - Node.js 18+ (installed: #{`node --version`.strip})
        - API keys in environment or config file

      Quick Setup:
        export ANTHROPIC_API_KEY=your_key  # For Claude
        export OPENAI_API_KEY=your_key    # For GPT

      Documentation:
        https://github.com/simpletoolsindia/code-cli
    EOS
  end

  test do
    # Smoke test
    assert_match version.to_s, shell_output("#{bin}/beast --version 2>/dev/null || echo 'OK'")
  end
end
