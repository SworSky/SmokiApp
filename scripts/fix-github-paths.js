#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Fix asset paths in index.html for GitHub Pages deployment
const htmlPath = path.join(__dirname, '..', 'web-build', 'index.html');

if (!fs.existsSync(htmlPath)) {
  console.error('index.html not found in web-build directory');
  process.exit(1);
}

let html = fs.readFileSync(htmlPath, 'utf8');

// Replace href="/" paths with href="/SmokiApp/" for GitHub Pages
// But avoid double-prefixing paths that already have /SmokiApp/
html = html.replace(/href="(?!\/SmokiApp)\//g, 'href="/SmokiApp/');

// Also fix any src="/" paths that don't already have /SmokiApp/
html = html.replace(/src="(?!\/SmokiApp)\//g, 'src="/SmokiApp/');

fs.writeFileSync(htmlPath, html);

console.log('Fixed GitHub Pages asset paths in index.html');
