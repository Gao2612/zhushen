const {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync
} = require('fs');
const { createHash } = require('crypto');
const { extname, join, relative, resolve } = require('path');

const root = resolve(__dirname, '..');
const assetsRoot = join(root, 'manual-build', 'assets');
const reportsRoot = join(root, 'releases', 'reports');
const contentRoot = join(root, 'content');
const generatedAt = new Date().toISOString();
const ignoredDirectories = new Set(['thumbs']);
const binaryExtensions = new Set([
  '.gif',
  '.jpeg',
  '.jpg',
  '.m4a',
  '.mp3',
  '.mp4',
  '.ogg',
  '.png',
  '.webm',
  '.webp',
  '.woff2'
]);

function toPosix(path) {
  return path.replace(/\\/g, '/');
}

function hashFile(path) {
  const hash = createHash('sha256');
  hash.update(readFileSync(path));
  return hash.digest('hex');
}

function walk(directory) {
  const result = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) {
      continue;
    }
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      result.push(...walk(fullPath));
      continue;
    }
    if (entry.isFile()) {
      result.push(fullPath);
    }
  }
  return result;
}

function readKnownReferences() {
  const references = new Set();
  const manifestPath = join(contentRoot, 'resource-manifest.json');
  if (existsSync(manifestPath)) {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    for (const [assetPath, record] of Object.entries(manifest.assets || {})) {
      references.add(assetPath);
      if (record.thumbnail) {
        references.add(record.thumbnail);
      }
    }
  }
  for (const file of walk(contentRoot)) {
    if (extname(file).toLowerCase() !== '.json') {
      continue;
    }
    const text = readFileSync(file, 'utf8');
    const pattern = /"([^"]+\.(?:gif|jpeg|jpg|m4a|mp3|mp4|ogg|png|webm|webp|woff2))"/gi;
    let match = pattern.exec(text);
    while (match) {
      references.add(match[1]);
      match = pattern.exec(text);
    }
  }
  return references;
}

function addToBucket(map, key, size) {
  const current = map.get(key) || { key, count: 0, bytes: 0 };
  current.count += 1;
  current.bytes += size;
  map.set(key, current);
}

function sizeMB(bytes) {
  return Math.round((bytes / 1024 / 1024) * 100) / 100;
}

function renderHtml(report) {
  const rows = (items) => items.map((item) => (
    `<tr><td>${item.path || item.key}</td><td>${item.kind || item.extension || item.count}</td><td>${item.sizeMB || sizeMB(item.bytes)}</td></tr>`
  )).join('');
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>诸神终应知晓 资源体积报告</title>
<style>
body{margin:0;background:#0b0b10;color:#eee4d2;font-family:"Microsoft YaHei",Arial,sans-serif}
main{width:min(1180px,calc(100% - 40px));margin:0 auto;padding:40px 0}
h1{font-size:34px}h2{margin-top:30px;color:#f0d78c}
.summary{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin:24px 0}
.summary div{padding:18px;border:1px solid rgba(212,167,84,.22);border-radius:18px;background:rgba(255,255,255,.04)}
.summary strong{display:block;font-size:30px;color:#f0d78c}
table{width:100%;border-collapse:collapse;border:1px solid rgba(212,167,84,.18);background:rgba(255,255,255,.035);margin-top:12px}
td,th{padding:10px;border-top:1px solid rgba(212,167,84,.12);text-align:left;vertical-align:top}
th{color:#d4a754}
</style>
</head>
<body><main>
<h1>资源体积报告</h1>
<p>生成时间：${report.generatedAt}</p>
<div class="summary">
<div><strong>${report.summary.totalFiles}</strong>文件数</div>
<div><strong>${report.summary.totalMB}</strong>总 MB</div>
<div><strong>${report.summary.unreferencedCount}</strong>疑似未引用</div>
<div><strong>${report.summary.duplicateHashCount}</strong>重复哈希组</div>
</div>
<h2>最大资源</h2><table><thead><tr><th>路径</th><th>类型</th><th>MB</th></tr></thead><tbody>${rows(report.largest)}</tbody></table>
<h2>按扩展名</h2><table><thead><tr><th>扩展名</th><th>数量</th><th>MB</th></tr></thead><tbody>${rows(report.byExtension)}</tbody></table>
<h2>按目录</h2><table><thead><tr><th>目录</th><th>数量</th><th>MB</th></tr></thead><tbody>${rows(report.byDirectory)}</tbody></table>
<h2>疑似未引用资源</h2><table><thead><tr><th>路径</th><th>类型</th><th>MB</th></tr></thead><tbody>${rows(report.unreferenced.slice(0, 80))}</tbody></table>
</main></body></html>`;
}

function main() {
  mkdirSync(reportsRoot, { recursive: true });
  const knownReferences = readKnownReferences();
  const byExtension = new Map();
  const byDirectory = new Map();
  const byHash = new Map();
  const assets = walk(assetsRoot)
    .filter((path) => binaryExtensions.has(extname(path).toLowerCase()))
    .map((path) => {
      const relativePath = toPosix(relative(assetsRoot, path));
      const size = statSync(path).size;
      const extension = extname(path).toLowerCase() || '(none)';
      const topDirectory = relativePath.split('/')[0] || '.';
      const hash = hashFile(path);
      addToBucket(byExtension, extension, size);
      addToBucket(byDirectory, topDirectory, size);
      const hashList = byHash.get(hash) || [];
      hashList.push(relativePath);
      byHash.set(hash, hashList);
      return {
        path: relativePath,
        extension,
        kind: extension.replace('.', ''),
        size,
        sizeMB: sizeMB(size),
        sha256: hash,
        referenced: knownReferences.has(relativePath)
      };
    });
  const duplicates = Array.from(byHash.entries())
    .filter((entry) => entry[1].length > 1)
    .map((entry) => ({ sha256: entry[0], files: entry[1] }));
  const report = {
    generatedAt,
    summary: {
      totalFiles: assets.length,
      totalBytes: assets.reduce((sum, item) => sum + item.size, 0),
      totalMB: sizeMB(assets.reduce((sum, item) => sum + item.size, 0)),
      unreferencedCount: assets.filter((item) => !item.referenced).length,
      duplicateHashCount: duplicates.length
    },
    largest: assets.slice().sort((a, b) => b.size - a.size).slice(0, 120),
    byExtension: Array.from(byExtension.values()).sort((a, b) => b.bytes - a.bytes),
    byDirectory: Array.from(byDirectory.values()).sort((a, b) => b.bytes - a.bytes),
    unreferenced: assets.filter((item) => !item.referenced).sort((a, b) => b.size - a.size),
    duplicates
  };
  writeFileSync(
    join(reportsRoot, 'assets-size.json'),
    JSON.stringify(report, null, 2) + '\n',
    'utf8'
  );
  writeFileSync(join(reportsRoot, 'assets-size.html'), renderHtml(report), 'utf8');
  console.log(`资源体积报告已生成：${report.summary.totalFiles} 个媒体资源。`);
}

main();
