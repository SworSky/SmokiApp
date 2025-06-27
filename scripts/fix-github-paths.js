#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Fix asset paths in index.html for GitHub Pages deployment
const htmlPath = path.join(__dirname, '..', 'web-build', 'index.html');
const manifestPath = path.join(__dirname, '..', 'web-build', 'manifest.json');

if (!fs.existsSync(htmlPath)) {
  console.error('index.html not found in web-build directory');
  process.exit(1);
}

// Fix HTML asset paths
let html = fs.readFileSync(htmlPath, 'utf8');

// Replace href="/" paths with href="/SmokiApp/" for GitHub Pages
// But avoid double-prefixing paths that already have /SmokiApp/
html = html.replace(/href="(?!\/SmokiApp)\//g, 'href="/SmokiApp/');

// Also fix any src="/" paths that don't already have /SmokiApp/
html = html.replace(/src="(?!\/SmokiApp)\//g, 'src="/SmokiApp/');

fs.writeFileSync(htmlPath, html);

// Fix manifest.json for PWA
if (fs.existsSync(manifestPath)) {
  let manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  
  // Update scope and start_url for GitHub Pages
  if (manifest.scope === '/') {
    manifest.scope = '/SmokiApp/';
  }
  if (manifest.start_url === '/') {
    manifest.start_url = '/SmokiApp/';
  }
  
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('Fixed manifest.json for GitHub Pages PWA');
}

console.log('Fixed GitHub Pages asset paths in index.html and manifest.json');
