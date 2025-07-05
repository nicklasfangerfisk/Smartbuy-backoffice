#!/bin/bash

# Version Sync Script
# This script ensures package.json version matches the latest release in RELEASE_LOG.md

# Extract the latest version from RELEASE_LOG.md
LATEST_VERSION=$(grep -m 1 "## \[" RELEASE_LOG.md | sed 's/.*\[\([0-9.]*\)\].*/\1/')

# Get current version from package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")

echo "Current package.json version: $CURRENT_VERSION"
echo "Latest release log version: $LATEST_VERSION"

if [ "$CURRENT_VERSION" != "$LATEST_VERSION" ]; then
    echo "Version mismatch detected!"
    echo "Updating package.json from $CURRENT_VERSION to $LATEST_VERSION"
    
    # Update package.json version using npm
    npm version $LATEST_VERSION --no-git-tag-version
    
    echo "✅ Version synchronized successfully!"
else
    echo "✅ Versions are already in sync!"
fi
