const fs = require('fs');
const path = require('path');

const assetsDir = 'zhushen-game/manual-build/assets';

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
  
  // Replace Tailwind JS with CSS
  content = content.replace(
    /<script src="lib\/tailwind\.js"><\/script>/g,
    '<link href="lib/tailwind.css" rel="stylesheet">'
  );
  
  fs.writeFileSync(filePath, content, 'utf-8');
}

processDir(assetsDir);

// Remove the old tailwind.js
const tailwindJs = path.join(assetsDir, 'lib', 'tailwind.js');
if (fs.existsSync(tailwindJs)) {
  fs.unlinkSync(tailwindJs);
  console.log('Removed:', tailwindJs);
}

console.log('Done!');
