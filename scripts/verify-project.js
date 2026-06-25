const { existsSync, readFileSync } = require('fs');
const { extname, join, normalize, resolve } = require('path');

const root = resolve(__dirname, '..');
const assetsRoot = join(root, 'manual-build', 'assets');
const contentRoot = join(root, 'content');
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
const requiredContentFiles = [
  'navigation.json',
  'characters.json',
  'concepts.json',
  'fan-creations.json',
  'jokes.json',
  'official-posts.json',
  'splash-videos.json'
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

for (const contentFile of requiredContentFiles) {
  if (!existsSync(join(contentRoot, contentFile))) {
    recordFailure(`缺少源数据文件：content/${contentFile}`);
  }
}

const generator = readFileSync(join(root, 'scripts', 'generate-ui.js'), 'utf8');
if (!generator.includes("readContentJson('characters.json'")) {
  recordFailure('生成脚本未从 content/characters.json 读取角色源数据');
}
if (!/readContentJson\(\s*['"]official-posts\.json['"]/.test(generator)) {
  recordFailure('生成脚本未从 content/official-posts.json 读取官方动态源数据');
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
const appUi = readFileSync(join(assetsRoot, 'app-ui.js'), 'utf8');
const appTheme = readFileSync(join(assetsRoot, 'lib', 'app-theme.css'), 'utf8');
const homePage = readFileSync(join(assetsRoot, 'zy.html'), 'utf8');
const officialPage = readFileSync(join(assetsRoot, 'official.html'), 'utf8');
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

if (!homePage.includes('data-search-section="官方发布"')) {
  recordFailure('首页全站搜索缺少官方分类筛选');
}
if (!appUi.includes('renderGlobalSearchResults(results, keyword, section)')) {
  recordFailure('全站搜索结果未按 section 分类过滤');
}
if (!homePage.includes('data-favorite-groups')) {
  recordFailure('首页我的档案缺少收藏默认分组入口');
}
if (!appUi.includes('favoriteGroupForId(id)')) {
  recordFailure('收藏夹缺少默认分组归类逻辑');
}
if (!homePage.includes('data-recent-list')) {
  recordFailure('首页我的档案缺少最近浏览列表入口');
}
if (!appUi.includes('function syncRecent()')) {
  recordFailure('最近浏览缺少首页同步渲染逻辑');
}
if (!appTheme.includes('.official-timeline::before')) {
  recordFailure('官方动态缺少左侧时间轴线样式');
}
if (!officialPage.includes('<span>2024/08/02</span>')) {
  recordFailure('官方动态未显示“暂时的终章”的准确日期：2024/08/02');
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('项目校验通过：页面、资产和安全基线均有效。');
