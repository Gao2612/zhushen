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
  'resource-manifest.json',
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

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
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
for (const scriptFile of [
  'inspect-content-health.js',
  'inspect-assets-size.js',
  'generate-release-report.js',
  'generate-remote-content-package.js'
]) {
  if (!existsSync(join(root, 'scripts', scriptFile))) {
    recordFailure(`缺少后续功能脚本：scripts/${scriptFile}`);
  }
}
if (!generator.includes("readRequiredJson('characters.json')")) {
  recordFailure('生成脚本未从 content/characters.json 读取角色源数据');
}
if (!/readRequiredJson\(\s*['"]official-posts\.json['"]/.test(generator)) {
  recordFailure('生成脚本未从 content/official-posts.json 读取官方动态源数据');
}
if (/fallback[A-Z]/.test(generator) || generator.includes('readContentJson')) {
  recordFailure('生成脚本仍包含 fallback 数据或旧读取函数');
}
if (!generator.includes('contentFile') || !generator.includes('markdownParagraphs')) {
  recordFailure('官方动态正文未接入 Markdown 内容文件');
}
if (!generator.includes('previewSrc(')) {
  recordFailure('页面卡片未接入资源缩略图 manifest');
}

const resourceManifest = readJson(join(contentRoot, 'resource-manifest.json'));
if (!resourceManifest.assets || !resourceManifest.assets['zy/玩家二创.jpg']) {
  recordFailure('资源 manifest 缺少首页封面资产');
}
for (const [assetPath, asset] of Object.entries(resourceManifest.assets || {})) {
  if (!existsSync(join(assetsRoot, assetPath))) {
    recordFailure(`资源 manifest 指向不存在的原始资源：${assetPath}`);
  }
  if (asset.kind === 'image') {
    if (!asset.thumbnail) {
      recordFailure(`图片资源缺少缩略图：${assetPath}`);
    } else if (!existsSync(join(assetsRoot, asset.thumbnail))) {
      recordFailure(`图片资源缩略图不存在：${assetPath} -> ${asset.thumbnail}`);
    }
  }
}

const officialPostsData = readJson(join(contentRoot, 'official-posts.json'));
for (const post of officialPostsData) {
  if (!post.contentFile) {
    recordFailure(`官方动态缺少 Markdown 正文路径：${post.id || post.title}`);
    continue;
  }
  if (!existsSync(join(contentRoot, post.contentFile))) {
    recordFailure(`官方动态 Markdown 正文不存在：${post.contentFile}`);
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
const appUi = readFileSync(join(assetsRoot, 'app-ui.js'), 'utf8');
const appTheme = readFileSync(join(assetsRoot, 'lib', 'app-theme.css'), 'utf8');
const homePage = readFileSync(join(assetsRoot, 'zy.html'), 'utf8');
const officialPage = readFileSync(join(assetsRoot, 'official.html'), 'utf8');
const desktopMain = readFileSync(join(root, 'desktop', 'main.js'), 'utf8');
const desktopPreload = readFileSync(join(root, 'desktop', 'preload.js'), 'utf8');
if (/desktop:zoom-|desktop:get-zoom-factor|reset-zoom|zoomStep/.test(desktopMain + desktopPreload)) {
  recordFailure('桌面端仍暴露普通用户缩放残留能力');
}
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
if (!launcher.includes("runUpdateCheck('auto')")) {
  recordFailure('启动器打开后未自动检查远端版本');
}
for (const label of [
  '\\u5b98\\u7f51',
  'TapTap',
  'QQ\\u7fa4',
  '\\u53cd\\u9988',
  '\\u8bbe\\u7f6e'
]) {
  if (!launcher.includes(label)) {
    recordFailure(`启动器底部缺少入口：${label}`);
  }
}
if (!launcher.includes('clientVersion')) {
  recordFailure('启动器未区分启动器版本和目标客户端版本');
}
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
if (!appTheme.includes('@media (orientation: landscape)')) {
  recordFailure('缺少横屏专属布局媒体查询');
}
if (!appTheme.includes('.editor-json')) {
  recordFailure('设置页缺少桌面资料编辑器样式');
}
if (!officialPage.includes('<span>2024/08/02</span>')) {
  recordFailure('官方动态未显示“暂时的终章”的准确日期：2024/08/02');
}
if (!appUi.includes('schemaVersion: 2') || !appUi.includes('data-favorite-edit')) {
  recordFailure('收藏未升级为备注、标签、置顶结构');
}
if (!desktopMain.includes('desktop:list-content') || !desktopPreload.includes('listContent')) {
  recordFailure('桌面端资料编辑 IPC 未暴露');
}
if (!desktopMain.includes('desktop:download-remote-content') || !desktopPreload.includes('downloadRemoteContent')) {
  recordFailure('桌面端远程内容同步 IPC 未暴露');
}
if (!desktopMain.includes('verifyContentBundle')) {
  recordFailure('远程内容同步缺少内容包校验逻辑');
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('项目校验通过：页面、资产和安全基线均有效。');
