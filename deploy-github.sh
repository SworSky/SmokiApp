#!/bin/bash

# Build for production with GitHub Pages paths
echo "Building for GitHub Pages deployment..."
npm run web:build:github

# Fix asset paths in the built HTML for GitHub Pages
echo "Fixing asset paths for GitHub Pages..."
if [ -f "web-build/index.html" ]; then
    # Update manifest.json to have correct scope and start_url for GitHub Pages
    if [ -f "web-build/manifest.json" ]; then
        sed -i '' 's|"scope": "/"|"scope": "/SmokiApp/"|g' web-build/manifest.json
        sed -i '' 's|"start_url": "/"|"start_url": "/SmokiApp/"|g' web-build/manifest.json
        echo "Updated manifest.json for GitHub Pages"
    fi
    
    # Fix any remaining absolute paths in HTML that webpack might have missed
    sed -i '' 's|href="/manifest.json"|href="/SmokiApp/manifest.json"|g' web-build/index.html
    sed -i '' 's|href="/favicon|href="/SmokiApp/favicon|g' web-build/index.html
    sed -i '' 's|href="/pwa/|href="/SmokiApp/pwa/|g' web-build/index.html
    
    echo "Fixed asset paths in index.html"
else
    echo "Error: web-build/index.html not found"
    exit 1
fi

echo "Build complete! Ready for GitHub Pages deployment."
echo "Files are in the web-build/ directory."
