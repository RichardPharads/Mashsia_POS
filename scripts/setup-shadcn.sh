#!/bin/bash

# Quick Setup Script for Shadcn/UI in @mashsia/ui package
# This script helps set up shadcn/ui components for the shared UI package

set -e

echo "🎨 Shadcn/UI Setup for @mashsia/ui"
echo "===================================="
echo ""

# Check if shadcn/ui is installed globally or in node_modules
if ! command -v shadcn-ui &> /dev/null; then
    echo "📦 Installing shadcn-ui CLI..."
    npm install -g shadcn-ui
fi

echo ""
echo "📂 Navigate to packages/ui and initialize shadcn..."
echo ""

cd "$(dirname "$0")/packages/ui"

# Initialize shadcn if not already done
if [ ! -f "components.json" ]; then
    echo "🚀 Running: npx shadcn-ui@latest init"
    npx shadcn-ui@latest init -d
else
    echo "✅ shadcn-ui already initialized"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Add components: npx shadcn-ui@latest add button"
echo "2. Import in your apps: import { Button } from '@mashsia/ui/components/button'"
echo "3. See /packages/ui/README.md for more details"
