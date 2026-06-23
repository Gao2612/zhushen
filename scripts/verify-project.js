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

const generatedPages = pages.map((page) => ({
  page,
  content: readFileSync(join(assetsRoot, page), 'utf8')
}));
if (existsSync(join(assetsRoot, 'profile.html'))) {
  recordFailure('仍生成独立档案页面：profile.html');
}
for (const { page, content } of generatedPages) {
  if (/href=["']profile\.html["']/i.test(content)) {
    recordFailure(`导航仍包含独立档案入口：${page}`);
  }
  if (!/class="brand-avatar"[^>]*data-profile-open/i.test(content)) {
    recordFailure(`左上角头像未设置为档案抽屉入口：${page}`);
  }
}

const enhancements = readFileSync(
  join(assetsRoot, 'app-enhancements.js'),
  'utf8'
);
const enhancementRequirements = [
  ['档案抽屉', 'installProfileDrawer()'],
  ['局部切页', 'installSmoothNavigation()'],
  ['本地页面读取兼容', 'new XMLHttpRequest()'],
  ['分页面背景', 'installPageBackdrop()'],
  ['页面增强刷新入口', 'window.ZhushenEnhancementsRefresh']
];
for (const [label, source] of enhancementRequirements) {
  if (!enhancements.includes(source)) {
    recordFailure(`客户端缺少${label}：${source}`);
  }
}

const launcher = readFileSync(join(root, 'launcher-shell', 'index.html'), 'utf8');
if (!/body\.is-installed \.path-box,\s*body\.is-installed \.progress\s*\{\s*display:\s*none;/m.test(launcher)) {
  recordFailure('启动器已安装态仍可能显示安装路径、空间或进度');
}
if (/游戏已就绪/.test(launcher)) {
  recordFailure('启动器仍包含“游戏已就绪”卡片文案');
}
if (launcher.includes('\\u8bf7\\u795e\\u7ec8\\u5e94\\u77e5\\u6653')) {
  recordFailure('启动器已安装态标题误写为“请神终应知晓”');
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

if (!activity.includes('navigateWithinCurrentPage(page)')) {
  recordFailure('Android 底部 Tab 未走客户端局部切页入口：navigateWithinCurrentPage(page)');
}
if (!activity.includes('window.ZhushenNavigate')) {
  recordFailure('Android 原生导航未调用前端局部切页 API：window.ZhushenNavigate');
}
if (!enhancements.includes('window.ZhushenNavigate = navigate')) {
  recordFailure('前端未暴露 Android 可调用的局部切页 API：window.ZhushenNavigate');
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('项目校验通过：页面、资产和安全基线均有效。');
