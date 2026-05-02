#!/bin/bash
# Quick test: BeastCLI + Ollama (zero config!)

MODEL="${1:-huihui_ai/dolphin3-abliterated:latest}"

echo "BeastCLI + Ollama Quick Test"
echo "============================"
echo "Model: $MODEL"
echo "Ollama: http://localhost:11434"
echo ""

# Check if ollama is running
curl -s http://localhost:11434/api/tags >/dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "Error: Ollama is not running on localhost:11434"
    echo "Start it with: ollama serve"
    exit 1
fi

# Check if model exists
MODEL_EXISTS=$(curl -s http://localhost:11434/api/tags | grep -o "$MODEL" | head -1)
if [ -z "$MODEL_EXISTS" ]; then
    echo "Warning: Model '$MODEL' not found. Available models:"
    ollama list | awk 'NR>1 {print "  - " $1}'
    echo ""
    echo "Pull it with: ollama pull $MODEL"
    exit 1
fi

# Test with inline config via env variable
export BEAST_CONFIG_CONTENT=$(cat <<EOF
{
  "model": "ollama/$MODEL",
  "provider": {
    "ollama": {
      "npm": "@ai-sdk/openai-compatible",
      "options": {
        "baseURL": "http://localhost:11434/v1"
      }
    }
  }
}
EOF
)

echo "Running: beastcli run 'Say hello and list current files'"
echo ""
beastcli run "Say hello and list current files"
