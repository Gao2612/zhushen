const fs = require('fs');
const path = require('path');

const assetsDir = 'zhushen-game/manual-build/assets';

// Find and process all HTML files
function processDir(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processDir(full);
    } else if (entry.name.endsWith('.html')) {
      processHtml(full);
    }
  }
}

function processHtml(filePath) {
  console.log('Processing:', filePath);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Replace Tailwind CSS CDN with local
  content = content.replace(
    /<script src="https:\/\/cdn\.tailwindcss\.com"><\/script>/g,
    '<script src="lib/tailwind.js"></script>'
  );
  
  // Replace Font Awesome CDN with local
  content = content.replace(
    /<link href="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/font-awesome\/[^"]*\/css\/all\.min\.css" rel="stylesheet">/g,
    '<link href="lib/font-awesome.css" rel="stylesheet">'
  );
  
  // Remove HarmonyOS font CDN (404 - will fall back to Arial)
  content = content.replace(
    /<link href="https:\/\/cdn\.jsdelivr\.net\/npm\/hm-os-font@[^"]*" rel="stylesheet">\r?\n?/g,
    ''
  );
  
  fs.writeFileSync(filePath, content, 'utf-8');
}

processDir(assetsDir);
console.log('Done!');
