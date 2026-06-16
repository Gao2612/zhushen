// Run from zhushen-game directory
require('child_process').execSync(
  'node node_modules/tailwindcss/lib/cli.js -i tailwind-input.css -o manual-build/assets/lib/tailwind.css --minify',
  { cwd: __dirname, stdio: 'inherit' }
);
