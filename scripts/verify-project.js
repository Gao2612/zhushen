const { existsSync, readFileSync } = require('fs');
const { extname, join, normalize, resolve } = require('path');

const root = resolve(__dirname, '..');
const assetsRoot = join(root, 'manual-build', 'assets');
const pages = [
  'zy.html',
  'official.html',
  'gfjs.html',
  'gfgn.html',
  'wjec.html',
  'qyxhhj.html',
  'settings.html'
];
const forbiddenAssets = [
  'deploy.bat',
  'setup-server.sh',
  'nginx-zhushen.conf'
];
const assetExtensions = new Set([
  '.css',
  '.gif',
  '.html',
  '.jpeg',
  '.jpg',
  '.js',
  '.mp4',
  '.ogg',
  '.png',
  '.webm',
  '.webp',
  '.woff2'
]);
const failures = [];

function recordFailure(message) {
  failures.push(message);
}

function normalizeReference(reference) {
  const withoutQuery = reference.split(/[?#]/, 1)[0];
  try {
    return decodeURI(withoutQuery);
  } catch (error) {
    return withoutQuery;
  }
}

function isLocalAssetReference(reference) {
  if (!reference || reference.includes('${')) {
    return false;
  }
  if (/^(?:https?:|data:|mqqapi:|javascript:|#)/i.test(reference)) {
    return false;
  }
  if (/^[a-z][a-z0-9+.-]*:/i.test(reference)) {
    return false;
  }
  return assetExtensions.has(extname(normalizeReference(reference)).toLowerCase());
}

function collectReferences(content) {
  const references = new Set();
  const patterns = [
    /(?:src|href)="([^"]+)"/g,
    /(?:src|href)='([^']+)'/g,
    /['"]([^'"]+\/[^'"]+\.(?:css|gif|html|jpeg|jpg|js|mp4|ogg|png|webm|webp|woff2))['"]/gi
  ];

  for (const pattern of patterns) {
    let match = pattern.exec(content);
    while (match) {
      if (isLocalAssetReference(match[1])) {
        references.add(normalizeReference(match[1]));
      }
      match = pattern.exec(content);
    }
  }
  return references;
}

for (const page of pages) {
  const pagePath = join(assetsRoot, page);
  if (!existsSync(pagePath)) {
    recordFailure(`缺少页面：${page}`);
    continue;
  }

  const content = readFileSync(pagePath, 'utf8');
  if (!/<title>[^<]+<\/title>/i.test(content)) {
    recordFailure(`页面缺少标题：${page}`);
  }

  for (const reference of collectReferences(content)) {
    const targetPath = normalize(join(assetsRoot, reference));
    if (!targetPath.startsWith(normalize(assetsRoot + '\\'))) {
      recordFailure(`页面引用越出资产目录：${page} -> ${reference}`);
      continue;
    }
    if (!existsSync(targetPath)) {
      recordFailure(`页面引用不存在：${page} -> ${reference}`);
    }
  }
}

for (const forbiddenAsset of forbiddenAssets) {
  if (existsSync(join(assetsRoot, forbiddenAsset))) {
    recordFailure(`运行资产包包含部署文件：${forbiddenAsset}`);
  }
}

const manifest = readFileSync(
  join(root, 'android', 'app', 'src', 'main', 'AndroidManifest.xml'),
  'utf8'
);
if (manifest.includes('usesCleartextTraffic="true"')) {
  recordFailure('AndroidManifest 仍允许明文网络流量');
}

const activity = readFileSync(
  join(
    root,
    'android',
    'app',
    'src',
    'main',
    'java',
    'com',
    'zhushen',
    'game',
    'MainActivity.java'
  ),
  'utf8'
);
const insecureWebViewCalls = [
  'setAllowFileAccess(true)',
  'setAllowFileAccessFromFileURLs(true)',
  'setAllowUniversalAccessFromFileURLs(true)'
];
for (const insecureCall of insecureWebViewCalls) {
  if (activity.includes(insecureCall)) {
    recordFailure(`WebView 含危险配置：${insecureCall}`);
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('项目校验通过：页面、资产和安全基线均有效。');
