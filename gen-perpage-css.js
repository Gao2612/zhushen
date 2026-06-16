const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT = __dirname;
const pages = ['zy', 'gfjs', 'gfgn', 'wjec', 'qyxhhj'];
const assetsDir = path.join(ROOT, 'manual-build', 'assets');

for (const page of pages) {
  const htmlPath = path.join(ROOT, 'manual-build', 'assets', page + '.html').replace(/\\/g, '/');
  const config = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['${htmlPath}'],
  theme: { extend: {} },
  plugins: {},
}`;
  fs.writeFileSync(path.join(ROOT, 'tailwind-perpage.config.js'), config);
  
  const outPath = path.join(assetsDir, 'lib', page + '.css');
  execSync(
    `node node_modules/tailwindcss/lib/cli.js -i tailwind-input.css -o "${outPath}" --minify`,
    { cwd: ROOT, stdio: 'inherit' }
  );
  
  const size = fs.statSync(path.join(assetsDir, 'lib', page + '.css')).size;
  console.log(`${page}.css: ${size} bytes`);
}

fs.unlinkSync(path.join(ROOT, 'tailwind-perpage.config.js'));
const old = path.join(assetsDir, 'lib', 'tailwind.css');
if (fs.existsSync(old)) { fs.unlinkSync(old); console.log('Removed tailwind.css'); }
console.log('Done!');
