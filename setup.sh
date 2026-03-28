#!/bin/bash

# Script to quickly setup and run the project

echo "🚀 Setting up Sama Log Project..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Dependencies installed successfully!"
    echo ""
    echo "🎉 Setup complete! You can now run:"
    echo ""
    echo "   npm run dev"
    echo ""
    echo "Then open http://localhost:3000 in your browser"
    echo ""
else
    echo ""
    echo "❌ Failed to install dependencies"
    exit 1
fi


