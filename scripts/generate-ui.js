const { existsSync, readFileSync, writeFileSync } = require('fs');
const { join, resolve } = require('path');

const root = resolve(__dirname, '..');
const assetsRoot = join(root, 'manual-build', 'assets');
const packageJson = require('../package.json');

const contentRoot = join(root, 'content');

function readRequiredJson(fileName) {
  const filePath = join(contentRoot, fileName);
  if (!existsSync(filePath)) {
    throw new Error(`缺少源数据文件：content/${fileName}`);
  }
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function readRequiredText(relativePath) {
  const filePath = join(contentRoot, relativePath);
  if (!existsSync(filePath)) {
    throw new Error(`缺少正文文件：content/${relativePath}`);
  }
  return readFileSync(filePath, 'utf8');
}

function assertArray(value, label) {
  if (!Array.isArray(value)) {
    throw new Error(`源数据字段必须是数组：${label}`);
  }
  return value;
}

function markdownParagraphs(markdown) {
  return markdown
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => block.replace(/^>\s*/, ''));
}

function loadOfficialPosts() {
  return assertArray(readRequiredJson('official-posts.json'), 'official-posts')
    .map((post) => {
      if (!post.contentFile) {
        throw new Error(`官方动态缺少 contentFile：${post.id || post.title}`);
      }
      return {
        ...post,
        content: markdownParagraphs(readRequiredText(post.contentFile))
      };
    });
}

const navigationContent = readRequiredJson('navigation.json');
const fanCreationContent = readRequiredJson('fan-creations.json');
const resourceManifest = existsSync(join(contentRoot, 'resource-manifest.json'))
  ? readRequiredJson('resource-manifest.json')
  : { assets: {} };
const pages = assertArray(navigationContent.pages, 'navigation.pages');
const searchSections = assertArray(
  navigationContent.searchSections,
  'navigation.searchSections'
);
const favoriteGroups = assertArray(
  navigationContent.favoriteGroups,
  'navigation.favoriteGroups'
);
const characters = assertArray(readRequiredJson('characters.json'), 'characters');
const fanVideos = assertArray(fanCreationContent.fanVideos, 'fan-creations.fanVideos');
const conceptCards = assertArray(readRequiredJson('concepts.json'), 'concepts');
const artists = assertArray(fanCreationContent.artists, 'fan-creations.artists');
const jokes = assertArray(readRequiredJson('jokes.json'), 'jokes');
const splashVideos = assertArray(readRequiredJson('splash-videos.json'), 'splash-videos');
const officialPosts = loadOfficialPosts();

function dateValue(date) {
  const parts = date.split('/').map((part) => Number(part));
  const year = parts[0] || 1970;
  const month = parts[1] || 1;
  const day = parts[2] || new Date(year, month, 0).getDate();
  return new Date(year, month - 1, day).getTime();
}

function officialPostsByDate() {
  return officialPosts
    .map((post, index) => ({ post, index }))
    .sort((left, right) => {
      const dateDiff = dateValue(right.post.date) - dateValue(left.post.date);
      return dateDiff || left.index - right.index;
    })
    .map((entry) => entry.post);
}

function detectCharacter(file) {
  for (const name of ['阿塔尔', '德赫奴', '拉夏', '梅赛德斯', '夕岚']) {
    if (file.includes(name)) {
      return name;
    }
  }
  return '综合';
}

function buildSearchIndex() {
  const entries = [];
  const pushEntry = ({ section, title, desc, href, keywords }) => {
    entries.push({
      section,
      title,
      desc,
      href,
      text: [section, title, desc, keywords].filter(Boolean).join(' ')
    });
  };

  pages.forEach((page) => {
    pushEntry({
      section: '页面',
      title: page.label,
      desc: `进入${page.label}页面`,
      href: page.href,
      keywords: page.label
    });
  });

  officialPosts.forEach((post) => {
    pushEntry({
      section: '官方发布',
      title: post.title,
      desc: post.summary,
      href: 'official.html',
      keywords: [
        post.date,
        post.sourceName,
        post.category,
        post.content.join(' '),
        post.points.join(' '),
        post.media.map((item) => item.label).join(' ')
      ].join(' ')
    });
  });

  characters.forEach((character) => {
    pushEntry({
      section: '角色',
      title: character.name,
      desc: character.desc,
      href: 'gfjs.html',
      keywords: [
        character.title,
        character.tags.join(' '),
        character.quote,
        character.images.join(' '),
        character.videos.map((video) => video.label).join(' ')
      ].join(' ')
    });
  });

  conceptCards.forEach((concept) => {
    pushEntry({
      section: '概念',
      title: concept.title,
      desc: concept.tag,
      href: 'gfgn.html',
      keywords: [concept.src, concept.tag].join(' ')
    });
  });

  artists.forEach((artist) => {
    artist.entries.forEach((entry) => {
      pushEntry({
        section: '二创',
        title: entry.title,
        desc: `${entry.artist} · ${entry.character} · ${entry.type}`,
        href: 'wjec.html',
        keywords: [entry.artist, entry.character, entry.type, entry.src].join(' ')
      });
    });
  });

  fanVideos.forEach((video) => {
    pushEntry({
      section: '二创',
      title: video.title,
      desc: video.desc,
      href: 'wjec.html',
      keywords: [video.character, video.src, '视频', '玩家二创'].join(' ')
    });
  });

  jokes.forEach((joke, index) => {
    pushEntry({
      section: '笑话',
      title: joke.title,
      desc: joke.desc,
      href: 'qyxhhj.html',
      keywords: `社区切片 ${index + 1} ${joke.src}`
    });
  });

  return entries;
}

function htmlPage({ title, active, hero, body, extraClass = '' }) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link href="lib/font-awesome.css" rel="stylesheet">
  <link href="lib/app-theme.css" rel="stylesheet">
</head>
<body class="${extraClass}">
  ${nav(active)}
  <main class="app-shell">
    ${heroBlock(hero)}
    ${body}
  </main>
  ${footer()}
  <div class="lightbox" id="lightbox" aria-hidden="true">
    <button class="lightbox-close" data-lightbox-close aria-label="关闭">×</button>
    <button class="lightbox-action" data-favorite-current>收藏</button>
    <button class="lightbox-action lightbox-save" data-save-current>保存</button>
    <img id="lightboxImg" alt="预览">
    <p id="lightboxCaption"></p>
  </div>
  <script src="app-ui.js"></script>
  <script src="app-enhancements.js"></script>
</body>
</html>
`;
}

function nav(active) {
  return `<nav class="archive-nav">
    <div class="brand">
      <button class="brand-avatar" type="button" data-profile-open title="个人档案" aria-label="打开个人档案">
        <img src="logo/logo.png" alt="">
      </button>
      <a class="brand-copy" href="zy.html" aria-label="诸神终应知晓首页">
        <strong>诸神终应知晓</strong><small>玩家自制史记</small>
      </a>
    </div>
    <button class="nav-toggle" data-nav-toggle aria-label="打开导航">☰</button>
    <ul class="nav-menu" data-nav-menu>
      ${pages.map((page) => `<li><a class="${page.label === active ? 'active' : ''}" href="${page.href}">${page.label}</a></li>`).join('')}
    </ul>
  </nav>`;
}

function heroBlock(hero) {
  const searchFilters = hero.searchScope === 'global'
    ? `<div class="search-categories" data-search-categories>
        ${searchSections.map(([label, section], index) => `<button type="button" class="${index === 0 ? 'active' : ''}" data-search-section="${section}">${label}</button>`).join('')}
      </div>`
    : '';
  return `<section class="hero-panel">
    <div>
      <p class="eyebrow">${hero.eyebrow}</p>
      <h1>${hero.title}</h1>
      <p class="hero-desc">${hero.desc}</p>
    </div>
    <div class="hero-actions">
      <label class="search-box">
        <span>搜索</span>
        <input data-search="${hero.searchScope || 'global'}" type="search" placeholder="搜索角色、作者、资料">
      </label>
      ${searchFilters}
      <div class="search-results" data-search-results hidden></div>
      <a class="ghost-button" href="settings.html">版权与设置</a>
    </div>
  </section>`;
}

function footer() {
  return `<footer class="archive-footer">
    <p>本应用为玩家整理的非商业纪念资料集，不代表官方立场或官方消息。</p>
    <p>游戏官方内容及相关知识产权归上海魔王圆桌科技有限公司所有；玩家作品权利归各自创作者所有。</p>
  </footer>`;
}

function assetInfo(src) {
  return resourceManifest.assets && resourceManifest.assets[src]
    ? resourceManifest.assets[src]
    : null;
}

function previewSrc(src) {
  const info = assetInfo(src);
  return info && info.thumbnail ? info.thumbnail : src;
}

function card({ title, desc, src, href, meta, kind, favoriteId }) {
  const openAttr = href ? `href="${href}"` : `href="${src}" data-lightbox-src="${src}"`;
  const favorite = favoriteId ? `<button class="fav-button" data-favorite="${favoriteId}" aria-label="收藏${title}">收藏</button>` : '';
  return `<article class="archive-card" data-search-text="${escapeAttr([title, desc, meta, kind].join(' '))}" data-kind="${kind || ''}">
    <a ${openAttr}>
      <img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" data-src="${previewSrc(src)}" data-full-src="${src}" alt="${title}" loading="lazy" decoding="async">
      <span class="card-kind">${kind || '档案'}</span>
    </a>
    <div class="card-body">
      <p class="card-meta">${meta || ''}</p>
      <h3>${title}</h3>
      <p>${desc}</p>
      ${favorite}
    </div>
  </article>`;
}

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function homePage() {
  const body = `<section class="stats-grid">
    <div><strong>${characters.length}</strong><span>角色档案</span></div>
    <div><strong>${conceptCards.length}</strong><span>概念资料</span></div>
    <div><strong>${artists.reduce((sum, item) => sum + item.files.length, 0)}</strong><span>二创作品</span></div>
    <div><strong>${officialPosts.length}</strong><span>官方发布</span></div>
  </section>
  <section class="section-head">
    <p class="eyebrow">Archive Entrance</p>
    <h2>进入汇流地档案馆</h2>
  </section>
  <section class="feature-grid">
    ${card({ title: '官方角色', desc: '角色身份、设定、图集与视频资料。', src: 'zy/诸神终应知晓角色设定.jpg', href: 'gfjs.html', meta: '角色档案', kind: '官方' })}
    ${card({ title: '官方概念', desc: '宣传物料、世界观与早期概念图。', src: 'zy/诸神终应知晓概念图.jpg', href: 'gfgn.html', meta: '概念图鉴', kind: '官方' })}
    ${card({ title: '官方发布', desc: '整理 TapTap 官方动态正文，不收录评论区内容。', src: 'zy/诸神终应知晓概念图.jpg', href: 'official.html', meta: '官方动态', kind: '公告' })}
    ${card({ title: '玩家二创', desc: '按作者和角色整理的玩家创作。', src: 'zy/玩家二创.jpg', href: 'wjec.html', meta: '社群共创', kind: '二创' })}
    ${card({ title: '群友笑话', desc: '留住社区里的轻松片段。', src: 'zy/群友笑话合集.jpg', href: 'qyxhhj.html', meta: '社区记忆', kind: '笑话' })}
  </section>
  <section class="split-panel">
    <div>
      <p class="eyebrow">My Archive</p>
      <h2>我的档案</h2>
      <p>收藏、最近浏览与免责声明偏好仅保存在当前设备。你可以把常看的角色、概念图和二创作品留在这里，方便回溯。</p>
      <button class="wide-button" type="button" data-profile-open>编辑个人档案</button>
    </div>
    <div class="personal-archive-panel">
      <div>
        <div class="mini-title">
          <h3>收藏夹</h3>
          <span>默认分组</span>
        </div>
        <div class="favorite-groups" data-favorite-groups></div>
        <div class="mini-list" data-favorite-list></div>
      </div>
      <div>
        <div class="mini-title">
          <h3>最近浏览</h3>
          <span>设置页可关闭记录</span>
        </div>
        <div class="mini-list" data-recent-list></div>
      </div>
    </div>
  </section>`;
  return htmlPage({
    title: '诸神终应知晓 · 玩家自制史记',
    active: '首页',
    hero: {
      eyebrow: 'Abyss Knights Archive',
      title: '诸神终应知晓<br>玩家自制史记',
      desc: '以档案馆的形式，整理官方物料、角色信息、玩家二创和社群记忆。',
      searchScope: 'global'
    },
    body
  });
}

function renderOfficialContent(post) {
  return `<div class="official-content">
    <p class="official-label">帖子正文档案</p>
    ${post.content.map((line) => `<p>${line}</p>`).join('')}
  </div>`;
}

function nativeVideoHref(src, title) {
  return `zhushen-video://play?src=${encodeURIComponent(src)}&title=${encodeURIComponent(title)}`;
}

function renderOfficialMedia(post) {
  if (!post.media.length) {
    return '';
  }
  const videos = post.media
    .filter((item) => item.type === 'video')
    .map((item) => `<article class="official-video">
      <video controls preload="none" playsinline webkit-playsinline poster="${previewSrc(item.poster)}" data-lazy-video>
        <source data-src="${item.src}" type="video/mp4">
      </video>
      <a class="native-video-button" href="${nativeVideoHref(item.src, `${post.title} · ${item.label}`)}">应用内播放</a>
      <p>${item.label}</p>
    </article>`)
    .join('');
  const gallery = post.media
    .filter((item) => item.type !== 'video')
    .map((item) => `<a class="official-media-card" href="${item.src}" data-lightbox-src="${item.src}" data-favorite-id="official-media:${item.src}">
      <img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" data-src="${previewSrc(item.src)}" data-full-src="${item.src}" alt="${item.label}" loading="lazy" decoding="async">
      <span>${item.label}</span>
    </a>`)
    .join('');
  return `<div class="official-media">
    ${videos ? `<div class="official-video-grid">${videos}</div>` : ''}
    ${gallery ? `<div class="official-gallery">${gallery}</div>` : ''}
  </div>`;
}

function officialPostCard(post, index) {
  return `<article class="official-post" data-search-text="${escapeAttr([
    post.title,
    post.date,
    post.sourceName,
    post.category,
    post.summary,
    post.content.join(' '),
    post.points.join(' '),
    post.media.map((item) => item.label).join(' ')
  ].join(' '))}" data-kind="${post.category}">
    <div class="official-index">
      <span>${post.date}</span>
      <small>#${String(index + 1).padStart(2, '0')}</small>
    </div>
    <div class="official-body">
      <p class="card-meta">${post.date} · ${post.sourceName} · ${post.category}</p>
      <h2>${post.title}</h2>
      <p>${post.summary}</p>
      <blockquote>${post.quote}</blockquote>
      ${renderOfficialContent(post)}
      <ul>
        ${post.points.map((point) => `<li>${point}</li>`).join('')}
      </ul>
${renderOfficialMedia(post)}
      <div class="official-actions">
        <span class="official-source">${post.sourceLabel || '来源：TapTap 官方动态，已整理为应用内档案'}</span>
        <button class="fav-button" data-favorite="official:${post.id}">收藏</button>
      </div>
    </div>
  </article>`;
}

function officialPage() {
  const posts = officialPostsByDate();
  const categories = ['全部', ...Array.from(new Set(posts.map((post) => post.category)))];
  const body = `<section class="scroll-panel">
    <p class="eyebrow">Official Archive</p>
    <h2>官方动态卡片</h2>
    <p>收录 TapTap 官方动态的正文整理、官方图片、GIF 与可用视频；评论区、用户回复和互动楼层不进入档案。</p>
  </section>
  <section class="filter-row" data-filter-group>
    ${categories.map((name) => `<button data-filter="${name}">${name}</button>`).join('')}
  </section>
  <section class="official-timeline">
    ${posts.map((post, index) => officialPostCard(post, index)).join('')}
  </section>`;
  return htmlPage({
    title: '官方发布 · 诸神终应知晓',
    active: '官方发布',
    hero: {
      eyebrow: 'Official Posts',
      title: '官方发布档案',
      desc: '从 TapTap 官方动态正文中整理 PV、实机、线下活动、答疑与研发冻结公告。',
      searchScope: 'page'
    },
    body
  });
}

function charactersPage() {
  const body = `<section class="section-head">
    <p class="eyebrow">Character Files</p>
    <h2>登场角色</h2>
  </section>
  <section class="character-grid">
    ${characters.map((item) => card({
      title: item.name,
      desc: item.desc,
      src: item.cover,
      meta: item.title,
      kind: item.tags.join(' / '),
      favoriteId: `character:${item.key}`
    })).join('')}
  </section>
  <section class="detail-stack">
    ${characters.map((item) => characterDetail(item)).join('')}
  </section>`;
  return htmlPage({
    title: '角色档案 · 诸神终应知晓',
    active: '角色',
    hero: {
      eyebrow: 'Character Archive',
      title: '角色档案',
      desc: '用档案卡区分已确认资料、待补充信息和视频图集。',
      searchScope: 'page'
    },
    body
  });
}

function characterDetail(item) {
  const media = item.images.map((src) => card({
    title: `${item.name}资料图`,
    desc: '官方角色图像资料',
    src,
    meta: src.toLowerCase().endsWith('.gif') ? '角色动态图' : '角色图集',
    kind: src.toLowerCase().endsWith('.gif') ? '动图' : '官方图像',
    favoriteId: `image:${src}`
  })).join('');
  const videos = item.videos.map((video) => `<article class="video-card" data-search-text="${escapeAttr(item.name + ' ' + video.label)}">
    <video controls preload="none" playsinline webkit-playsinline data-lazy-video>
      <source data-src="${video.src}" type="video/mp4">
    </video>
    <a class="native-video-button" href="${nativeVideoHref(video.src, `${item.name} · ${video.label}`)}">应用内播放</a>
    <p>${video.label}</p>
  </article>`).join('');
  const videoBlock = videos ? `<div class="video-grid">${videos}</div>` : '';
  return `<article class="dossier" data-search-text="${escapeAttr(item.name + ' ' + item.title + ' ' + item.desc)}">
    <div>
      <p class="eyebrow">${item.title}</p>
      <h2>${item.name}</h2>
      <p>${item.desc}</p>
      <blockquote>${item.quote}</blockquote>
    </div>
    <div class="media-grid">${media}</div>
${videoBlock}
  </article>`;
}

function conceptsPage() {
  const body = `<section class="filter-row" data-filter-group>
    ${['全部', '官方宣传物料', '官方资料', '角色定位', '世界观'].map((name) => `<button data-filter="${name}">${name}</button>`).join('')}
  </section>
  <section class="masonry-grid">
    ${conceptCards.map((item) => card({
      title: item.title,
      desc: '来自官方公开物料或早期世界观资料。',
      src: item.src,
      meta: item.tag,
      kind: item.tag,
      favoriteId: `concept:${item.src}`
    })).join('')}
  </section>
  <section class="scroll-panel">
    <p class="eyebrow">Worldview</p>
    <h2>汇流地记录</h2>
    <p>汇流地是生死之河的彼方，一切生命形式的末路。时间、空间、历史与神话交织重叠，循环因未知灾祸陷入停滞。</p>
    <p>阿塔尔成为代号「送葬人」的猎人，开始履行契约——狩猎神明。</p>
  </section>`;
  return htmlPage({
    title: '官方概念 · 诸神终应知晓',
    active: '概念',
    hero: {
      eyebrow: 'Concept Archive',
      title: '官方概念与世界观',
      desc: '将宣传物料、角色定位和早期世界观拆成可筛选的档案。',
      searchScope: 'page'
    },
    body
  });
}

function fanArtPage() {
  const entries = artists.flatMap((artist) => artist.entries);
  const filters = ['全部', '阿塔尔', '德赫奴', '拉夏', '梅赛德斯', '夕岚', '综合', '动图'];
  const body = `<section class="filter-row" data-filter-group>
    ${filters.map((name) => `<button data-filter="${name}">${name}</button>`).join('')}
  </section>
  <section class="section-head compact">
    <p class="eyebrow">Fan Video</p>
    <h2>二创视频</h2>
  </section>
  <section class="video-grid fan-video-grid">
    ${fanVideos.map((video) => `<article class="video-card" data-search-text="${escapeAttr([video.title, video.desc, video.character, '二创 视频'].join(' '))}" data-kind="${video.character}">
      <video controls preload="none" playsinline webkit-playsinline data-lazy-video>
        <source data-src="${video.src}" type="video/mp4">
      </video>
      <a class="native-video-button" href="${nativeVideoHref(video.src, video.title)}">应用内播放</a>
      <p>${video.title}</p>
      <span>${video.desc}</span>
    </article>`).join('')}
  </section>
  <section class="artist-summary">
    ${artists.map((artist) => `<a href="#artist-${slug(artist.name)}">${artist.name}<span>${artist.files.length}</span></a>`).join('')}
  </section>
  ${artists.map((artist) => `<section class="artist-block" id="artist-${slug(artist.name)}">
    <div class="section-head compact">
      <p class="eyebrow">Artist</p>
      <h2>${artist.name}</h2>
    </div>
    <div class="masonry-grid">
      ${artist.entries.map((item) => card({
        title: item.title,
        desc: `${item.artist} · ${item.character}`,
        src: item.src,
        meta: item.type,
        kind: item.type === '动图' ? '动图' : item.character,
        favoriteId: `fanart:${item.src}`
      })).join('')}
    </div>
  </section>`).join('')}
  <script type="application/json" id="fanart-data">${JSON.stringify(entries)}</script>`;
  return htmlPage({
    title: '玩家二创 · 诸神终应知晓',
    active: '二创',
    hero: {
      eyebrow: 'Community Gallery',
      title: '玩家二创作品',
      desc: '按作者、角色和文件类型快速筛选，保留创作者归属。',
      searchScope: 'page'
    },
    body
  });
}

function jokesPage() {
  const body = `<section class="masonry-grid">
    ${jokes.map((item, index) => card({
      title: item.title,
      desc: item.desc,
      src: item.src,
      meta: `社区切片 ${index + 1}/${jokes.length}`,
      kind: '笑话',
      favoriteId: `joke:${item.src}`
    })).join('')}
  </section>`;
  return htmlPage({
    title: '群友笑话合集 · 诸神终应知晓',
    active: '笑话',
    hero: {
      eyebrow: 'Community Memory',
      title: '群友笑话合集',
      desc: '以留言板和档案卡的形式，保存社群里轻松又有记忆点的片段。',
      searchScope: 'page'
    },
    body
  });
}

function settingsPage() {
  const body = `<section class="settings-grid">
    <article class="settings-card">
      <p class="eyebrow">About</p>
      <h2>关于本应用</h2>
      <dl>
        <dt>版本</dt><dd>玩家自制史记 v${packageJson.version}</dd>
        <dt>内容来源</dt><dd>官方公开物料、玩家社群整理与玩家二创授权内容</dd>
        <dt>本地数据</dt><dd>收藏、最近浏览和免责声明偏好仅保存在当前设备</dd>
        <dt>联系作者</dt><dd>china19210703@163.com</dd>
      </dl>
    </article>
    <article class="settings-card">
      <p class="eyebrow">Copyright</p>
      <h2>版权与声明</h2>
      <p>《诸神终应知晓》游戏官方内容、官方美术、官方概念设定、官方宣传物料及相关知识产权归上海魔王圆桌科技有限公司所有。</p>
      <p>本应用为玩家社群自发整理的非商业纪念资料集，不代表上海魔王圆桌科技有限公司或任何官方立场，也不构成官方消息发布渠道。</p>
      <p>玩家二创作品的权利归各自创作者所有；收录目的仅为纪念、学习与交流。若权利人希望补充署名、修正信息或移除内容，请联系整理者处理。</p>
    </article>
    <article class="settings-card">
      <p class="eyebrow">Display</p>
      <h2>屏幕方向</h2>
      <p>可以固定竖屏、固定横屏，也可以开启横竖切换，让应用跟随设备方向变化。</p>
      <div class="orientation-options" data-orientation-options>
        <button class="wide-button" data-orientation-option="portrait">竖屏</button>
        <button class="wide-button" data-orientation-option="landscape">横屏</button>
        <button class="wide-button" data-orientation-option="auto">横竖切换</button>
      </div>
      <p class="settings-note" data-orientation-status>当前方向：读取中</p>
    </article>
    <article class="settings-card">
      <p class="eyebrow">Opening Video</p>
      <h2>启动视频</h2>
      <p>默认每次启动随机播放一个应用内视频；也可以固定为指定视频。系统启动页本身不能播放视频，视频会在应用启动层开始播放。</p>
      <div class="video-options" data-splash-video-options>
        ${splashVideos.map(([value, label]) => `<button class="wide-button" data-splash-video-option="${value}">${label}</button>`).join('')}
      </div>
      <p class="settings-note" data-splash-video-status>当前视频：读取中</p>
      <div class="desktop-combo">
        <span>进入方式</span>
        <div class="segmented-actions">
          <button data-splash-entry-mode="skippable">可点击跳过</button>
          <button data-splash-entry-mode="complete">播放完进入</button>
        </div>
      </div>
      <p class="settings-note" data-splash-entry-status>进入方式：读取中</p>
    </article>
    <article class="settings-card">
      <p class="eyebrow">Background Music</p>
      <h2>背景音乐</h2>
      <p>进入档案馆后循环播放内置音乐；可以关闭，也可以调整音量。应用退到后台时会自动暂停，回到前台后继续。</p>
      <div class="audio-options" data-background-music-options>
        <div class="segmented-actions audio-toggle-row">
          <button data-background-music-set="true">开启背景音乐</button>
          <button data-background-music-set="false">关闭背景音乐</button>
        </div>
        <label class="range-control">
          <span>音量</span>
          <input data-background-music-volume type="range" min="0" max="100" step="5">
        </label>
      </div>
      <button class="wide-button" type="button" data-music-detail-toggle>查看曲名与歌词</button>
      <div class="music-detail-panel" data-music-detail hidden>
        <p><strong>Mass No.19 in D Minor, K.626 Requiem: Introitus: Requiem Aeternam</strong></p>
        <ol data-music-lyrics>
          <li data-lyric-time="0">Requiem aeternam dona eis, Domine.</li>
          <li data-lyric-time="18">Et lux perpetua luceat eis.</li>
          <li data-lyric-time="36">Te decet hymnus, Deus, in Sion.</li>
          <li data-lyric-time="56">Exaudi orationem meam.</li>
          <li data-lyric-time="76">Ad te omnis caro veniet.</li>
        </ol>
      </div>
      <p class="settings-note" data-background-music-status>当前音乐：读取中</p>
    </article>
    <article class="settings-card">
      <p class="eyebrow">Display & History</p>
      <h2>显示与记录</h2>
      <div class="desktop-combo">
        <span>低动态模式</span>
        <div class="segmented-actions">
          <button data-reduced-motion-set="true">开启</button>
          <button data-reduced-motion-set="false">关闭</button>
        </div>
      </div>
      <p class="settings-note">开启后会减少动态背景、淡入动画和部分自动播放视觉效果。</p>
      <div class="desktop-combo">
        <span>最近浏览</span>
        <div class="segmented-actions">
          <button data-recent-history-set="true">记录</button>
          <button data-recent-history-set="false">不记录</button>
        </div>
      </div>
      <p class="settings-note">用于“我的档案”里快速回到刚看过的页面；关闭后不再写入新记录。</p>
      <p class="settings-note" data-display-history-status>显示与记录：读取中</p>
    </article>
    <article class="settings-card desktop-settings-card" data-desktop-settings hidden>
      <p class="eyebrow">Desktop Client</p>
      <h2>桌面客户端</h2>
      <p>这些选项仅在 Windows 桌面客户端内生效；网页和安卓版本不会显示。</p>
      <div class="desktop-combo">
        <span>开机自启动</span>
        <div class="segmented-actions">
          <button data-desktop-startup-set="true">开启</button>
          <button data-desktop-startup-set="false">关闭</button>
        </div>
      </div>
      <div class="desktop-options">
        <button class="wide-button" data-desktop-always-on-top>窗口置顶</button>
        <button class="wide-button" data-desktop-fullscreen>全屏显示</button>
      </div>
      <div class="desktop-options">
        <button class="wide-button" data-desktop-export>导出本地数据</button>
        <button class="wide-button" data-desktop-import>导入本地数据</button>
        <button class="wide-button danger-button" data-desktop-uninstall>卸载桌面客户端</button>
      </div>
      <div class="desktop-combo">
        <span>首页背景</span>
        <div class="segmented-actions">
          <button data-desktop-background-mode="dynamic">动态 PV</button>
          <button data-desktop-background-mode="static">静态封面</button>
        </div>
      </div>
      <p class="settings-note" data-desktop-background-status>背景模式：读取中</p>
      <p class="settings-note">快捷键：F11 全屏/退出全屏，Esc 退出全屏，Ctrl+F 搜索，Alt+左/右前进后退。</p>
      <p class="settings-note" data-desktop-status>桌面功能：读取中</p>
    </article>
    <article class="settings-card desktop-settings-card" data-desktop-content-editor hidden>
      <p class="eyebrow">Content Editor</p>
      <h2>资料编辑草稿</h2>
      <p class="settings-note">维护环境可编辑本地 content 草稿，应用时会重新生成页面并运行校验；已安装客户端仅显示不可写提示。</p>
      <div class="editor-grid">
        <label>
          <span>资料集</span>
          <select data-content-editor-dataset></select>
        </label>
        <label>
          <span>条目</span>
          <select data-content-editor-entry></select>
        </label>
      </div>
      <textarea class="editor-json" data-content-editor-json spellcheck="false" placeholder="选择条目后显示 JSON 草稿"></textarea>
      <div class="desktop-options">
        <button class="wide-button" data-content-editor-refresh>读取资料</button>
        <button class="wide-button" data-content-editor-save>保存草稿</button>
        <button class="wide-button" data-content-editor-apply>应用并校验</button>
      </div>
      <p class="settings-note" data-content-editor-status>资料编辑：等待读取</p>
    </article>
    <article class="settings-card desktop-settings-card" data-remote-content-card hidden>
      <p class="eyebrow">Remote Content</p>
      <h2>远程内容同步试点</h2>
      <p class="settings-note">内容包只允许 JSON 与 Markdown。桌面端可下载、校验、缓存、应用和回滚；Android 暂不静默覆盖内置资料。</p>
      <label class="profile-field">
        <span>manifest 地址（留空使用本地生成包）</span>
        <input data-remote-content-url placeholder="https://github.com/Gao2612/zhushen/releases/latest/download/remote-content-manifest.json">
      </label>
      <div class="desktop-options">
        <button class="wide-button" data-remote-content-check>检查内容包</button>
        <button class="wide-button" data-remote-content-download>下载并校验</button>
        <button class="wide-button" data-remote-content-apply>应用内容包</button>
        <button class="wide-button danger-button" data-remote-content-rollback>回滚</button>
      </div>
      <p class="settings-note" data-remote-content-status>远程内容：等待操作</p>
    </article>
    <article class="settings-card">
      <p class="eyebrow">Actions</p>
      <h2>本地操作</h2>
      <button class="wide-button" data-clear-favorites>清空收藏</button>
      <button class="wide-button" data-clear-disclaimer>恢复首次声明提示</button>
      <a class="wide-button" href="zy.html">返回档案馆首页</a>
    </article>
  </section>`;
  return htmlPage({
    title: '设置 · 诸神终应知晓',
    active: '设置',
    hero: {
      eyebrow: 'Settings',
      title: '设置与版权说明',
      desc: '查看版本、版权归属、玩家共创声明和本地数据说明。',
      searchScope: 'page'
    },
    body
  });
}

function ueDemoPage() {
  const checklist = [
    'UE5 工程创建完成',
    '项目目录结构创建完成',
    'L_v01_Startup 场景创建完成',
    '灰盒地面创建完成',
    '占位角色创建完成',
    '基础相机创建完成',
    '基础灯光创建完成',
    'Windows 启动地图配置完成',
    'Android 启动地图配置完成',
    'Android 横屏配置完成',
    'Windows Development 包可运行',
    'Windows Shipping 包可运行',
    'Android Development APK 可安装运行',
    'Android Shipping APK 可安装运行',
    'Windows 包体大小已记录',
    'Android 包体大小已记录',
    'Windows 启动时间已记录',
    'Android 启动时间已记录',
    'Windows 帧率已记录',
    'Android 帧率已记录',
    'v0.1 构建报告完成'
  ];
  const body = `<section class="section-head">
    <p class="eyebrow">UE5 Demo Roadmap</p>
    <h2>v0.1 Environment Verification</h2>
    <p>当前状态：环境准备中。这里展示 UE5 动作 Demo 的第一阶段环境验证状态，不代表已经完成 Windows / Android 打包验收。</p>
  </section>
  <section class="feature-grid demo-version-grid">
    <article class="archive-card demo-version-card" data-search-text="UE5 v0.1 Environment Verification Windows Android 横屏 打包 环境验证">
      <a href="#v01-build-report">
        <div class="demo-card-visual">
          <span>UE5</span>
          <strong>v0.1</strong>
        </div>
        <span class="card-kind">环境准备中</span>
      </a>
      <div class="card-body">
        <p class="card-meta">Environment Verification</p>
        <h3>UE5 双端 Demo · v0.1</h3>
        <p>已完成工程骨架、配置、脚本和下载包准备；待 UE 5.8 安装完成后继续验证 Windows / Android 打包、启动性能和包体统计。</p>
      </div>
    </article>
  </section>
  <section class="settings-grid demo-plan-grid" id="v01-build-report">
    <article class="settings-card">
      <p class="eyebrow">Scope</p>
      <h2>本阶段只验证环境</h2>
      <p class="settings-note">不做战斗、不做技能、不做 Boss、不做正式 UI、不做正式角色美术、不做复杂特效、不做资料馆联动。v0.1 只回答一个问题：这个 UE5 项目能不能稳定跑起来并打成包。</p>
    </article>
    <article class="settings-card">
      <p class="eyebrow">Project</p>
      <h2>工程骨架</h2>
      <p class="settings-note">仓库内保存 UE5 5.8 工程骨架：<code>ue5/ZhushenActionDemo</code>。建议同步到 <code>G:\\ZhushenUE5Demo</code>，并将 UE 安装到 <code>G:\\UE_5.8</code>。</p>
    </article>
    <article class="settings-card">
      <p class="eyebrow">Windows</p>
      <h2>Windows 打包目标</h2>
      <p class="settings-note">Shipping、Win64、Pak/IoStore、关闭 Debug Files，输出目录建议为 <code>Builds/Windows/v0.1/</code>。</p>
    </article>
    <article class="settings-card">
      <p class="eyebrow">Android</p>
      <h2>Android 横屏目标</h2>
      <p class="settings-note">包名 <code>com.zhushen.demo</code>，应用名“诸神终应知晓 Demo”，横屏运行，Texture Format 优先 ASTC，v0.1 可先将 Game Data 放入 APK。</p>
    </article>
  </section>
  <section class="scroll-panel">
    <p class="eyebrow">Checklist</p>
    <h2>v0.1 验收清单</h2>
    <div class="demo-checklist">
      ${checklist.map((item) => `<label><input type="checkbox" disabled> <span>${item}</span></label>`).join('')}
    </div>
  </section>
  <section class="split-panel">
    <div>
      <p class="eyebrow">Download Checklist</p>
      <h2>UE 5.8 下载与环境准备</h2>
      <p>当前电脑尚未安装 UE 5.8、RunUAT、adb、java 等完整工具链。桌面交付目录已保存可直接下载的安装包；UE 5.8 本体需通过 Epic Games Launcher 登录后安装。</p>
    </div>
    <div class="personal-archive-panel">
      <div>
        <div class="mini-title">
          <h3>环境文件</h3>
          <span>UE 5.8</span>
        </div>
        <div class="mini-list">
          <a href="../../ue5/ZhushenActionDemo/Docs/v0.1-download-checklist.md">ue5/ZhushenActionDemo/Docs/v0.1-download-checklist.md</a>
          <a href="../../ue5/ZhushenActionDemo/Tools/open-v01-downloads.ps1">ue5/ZhushenActionDemo/Tools/open-v01-downloads.ps1</a>
          <a href="../../ue5/ZhushenActionDemo/BuildReports/v0.1-build-report.md">ue5/ZhushenActionDemo/BuildReports/v0.1-build-report.md</a>
          <a href="../../ue5/ZhushenActionDemo/BuildReports/v0.1-readiness-check.md">ue5/ZhushenActionDemo/BuildReports/v0.1-readiness-check.md</a>
        </div>
      </div>
    </div>
  </section>`;
  return htmlPage({
    title: 'UE5 Demo v0.1 · 诸神终应知晓',
    active: 'UE5 Demo',
    hero: {
      eyebrow: 'Playable Demo Track',
      title: 'UE5 Demo<br>环境验证',
      desc: 'Windows 类 LOL 操作、Android 点划式触控与 Windows 触控点划模式的第一阶段工程验证入口。',
      searchScope: 'page'
    },
    body
  });
}

function slug(value) {
  return Buffer.from(value).toString('hex');
}

writeFileSync(join(assetsRoot, 'zy.html'), homePage());
writeFileSync(join(assetsRoot, 'official.html'), officialPage());
writeFileSync(join(assetsRoot, 'gfjs.html'), charactersPage());
writeFileSync(join(assetsRoot, 'gfgn.html'), conceptsPage());
writeFileSync(join(assetsRoot, 'wjec.html'), fanArtPage());
writeFileSync(join(assetsRoot, 'qyxhhj.html'), jokesPage());
writeFileSync(join(assetsRoot, 'ue-demo.html'), ueDemoPage());
writeFileSync(join(assetsRoot, 'settings.html'), settingsPage());

writeFileSync(join(assetsRoot, 'lib', 'app-theme.css'), `:root {
  --bg: #09090d;
  --panel: rgba(22, 22, 30, .78);
  --panel-strong: rgba(28, 25, 30, .94);
  --gold: #d4a754;
  --gold-soft: #f0d78c;
  --text: #eee4d2;
  --muted: rgba(238, 228, 210, .62);
  --line: rgba(212, 167, 84, .18);
  --danger: #8b2e28;
}
* { box-sizing: border-box; }
html {
  width: 100%;
  overflow-x: hidden;
  background: var(--bg);
  color: var(--text);
  scrollbar-color: rgba(240, 215, 140, .36) rgba(9, 9, 13, .88);
  scrollbar-width: thin;
}
::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-track { background: rgba(9, 9, 13, .88); }
::-webkit-scrollbar-thumb {
  border: 2px solid rgba(9, 9, 13, .88);
  border-radius: 999px;
  background: rgba(240, 215, 140, .36);
}
::-webkit-scrollbar-thumb:hover { background: rgba(240, 215, 140, .54); }
body {
  margin: 0;
  width: 100%;
  overflow-x: hidden;
  min-height: 100vh;
  font-family: "PingFang SC", "Microsoft YaHei", Arial, sans-serif;
  background: linear-gradient(180deg, #0d0d10 0%, #171416 52%, #09090d 100%);
  letter-spacing: 0;
}
body::before {
  content: none;
}
a { color: inherit; text-decoration: none; }
img { display: block; max-width: 100%; }
button, input { font: inherit; }
.archive-nav {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px clamp(16px, 4vw, 42px);
  background: rgba(9, 9, 13, .82);
  border-bottom: 1px solid var(--line);
  backdrop-filter: blur(18px);
}
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  max-width: calc(100% - 56px);
}
.brand-avatar { width: 42px; height: 42px; flex: 0 0 auto; overflow: hidden; padding: 0; border: 1px solid var(--line); border-radius: 8px; background: transparent; cursor: pointer; }
.brand-avatar img { width: 100%; height: 100%; object-fit: cover; }
.brand-copy { min-width: 0; }
.brand-copy strong { display: block; color: var(--gold-soft); font-size: 16px; }
.brand-copy small { display: block; color: var(--muted); font-size: 12px; margin-top: 2px; }
.nav-menu { display: flex; align-items: center; gap: 8px; padding: 0; margin: 0; list-style: none; }
.nav-menu a {
  display: block;
  padding: 9px 12px;
  border: 1px solid transparent;
  border-radius: 999px;
  color: var(--muted);
  font-size: 14px;
}
.nav-menu a.active, .nav-menu a:hover {
  color: var(--gold-soft);
  border-color: var(--line);
  background: rgba(212, 167, 84, .08);
}
.nav-toggle { display: none; flex: 0 0 auto; }
.app-shell { width: min(1180px, calc(100% - 28px)); margin: 0 auto; padding: 28px 0 96px; }
.hero-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 380px);
  gap: 28px;
  align-items: end;
  padding: clamp(26px, 6vw, 64px);
  border: 1px solid var(--line);
  border-radius: 30px;
  background:
    linear-gradient(135deg, rgba(212, 167, 84, .1), transparent 36%),
    rgba(16, 15, 22, .82);
  box-shadow: 0 28px 90px rgba(0, 0, 0, .36);
}
.eyebrow {
  margin: 0 0 10px;
  color: var(--gold);
  font-size: 12px;
  letter-spacing: .18em;
  text-transform: uppercase;
}
h1, h2, h3, p { margin-top: 0; }
h1, h2, h3, p, a, span, dd, dt, blockquote {
  overflow-wrap: anywhere;
  word-break: break-word;
}
h1 { margin-bottom: 16px; font-size: clamp(32px, 8vw, 68px); line-height: 1.04; }
h2 { font-size: clamp(24px, 5vw, 38px); }
.hero-desc, .archive-card p, .settings-card p, .scroll-panel p, .split-panel p {
  color: var(--muted);
  line-height: 1.8;
}
.hero-actions { display: grid; gap: 12px; }
.hero-panel > *, .split-panel > *, .settings-card > *, .archive-card > * {
  min-width: 0;
}
.search-box {
  display: grid;
  gap: 8px;
  padding: 14px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: rgba(255,255,255,.035);
}
.search-box span { color: var(--gold); font-size: 12px; letter-spacing: .12em; }
.search-box input {
  width: 100%;
  color: var(--text);
  border: 0;
  outline: 0;
  background: transparent;
  font-size: 16px;
}
.search-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.search-categories button {
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 8px 12px;
  color: var(--muted);
  background: rgba(255,255,255,.035);
}
.search-categories button.active {
  color: #100b04;
  background: var(--gold-soft);
}
.search-results {
  display: grid;
  gap: 10px;
  max-height: 320px;
  overflow: auto;
  padding: 10px;
  border: 1px solid var(--line);
  border-radius: 20px;
  background: rgba(8,8,12,.78);
  box-shadow: 0 16px 44px rgba(0,0,0,.32);
}
.search-results[hidden] { display: none; }
.search-result {
  display: grid;
  gap: 4px;
  padding: 12px;
  border: 1px solid rgba(212, 167, 84, .14);
  border-radius: 16px;
  background: rgba(255,255,255,.035);
}
.search-result strong { color: var(--gold-soft); }
.search-result span {
  color: var(--gold);
  font-size: 12px;
  letter-spacing: .14em;
  text-transform: uppercase;
}
.search-result p {
  margin: 0;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.55;
}
.search-empty {
  margin: 0;
  padding: 12px;
  color: var(--muted);
}
.ghost-button, .wide-button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  min-height: 46px;
  padding: 0 18px;
  border: 1px solid var(--line);
  border-radius: 16px;
  color: var(--gold-soft);
  background: rgba(212, 167, 84, .08);
}
.danger-button {
  border-color: rgba(139, 46, 40, .58);
  color: #f3b7ae;
  background: rgba(139, 46, 40, .14);
}
.danger-button:hover {
  color: #fff6ef;
  background: rgba(139, 46, 40, .48);
}
.stats-grid, .feature-grid, .character-grid, .masonry-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-top: 22px;
}
.stats-grid div, .archive-card, .settings-card, .scroll-panel, .split-panel, .dossier {
  border: 1px solid var(--line);
  border-radius: 22px;
  background: var(--panel);
  box-shadow: 0 18px 50px rgba(0,0,0,.25);
  overflow: hidden;
}
.stats-grid div { padding: 22px; }
.stats-grid strong { display: block; color: var(--gold-soft); font-size: 32px; }
.stats-grid span { color: var(--muted); }
.section-head { margin: 46px 0 14px; }
.section-head.compact { margin: 30px 0 14px; }
.archive-card { position: relative; }
.archive-card > a { position: relative; display: block; overflow: hidden; }
.archive-card img { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; transition: transform .35s ease; }
.archive-card img[data-src], .official-media-card img[data-src] { background: #17171c; }
.archive-card:hover img { transform: scale(1.045); }
.card-kind {
  position: absolute;
  left: 12px;
  top: 12px;
  padding: 5px 9px;
  border-radius: 999px;
  color: #15110a;
  background: var(--gold-soft);
  font-size: 12px;
}
.card-body { padding: 16px; }
.demo-version-grid {
  grid-template-columns: minmax(0, 520px);
}
.demo-version-card > a {
  min-height: 260px;
  display: grid;
  align-content: stretch;
}
.demo-card-visual {
  min-height: 178px;
  display: grid;
  place-items: center;
  padding: 26px;
  color: var(--gold-soft);
  background:
    radial-gradient(circle at 28% 20%, rgba(244, 214, 128, .18), transparent 34%),
    linear-gradient(135deg, rgba(255,255,255,.08), rgba(255,255,255,.02));
  border-bottom: 1px solid rgba(212,167,84,.16);
}
.demo-card-visual span {
  display: grid;
  place-items: center;
  width: min(58vw, 210px);
  aspect-ratio: 1;
  border: 1px solid rgba(244,214,128,.32);
  border-radius: 50%;
  background: rgba(0,0,0,.22);
  font-size: clamp(42px, 8vw, 72px);
  font-family: Georgia, serif;
  letter-spacing: .08em;
  text-indent: .08em;
}
.demo-version-card .card-body {
  min-height: 118px;
}
.demo-plan-grid {
  margin-top: 28px;
}
.demo-checklist {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}
.demo-checklist label {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 10px 12px;
  border: 1px solid rgba(212,167,84,.14);
  border-radius: 14px;
  color: var(--muted);
  background: rgba(255,255,255,.025);
}
.demo-checklist input {
  accent-color: var(--gold);
}
.card-meta { margin-bottom: 8px; color: var(--gold)!important; font-size: 12px; }
.fav-button, .lightbox-action {
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 8px 12px;
  color: var(--gold-soft);
  background: rgba(212, 167, 84, .08);
}
.fav-button.active, .lightbox-action.active { background: var(--gold); color: #100b04; }
.split-panel {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  padding: 26px;
  margin-top: 28px;
}
.mini-list { display: grid; gap: 8px; }
.mini-list a { color: var(--muted); border-bottom: 1px solid rgba(255,255,255,.06); padding-bottom: 8px; }
.favorite-row {
  display: grid;
  gap: 7px;
  padding: 10px;
  border: 1px solid rgba(212,167,84,.12);
  border-radius: 14px;
  background: rgba(255,255,255,.028);
}
.favorite-row a {
  border-bottom: 0;
  padding-bottom: 0;
  color: var(--gold-soft);
}
.favorite-row p {
  margin: 0;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.55;
}
.favorite-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.favorite-tags em {
  border: 1px solid rgba(212,167,84,.16);
  border-radius: 999px;
  padding: 2px 7px;
  color: var(--gold);
  font-style: normal;
  font-size: 11px;
}
.favorite-row-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.favorite-row-actions button {
  border: 1px solid rgba(212,167,84,.16);
  border-radius: 999px;
  padding: 4px 9px;
  color: var(--muted);
  background: rgba(255,255,255,.035);
}
.personal-archive-panel {
  display: grid;
  gap: 22px;
}
.mini-title {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}
.mini-title h3 {
  margin: 0;
  color: var(--gold-soft);
  font-size: 18px;
}
.mini-title span {
  color: var(--muted);
  font-size: 12px;
}
.favorite-groups {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}
.favorite-groups button {
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 7px 10px;
  color: var(--muted);
  background: rgba(255,255,255,.035);
  font-size: 12px;
}
.favorite-groups button.active {
  color: #100b04;
  background: var(--gold-soft);
}
.dossier { padding: clamp(20px, 4vw, 34px); margin-top: 24px; }
.dossier blockquote {
  margin: 18px 0 0;
  padding-left: 16px;
  color: var(--gold-soft);
  border-left: 2px solid var(--gold);
}
.media-grid, .video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  margin-top: 18px;
}
.video-card { position: relative; padding: 12px; border: 1px solid var(--line); border-radius: 18px; background: rgba(0,0,0,.22); }
.video-card video { width: 100%; border-radius: 14px; background: #000; }
.official-timeline {
  position: relative;
  display: grid;
  gap: 26px;
  margin-top: 24px;
}
.official-timeline::before {
  content: "";
  position: absolute;
  top: 12px;
  bottom: 12px;
  left: 105px;
  width: 1px;
  background: linear-gradient(180deg, transparent, rgba(240, 215, 140, .48), transparent);
}
.official-post {
  position: relative;
  display: grid;
  grid-template-columns: 128px 1fr;
  gap: 28px;
  background: transparent;
}
.official-index {
  position: relative;
  display: grid;
  align-content: start;
  justify-items: end;
  gap: 7px;
  padding-top: 22px;
  color: var(--gold-soft);
  font-family: Georgia, serif;
}
.official-index::after {
  content: "";
  position: absolute;
  top: 29px;
  right: -39px;
  width: 13px;
  height: 13px;
  border: 2px solid var(--gold-soft);
  border-radius: 50%;
  background: #111116;
  box-shadow: 0 0 0 7px rgba(240, 215, 140, .08);
}
.official-index span {
  font-size: 15px;
  letter-spacing: .08em;
  white-space: nowrap;
}
.official-index small {
  color: var(--muted);
  font-size: 12px;
  letter-spacing: .16em;
}
.official-body {
  min-width: 0;
  padding: 24px;
  border: 1px solid var(--line);
  border-radius: 26px;
  background:
    linear-gradient(135deg, rgba(212, 167, 84, .1), transparent 42%),
    var(--panel);
  box-shadow: 0 18px 50px rgba(0,0,0,.25);
}
.official-body h2 {
  margin: 8px 0 12px;
}
.official-body blockquote {
  margin: 16px 0;
  padding: 12px 14px;
  border-left: 3px solid var(--gold);
  color: var(--gold-soft);
  background: rgba(212, 167, 84, .08);
}
.official-content {
  display: grid;
  gap: 8px;
  margin-top: 16px;
  padding: 16px;
  border: 1px solid rgba(212, 167, 84, .2);
  border-radius: 18px;
  background: rgba(0,0,0,.18);
}
.official-content p {
  margin: 0;
}
.official-label {
  color: var(--gold);
  font-size: 12px;
  letter-spacing: .16em;
  text-transform: uppercase;
}
.official-body ul {
  display: grid;
  gap: 8px;
  margin: 16px 0 0 18px;
  color: var(--muted);
  line-height: 1.7;
}
.official-media {
  display: grid;
  gap: 14px;
  margin-top: 18px;
}
.official-video-grid {
  display: grid;
  gap: 12px;
}
.official-video {
  position: relative;
  padding: 12px;
  border: 1px solid var(--line);
  border-radius: 20px;
  background: rgba(0,0,0,.24);
}
.official-video video {
  display: block;
  width: 100%;
  max-height: 62vh;
  border-radius: 16px;
  background: #000;
}
.official-video p {
  margin-top: 10px;
  color: var(--gold-soft);
}
.native-video-button {
  position: absolute;
  top: 22px;
  right: 22px;
  z-index: 3;
  border: 1px solid rgba(246, 217, 139, .45);
  border-radius: 999px;
  padding: 8px 14px;
  color: #100b04;
  background: rgba(246, 217, 139, .92);
  font-size: 13px;
  letter-spacing: .08em;
  box-shadow: 0 10px 26px rgba(0,0,0,.32);
}
.video-card .native-video-button {
  top: 20px;
  right: 20px;
}
.official-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
}
.official-media-card {
  position: relative;
  min-height: 132px;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: rgba(255,255,255,.035);
}
.official-media-card img {
  width: 100%;
  height: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  transition: transform .35s ease;
}
.official-media-card:hover img {
  transform: scale(1.045);
}
.official-media-card span {
  position: absolute;
  left: 8px;
  right: 8px;
  bottom: 8px;
  padding: 6px 8px;
  border-radius: 999px;
  color: var(--text);
  background: rgba(0,0,0,.64);
  font-size: 12px;
}
.official-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-top: 18px;
}
.official-source {
  color: var(--muted);
  font-size: 13px;
}
.filter-row { display: flex; flex-wrap: wrap; gap: 10px; margin: 24px 0; }
.filter-row button {
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 10px 14px;
  color: var(--muted);
  background: rgba(255,255,255,.035);
}
.filter-row button.active { color: #100b04; background: var(--gold-soft); }
.masonry-grid { grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); }
.artist-summary { display: flex; flex-wrap: wrap; gap: 10px; margin: 24px 0; }
.artist-summary a {
  padding: 9px 12px;
  border: 1px solid var(--line);
  border-radius: 999px;
  color: var(--muted);
}
.artist-summary span { margin-left: 8px; color: var(--gold); }
.scroll-panel { padding: 26px; margin-top: 28px; }
.settings-grid { display: grid; grid-template-columns: 1fr; gap: 18px; margin-top: 24px; }
.settings-card { padding: 24px; }
.profile-workspace {
  display: grid;
  grid-template-columns: minmax(230px, .72fr) minmax(0, 1.5fr);
  gap: 18px;
  margin-top: 24px;
}
.profile-identity, .profile-editor {
  border: 1px solid var(--line);
  border-radius: 8px;
  background: rgba(16, 16, 21, .9);
}
.profile-identity {
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 32px 24px;
  text-align: center;
}
.profile-avatar-button {
  width: 116px;
  height: 116px;
  overflow: hidden;
  border: 1px solid rgba(240, 215, 140, .4);
  border-radius: 50%;
  color: #17110a;
  background: var(--gold-soft);
  font-size: 42px;
  cursor: pointer;
}
.profile-avatar-button img { width: 100%; height: 100%; object-fit: cover; }
.profile-identity strong { margin-top: 18px; color: var(--gold-soft); font-size: 22px; }
.profile-number { margin-top: 7px; color: var(--gold); font: 13px Consolas, monospace; }
.profile-identity p { margin: 18px 0 0; color: var(--muted); line-height: 1.7; }
.profile-editor { padding: 28px; }
.profile-section-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.profile-section-head h2 { margin-bottom: 8px; }
.profile-save-state { color: var(--muted); font-size: 12px; }
.profile-field { display: grid; gap: 8px; margin-top: 16px; color: var(--gold); font-size: 13px; }
.profile-field input, .profile-field textarea {
  width: 100%;
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 12px 14px;
  outline: none;
  color: var(--text);
  background: rgba(255,255,255,.035);
  resize: vertical;
}
.profile-field input:focus, .profile-field textarea:focus { border-color: rgba(240,215,140,.58); }
.profile-actions { display: grid; grid-template-columns: 1.4fr 1fr 1fr; gap: 10px; margin-top: 22px; }
.profile-actions .wide-button { margin-top: 0; }
.profile-primary { color: #15110a; background: var(--gold-soft); font-weight: 700; }
.profile-cloud-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-top: 18px; padding-top: 18px; border-top: 1px solid var(--line); }
.profile-cloud-row p { margin: 5px 0 0; color: var(--muted); font-size: 13px; }
.profile-cloud-row button { min-height: 40px; border: 1px solid var(--line); border-radius: 6px; padding: 0 14px; color: var(--muted); background: transparent; }
.performance-page-hidden { display: none!important; }
.load-more-row { display: flex; justify-content: center; margin: 22px 0; }
.load-more-row button { min-width: 180px; min-height: 44px; border: 1px solid var(--line); border-radius: 6px; color: var(--gold-soft); background: rgba(212,167,84,.08); }
.settings-card dl { display: grid; grid-template-columns: 120px 1fr; gap: 12px; color: var(--muted); }
.settings-card dt { color: var(--gold); }
.settings-note { margin: 14px 0 0; font-size: 13px; }
.orientation-options {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}
.video-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  margin-top: 14px;
}
.audio-options {
  display: grid;
  grid-template-columns: minmax(160px, 220px) 1fr;
  gap: 14px;
  align-items: center;
  margin-top: 14px;
}
.audio-toggle-row {
  grid-auto-columns: minmax(0, 1fr);
  min-width: 0;
}
.orientation-options .wide-button,
.video-options .wide-button,
.audio-options .wide-button {
  margin-top: 0;
}
.orientation-options .wide-button.active,
.video-options .wide-button.active,
.audio-options .wide-button.active {
  color: #100b04;
  background: var(--gold-soft);
}
.desktop-combo {
  display: grid;
  grid-template-columns: minmax(96px, 150px) 1fr;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  padding: 10px;
  border: 1px solid rgba(212, 167, 84, .16);
  border-radius: 16px;
  background: rgba(255,255,255,.026);
}
.desktop-combo > span {
  color: var(--gold);
  font-size: 13px;
  letter-spacing: .08em;
}
.editor-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 16px;
}
.editor-grid label {
  display: grid;
  gap: 8px;
  color: var(--gold);
  font-size: 13px;
}
.editor-grid select,
.editor-json {
  width: 100%;
  border: 1px solid rgba(212,167,84,.18);
  border-radius: 14px;
  color: var(--text);
  background: rgba(255,255,255,.045);
}
.editor-grid select {
  min-height: 44px;
  padding: 0 12px;
}
.editor-json {
  min-height: 260px;
  margin-top: 14px;
  padding: 14px;
  font: 12px Consolas, "Microsoft YaHei", monospace;
  line-height: 1.6;
  resize: vertical;
}
.segmented-actions {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  gap: 8px;
}
.segmented-actions button {
  min-height: 40px;
  border: 1px solid var(--line);
  border-radius: 12px;
  color: var(--gold-soft);
  background: rgba(212, 167, 84, .08);
}
.segmented-actions button.active,
.segmented-actions button:hover {
  color: #100b04;
  background: var(--gold-soft);
}
.desktop-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  margin-top: 12px;
}
.desktop-options .wide-button {
  margin-top: 0;
}
.range-control {
  display: grid;
  gap: 8px;
  color: var(--muted);
}
.range-control input {
  width: 100%;
  accent-color: var(--gold);
}
.music-detail-panel {
  margin-top: 12px;
  padding: 14px;
  border: 1px solid rgba(212, 167, 84, .16);
  border-radius: 16px;
  background: rgba(255,255,255,.026);
}
.music-detail-panel p {
  margin: 0 0 10px;
}
.music-detail-panel ol {
  display: grid;
  gap: 8px;
  margin: 0;
  padding-left: 22px;
  color: var(--muted);
}
.music-detail-panel li.active {
  color: var(--gold-soft);
  text-shadow: 0 0 16px rgba(240,215,140,.22);
}
.wide-button { width: 100%; margin-top: 10px; }
.archive-footer {
  width: min(1180px, calc(100% - 28px));
  margin: 0 auto;
  padding: 26px 0 110px;
  color: rgba(238, 228, 210, .45);
  font-size: 12px;
  line-height: 1.8;
  text-align: center;
  border-top: 1px solid var(--line);
}
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: none;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0;
  background: rgba(0,0,0,.96);
}
.lightbox.active { display: flex; }
.lightbox img {
  width: auto;
  height: auto;
  max-width: 100vw;
  max-height: 100vh;
  object-fit: contain;
  border-radius: 0;
  cursor: grab;
  touch-action: none;
  transform-origin: center center;
  transition: transform .16s ease;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}
.lightbox-close, .lightbox-action { position: fixed; top: 18px; }
.lightbox-close { right: 18px; width: 44px; height: 44px; border-radius: 50%; border: 1px solid var(--line); color: var(--text); background: rgba(0,0,0,.5); font-size: 28px; }
.lightbox-action { left: 18px; }
.lightbox-save { left: 104px; }
#lightboxCaption {
  position: fixed;
  right: 18px;
  bottom: 18px;
  left: 18px;
  margin: 0;
  color: var(--muted);
  text-align: center;
  text-shadow: 0 2px 8px rgba(0,0,0,.72);
}
html.lightbox-open, html.lightbox-open body { overflow: hidden; }
.is-hidden { display: none!important; }
@media (max-width: 820px) {
  .archive-nav { align-items: flex-start; }
  .nav-toggle { display: block; border: 1px solid var(--line); border-radius: 12px; color: var(--gold-soft); background: transparent; padding: 8px 10px; }
  .nav-menu { display: none; position: absolute; top: 66px; right: 14px; flex-direction: column; min-width: 180px; padding: 12px; border: 1px solid var(--line); border-radius: 18px; background: rgba(10,10,15,.96); }
  .nav-menu.show { display: flex; }
  .hero-panel, .split-panel { grid-template-columns: 1fr; }
  .profile-workspace { grid-template-columns: 1fr; }
  .profile-actions { grid-template-columns: 1fr; }
  .stats-grid, .feature-grid, .character-grid { grid-template-columns: 1fr 1fr; }
  .settings-card dl { grid-template-columns: 1fr; }
  .desktop-combo { grid-template-columns: 1fr; }
  .segmented-actions { grid-auto-flow: row; }
  .orientation-options, .video-options, .audio-options { grid-template-columns: 1fr; }
  .official-timeline::before { left: 18px; }
  .official-post {
    grid-template-columns: 1fr;
    padding-left: 38px;
  }
  .official-index {
    justify-items: start;
    min-height: 0;
    padding-top: 0;
  }
  .official-index::after {
    top: 5px;
    left: -26px;
    right: auto;
  }
  .official-body { padding: 22px; }
}
@media (orientation: landscape) and (max-height: 620px) {
  .archive-nav {
    padding: 10px clamp(14px, 3vw, 28px);
  }
  .brand-avatar {
    width: 36px;
    height: 36px;
  }
  .brand-copy small {
    display: none;
  }
  .app-shell {
    width: min(1280px, calc(100% - 24px));
    padding: 16px 0 72px;
  }
  .hero-panel {
    grid-template-columns: minmax(0, 1.25fr) minmax(280px, .75fr);
    gap: 18px;
    min-height: calc(100vh - 126px);
    padding: clamp(20px, 4vw, 38px);
    align-items: center;
  }
  .hero-panel h1 {
    font-size: clamp(34px, 6vw, 58px);
  }
  .stats-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin-top: 14px;
  }
  .stats-grid div {
    padding: 16px;
  }
  .feature-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .official-timeline {
    display: grid;
    grid-template-columns: minmax(150px, .32fr) minmax(0, 1fr);
    gap: 18px;
  }
  .official-timeline::before {
    left: min(142px, 22vw);
  }
  .official-post {
    grid-column: 1 / -1;
    grid-template-columns: minmax(130px, .3fr) minmax(0, 1fr);
    min-height: 0;
  }
  .official-body {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(220px, .75fr);
    gap: 18px;
    align-items: start;
  }
  .official-body > .official-media-grid {
    margin-top: 0;
  }
  .character-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .character-card, .archive-card {
    min-height: 0;
  }
  .lightbox {
    align-items: center;
    justify-content: center;
    padding: 10px 74px;
  }
  .lightbox img {
    max-width: calc(100vw - 160px);
    max-height: calc(100vh - 28px);
  }
  .lightbox-close {
    right: 18px;
    top: 18px;
  }
  .lightbox-action {
    left: 18px;
    top: 18px;
  }
  .lightbox-save {
    left: 18px;
    top: 72px;
  }
  #lightboxCaption {
    left: auto;
    right: 18px;
    bottom: 18px;
    max-width: 38vw;
    text-align: right;
  }
}
@media (max-width: 520px) {
  .app-shell { width: calc(100% - 24px); padding-top: 24px; }
  .hero-panel { padding: 26px 22px; border-radius: 24px; overflow: hidden; }
  h1 { font-size: clamp(30px, 9vw, 36px); }
  h2 { font-size: clamp(26px, 8vw, 32px); }
  h1, h2, .settings-card dd {
    line-break: anywhere;
    word-break: break-all;
  }
  .stats-grid, .feature-grid, .character-grid, .masonry-grid { grid-template-columns: 1fr; }
}
`);

writeFileSync(join(assetsRoot, 'app-ui.js'), `(function () {
  'use strict';

  var favoritesKey = 'zhushen:favorites:v1';
  var recentKey = 'zhushen:recent:v1';
  var favoriteGroupKey = 'zhushen:favorite-group:v1';
  var searchSections = ${JSON.stringify(searchSections)};
  var favoriteGroups = ${JSON.stringify(favoriteGroups)};
  var globalSearchIndex = ${JSON.stringify(buildSearchIndex())};

  function readList(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch (error) {
      return [];
    }
  }

  function writeList(key, list) {
    localStorage.setItem(key, JSON.stringify(list.slice(0, 80)));
  }

  function normalizeFavorite(item) {
    var source = item && typeof item === 'object' ? item : {};
    return {
      schemaVersion: 2,
      id: String(source.id || ''),
      title: String(source.title || '收藏'),
      href: String(source.href || 'zy.html'),
      note: String(source.note || ''),
      tags: Array.isArray(source.tags) ? source.tags.filter(Boolean).map(String).slice(0, 8) : [],
      pinned: source.pinned === true,
      createdAt: source.createdAt || source.updatedAt || new Date().toISOString(),
      updatedAt: source.updatedAt || new Date().toISOString()
    };
  }

  function readFavorites() {
    var migrated = false;
    var list = readList(favoritesKey).map(function (item) {
      var normalized = normalizeFavorite(item);
      if (!item || item.schemaVersion !== normalized.schemaVersion) {
        migrated = true;
      }
      return normalized;
    }).filter(function (item) {
      return item.id;
    });
    list.sort(function (a, b) {
      if (a.pinned !== b.pinned) {
        return a.pinned ? -1 : 1;
      }
      return String(b.updatedAt).localeCompare(String(a.updatedAt));
    });
    if (migrated) {
      writeList(favoritesKey, list);
    }
    return list;
  }

  function writeFavorites(list) {
    writeList(favoritesKey, list.map(normalizeFavorite));
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function findFavorite(id) {
    return readFavorites().find(function (item) {
      return item.id === id;
    });
  }

  function toggleFavorite(id, title, href) {
    var list = readFavorites();
    var index = list.findIndex(function (item) { return item.id === id; });
    if (index >= 0) {
      list.splice(index, 1);
    } else {
      list.unshift(normalizeFavorite({
        id: id,
        title: title,
        href: href,
        updatedAt: new Date().toISOString()
      }));
    }
    writeFavorites(list);
    syncFavorites();
  }

  function favoriteGroupForId(id) {
    if (id.indexOf('official-media:') === 0 || id.indexOf('image:') === 0 || id.indexOf('lightbox:') === 0) {
      return '图片';
    }
    if (id.indexOf('official:') === 0) {
      return '官方发布';
    }
    if (id.indexOf('character:') === 0) {
      return '角色';
    }
    if (id.indexOf('concept:') === 0) {
      return '概念';
    }
    if (id.indexOf('fanart:') === 0) {
      return '二创';
    }
    if (id.indexOf('joke:') === 0) {
      return '笑话';
    }
    return '全部收藏';
  }

  function getActiveFavoriteGroup() {
    var group = localStorage.getItem(favoriteGroupKey) || '全部收藏';
    return favoriteGroups.indexOf(group) >= 0 ? group : '全部收藏';
  }

  function setActiveFavoriteGroup(group) {
    localStorage.setItem(favoriteGroupKey, favoriteGroups.indexOf(group) >= 0 ? group : '全部收藏');
  }

  function filteredFavorites(list, group) {
    if (group === '全部收藏') {
      return list;
    }
    return list.filter(function (item) {
      return favoriteGroupForId(item.id || '') === group;
    });
  }

  function renderFavoriteTags(tags) {
    if (!tags || tags.length === 0) {
      return '';
    }
    return '<span class="favorite-tags">' + tags.map(function (tag) {
      return '<em>' + escapeHtml(tag) + '</em>';
    }).join('') + '</span>';
  }

  function syncFavorites() {
    var list = readFavorites();
    var ids = list.map(function (item) { return item.id; });
    var activeGroup = getActiveFavoriteGroup();
    document.querySelectorAll('[data-favorite]').forEach(function (button) {
      button.classList.toggle('active', ids.indexOf(button.dataset.favorite) >= 0);
      button.textContent = ids.indexOf(button.dataset.favorite) >= 0 ? '已收藏' : '收藏';
    });
    document.querySelectorAll('[data-favorite-groups]').forEach(function (node) {
      node.innerHTML = favoriteGroups.map(function (group) {
        return '<button type="button" class="' + (group === activeGroup ? 'active' : '') + '" data-favorite-group="' + group + '">' + group + '</button>';
      }).join('');
    });
    document.querySelectorAll('[data-favorite-list]').forEach(function (node) {
      var shownList = filteredFavorites(list, activeGroup);
      if (list.length === 0) {
        node.innerHTML = '<p>暂无收藏。点资料卡片里的收藏按钮后，会在这里显示。</p>';
        return;
      }
      if (shownList.length === 0) {
        node.innerHTML = '<p>当前分组暂无收藏。</p>';
        return;
      }
      node.innerHTML = shownList.slice(0, 8).map(function (item) {
        return '<article class="favorite-row">'
          + '<a href="' + escapeHtml(item.href) + '">' + escapeHtml(item.title) + '</a>'
          + renderFavoriteTags(item.tags)
          + (item.note ? '<p>' + escapeHtml(item.note) + '</p>' : '')
          + '<div class="favorite-row-actions">'
          + '<button type="button" data-favorite-edit="' + escapeHtml(item.id) + '">备注</button>'
          + '<button type="button" data-favorite-pin="' + escapeHtml(item.id) + '">' + (item.pinned ? '取消置顶' : '置顶') + '</button>'
          + '</div></article>';
      }).join('');
    });
  }

  function editFavorite(id) {
    var list = readFavorites();
    var index = list.findIndex(function (item) { return item.id === id; });
    if (index < 0) {
      return;
    }
    var current = list[index];
    var note = window.prompt('收藏备注', current.note || '');
    if (note === null) {
      return;
    }
    var tagInput = window.prompt('收藏标签，用逗号分隔', current.tags.join(','));
    if (tagInput === null) {
      return;
    }
    list[index] = normalizeFavorite({
      ...current,
      note: note.trim(),
      tags: tagInput.split(/[,，]/).map(function (tag) { return tag.trim(); }).filter(Boolean),
      updatedAt: new Date().toISOString()
    });
    writeFavorites(list);
    syncFavorites();
  }

  function toggleFavoritePin(id) {
    var list = readFavorites();
    var index = list.findIndex(function (item) { return item.id === id; });
    if (index < 0) {
      return;
    }
    list[index] = normalizeFavorite({
      ...list[index],
      pinned: !list[index].pinned,
      updatedAt: new Date().toISOString()
    });
    writeFavorites(list);
    syncFavorites();
  }

  function installFavorites() {
    document.addEventListener('click', function (event) {
      var button = event.target.closest('[data-favorite]');
      if (!button) {
        var editButton = event.target.closest('[data-favorite-edit]');
        if (editButton) {
          event.preventDefault();
          editFavorite(editButton.dataset.favoriteEdit);
          return;
        }
        var pinButton = event.target.closest('[data-favorite-pin]');
        if (pinButton) {
          event.preventDefault();
          toggleFavoritePin(pinButton.dataset.favoritePin);
          return;
        }
        var groupButton = event.target.closest('[data-favorite-group]');
        if (!groupButton) {
          return;
        }
        setActiveFavoriteGroup(groupButton.dataset.favoriteGroup);
        syncFavorites();
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      var card = button.closest('.archive-card');
      var title = card ? card.querySelector('h3').textContent : '收藏';
      var link = card && card.querySelector('a') ? card.querySelector('a') : null;
      var href = link ? link.getAttribute('href') : location.pathname.split('/').pop();
      toggleFavorite(button.dataset.favorite, title, href);
    });
    syncFavorites();
  }

  function installSearch() {
    document.querySelectorAll('[data-search]').forEach(function (input) {
      if (input.dataset.searchReady === 'true') {
        return;
      }
      input.dataset.searchReady = 'true';
      var actions = input.closest('.hero-actions');
      if (actions && input.dataset.search === 'global') {
        actions.querySelectorAll('[data-search-section]').forEach(function (button) {
          button.addEventListener('click', function () {
            actions.querySelectorAll('[data-search-section]').forEach(function (item) {
              item.classList.remove('active');
            });
            button.classList.add('active');
            runSearch(input);
          });
        });
      }
      input.addEventListener('input', function () {
        runSearch(input);
      });
    });
  }

  function getActiveSearchSection(input) {
    var actions = input.closest('.hero-actions');
    var active = actions ? actions.querySelector('[data-search-section].active') : null;
    return active ? active.dataset.searchSection : '全部';
  }

  function runSearch(input) {
    var keyword = input.value.trim().toLowerCase();
    var results = input.closest('.hero-actions')
      ? input.closest('.hero-actions').querySelector('[data-search-results]')
      : null;
    var visibleCount = 0;
    document.querySelectorAll('[data-search-text]').forEach(function (node) {
      var text = node.dataset.searchText.toLowerCase();
      var matched = !keyword || text.indexOf(keyword) >= 0;
      node.classList.toggle('is-hidden', !matched);
      if (matched && keyword) {
        visibleCount += 1;
      }
    });
    if (!results) {
      return;
    }
    if (!keyword) {
      results.hidden = true;
      results.innerHTML = '';
      return;
    }
    if (input.dataset.search === 'global') {
      renderGlobalSearchResults(results, keyword, getActiveSearchSection(input));
      return;
    }
    results.hidden = false;
    results.innerHTML = visibleCount > 0
      ? '<p class="search-empty">当前页面命中 ' + visibleCount + ' 条资料。</p>'
      : '<p class="search-empty">当前页面没有找到匹配内容。</p>';
  }

  function renderGlobalSearchResults(results, keyword, section) {
    var hits = globalSearchIndex.filter(function (item) {
      var sectionMatched = section === '全部' || item.section === section;
      return sectionMatched && item.text.toLowerCase().indexOf(keyword) >= 0;
    }).slice(0, 10);
    results.hidden = false;
    if (hits.length === 0) {
      results.innerHTML = '<p class="search-empty">没有找到匹配内容。</p>';
      return;
    }
    results.innerHTML = hits.map(function (item) {
      return '<a class="search-result" href="' + item.href + '">'
        + '<span>' + item.section + '</span>'
        + '<strong>' + item.title + '</strong>'
        + '<p>' + item.desc + '</p>'
        + '</a>';
    }).join('');
  }

  function syncRecent() {
    var enabled = localStorage.getItem('zhushen_recent_history_enabled') !== 'false';
    var list = readList(recentKey);
    document.querySelectorAll('[data-recent-list]').forEach(function (node) {
      if (!enabled) {
        node.innerHTML = '<p>最近浏览记录已关闭，可在设置页重新开启。</p>';
        return;
      }
      if (list.length === 0) {
        node.innerHTML = '<p>暂无最近浏览。打开几个档案页面后会显示在这里。</p>';
        return;
      }
      node.innerHTML = list.slice(0, 6).map(function (item) {
        return '<a href="' + item.href + '">' + item.title + '</a>';
      }).join('');
    });
  }

  function installFilters() {
    document.querySelectorAll('[data-filter-group]').forEach(function (group) {
      var buttons = Array.from(group.querySelectorAll('[data-filter]'));
      buttons.forEach(function (button, index) {
        if (index === 0) {
          button.classList.add('active');
        }
        button.addEventListener('click', function () {
          buttons.forEach(function (item) { item.classList.remove('active'); });
          button.classList.add('active');
          var filter = button.dataset.filter;
          document.querySelectorAll('.archive-card, .official-post').forEach(function (card) {
            var kind = card.dataset.kind || '';
            var text = card.dataset.searchText || '';
            var visible = filter === '全部' || kind.indexOf(filter) >= 0 || text.indexOf(filter) >= 0;
            card.classList.toggle('is-hidden', !visible);
          });
        });
      });
    });
  }

  function installLightbox() {
    var box = document.getElementById('lightbox');
    var image = document.getElementById('lightboxImg');
    var caption = document.getElementById('lightboxCaption');
    var current = null;
    var pointers = new Map();
    var transform = {scale: 1, x: 0, y: 0};
    var lastTapAt = 0;
    var longPressTimer = 0;
    var pinchStart = null;
    if (!box || !image) {
      return;
    }
    document.addEventListener('click', function (event) {
      var link = event.target.closest('[data-lightbox-src]');
      if (!link) {
        return;
      }
      event.preventDefault();
      current = {
        src: link.dataset.lightboxSrc,
        title: getLightboxTitle(link)
      };
      image.src = current.src;
      image.alt = current.title;
      caption.textContent = current.title;
      resetTransform();
      box.classList.add('active');
      box.setAttribute('aria-hidden', 'false');
      document.documentElement.classList.add('lightbox-open');
    });
    document.querySelectorAll('[data-lightbox-close]').forEach(function (button) {
      button.addEventListener('click', close);
    });
    box.addEventListener('click', function (event) {
      if (event.target === box) {
        close();
      }
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        close();
      }
    });
    document.querySelectorAll('[data-favorite-current]').forEach(function (button) {
      button.addEventListener('click', function () {
        if (current) {
          toggleFavorite('lightbox:' + current.src, current.title, current.src);
        }
      });
    });
    document.querySelectorAll('[data-save-current]').forEach(function (button) {
      button.addEventListener('click', function () {
        saveCurrentImage();
      });
    });
    image.addEventListener('pointerdown', function (event) {
      if (!current) {
        return;
      }
      image.setPointerCapture(event.pointerId);
      image.style.cursor = 'grabbing';
      pointers.set(event.pointerId, pointerFromEvent(event));
      if (pointers.size === 1) {
        startLongPress();
      }
      if (pointers.size === 2) {
        window.clearTimeout(longPressTimer);
        pinchStart = createPinchStart();
      }
    });
    image.addEventListener('pointermove', function (event) {
      if (!pointers.has(event.pointerId)) {
        return;
      }
      var previous = pointers.get(event.pointerId);
      var next = pointerFromEvent(event);
      pointers.set(event.pointerId, next);
      window.clearTimeout(longPressTimer);
      if (pointers.size === 1 && transform.scale > 1) {
        transform.x += next.x - previous.x;
        transform.y += next.y - previous.y;
        applyTransform();
        return;
      }
      if (pointers.size >= 2 && pinchStart) {
        applyPinchTransform();
      }
    });
    image.addEventListener('pointerup', endPointer);
    image.addEventListener('pointercancel', endPointer);
    image.addEventListener('dblclick', function (event) {
      event.preventDefault();
      resetTransform();
    });
    image.addEventListener('click', function (event) {
      var now = Date.now();
      if (now - lastTapAt < 280) {
        event.preventDefault();
        resetTransform();
      }
      lastTapAt = now;
    });
    function close() {
      box.classList.remove('active');
      box.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('lightbox-open');
      image.removeAttribute('src');
      image.removeAttribute('alt');
      pointers.clear();
      window.clearTimeout(longPressTimer);
      pinchStart = null;
      resetTransform();
    }

    function pointerFromEvent(event) {
      return {id: event.pointerId, x: event.clientX, y: event.clientY};
    }

    function endPointer(event) {
      if (pointers.has(event.pointerId)) {
        pointers.delete(event.pointerId);
      }
      window.clearTimeout(longPressTimer);
      image.style.cursor = 'grab';
      pinchStart = pointers.size >= 2 ? createPinchStart() : null;
    }

    function startLongPress() {
      window.clearTimeout(longPressTimer);
      longPressTimer = window.setTimeout(function () {
        saveCurrentImage();
      }, 650);
    }

    function createPinchStart() {
      var values = Array.from(pointers.values()).slice(0, 2);
      if (values.length < 2) {
        return null;
      }
      return {
        distance: distance(values[0], values[1]),
        center: center(values[0], values[1]),
        scale: transform.scale,
        x: transform.x,
        y: transform.y
      };
    }

    function applyPinchTransform() {
      var values = Array.from(pointers.values()).slice(0, 2);
      if (!pinchStart || values.length < 2 || pinchStart.distance <= 0) {
        return;
      }
      var nextCenter = center(values[0], values[1]);
      var nextDistance = distance(values[0], values[1]);
      transform.scale = clamp(
        pinchStart.scale * (nextDistance / pinchStart.distance),
        1,
        4
      );
      transform.x = pinchStart.x + nextCenter.x - pinchStart.center.x;
      transform.y = pinchStart.y + nextCenter.y - pinchStart.center.y;
      if (transform.scale === 1) {
        transform.x = 0;
        transform.y = 0;
      }
      applyTransform();
    }

    function distance(first, second) {
      var deltaX = first.x - second.x;
      var deltaY = first.y - second.y;
      return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    }

    function center(first, second) {
      return {
        x: (first.x + second.x) / 2,
        y: (first.y + second.y) / 2
      };
    }

    function clamp(value, min, max) {
      return Math.min(max, Math.max(min, value));
    }

    function resetTransform() {
      transform = {scale: 1, x: 0, y: 0};
      applyTransform();
    }

    function applyTransform() {
      image.style.transform = 'translate3d('
        + transform.x
        + 'px, '
        + transform.y
        + 'px, 0) scale('
        + transform.scale
        + ')';
    }

    function saveCurrentImage() {
      if (!current || !current.src) {
        return;
      }
      if (window.Android && typeof window.Android.saveImage === 'function') {
        window.Android.saveImage(new URL(current.src, location.href).href);
        return;
      }
      var link = document.createElement('a');
      link.href = current.src;
      link.download = current.title || 'zhushen-image';
      document.body.appendChild(link);
      link.click();
      link.remove();
    }

    function getLightboxTitle(link) {
      var archiveCard = link.closest('.archive-card');
      var officialPost = link.closest('.official-post');
      var titleNode = archiveCard ? archiveCard.querySelector('h3') : null;
      var postTitleNode = officialPost ? officialPost.querySelector('h2') : null;
      var labelNode = link.querySelector('span');
      var imageNode = link.querySelector('img');
      var archiveTitle = titleNode ? titleNode.textContent : '';
      var officialTitle = postTitleNode ? postTitleNode.textContent : '';
      var mediaTitle = labelNode
        ? labelNode.textContent
        : imageNode
          ? imageNode.alt
          : '';
      var title = [officialTitle, mediaTitle].filter(Boolean).join(' · ');
      return title || archiveTitle || mediaTitle || '图片预览';
    }
  }

  function installNavigation() {
    document.querySelectorAll('[data-nav-toggle]').forEach(function (button) {
      button.addEventListener('click', function () {
        var menu = document.querySelector('[data-nav-menu]');
        if (menu) {
          menu.classList.toggle('show');
        }
      });
    });
  }

  function installNativeVideoBridge() {
    var canUseNativeVideo = !!(window.Android && window.Android.openNativeVideo);
    document.querySelectorAll('[data-native-video-src]').forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        if (canUseNativeVideo) {
          try {
            window.Android.openNativeVideo(
              button.dataset.nativeVideoSrc,
              button.dataset.nativeVideoTitle || '视频播放'
            );
            return;
          } catch (error) {
            canUseNativeVideo = false;
          }
        }
        var article = button.closest('article');
        var video = article ? article.querySelector('video') : null;
        if (video) {
          video.play();
        }
      });
    });
    if (!canUseNativeVideo) {
      return;
    }
    document.querySelectorAll('video').forEach(function (video) {
      video.addEventListener('click', function (event) {
        var sourceNode = video.querySelector('source');
        var source = video.currentSrc || (sourceNode ? sourceNode.getAttribute('src') : '');
        if (!source) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        video.pause();
        window.Android.openNativeVideo(source, getVideoTitle(video));
      }, true);
    });

    function getVideoTitle(video) {
      var article = video.closest('article');
      var label = article ? article.querySelector('p') : null;
      var post = video.closest('.official-post');
      var title = post ? post.querySelector('h2') : null;
      return [title ? title.textContent : '', label ? label.textContent : '']
        .filter(Boolean)
        .join(' · ') || '视频播放';
    }
  }

  function installSettings() {
    var orientationLabels = {
      portrait: '竖屏',
      landscape: '横屏',
      auto: '横竖切换'
    };
    var splashVideoLabels = ${JSON.stringify(Object.fromEntries(splashVideos))};
    var splashEntryLabels = {
      skippable: '可点击跳过',
      complete: '播放完进入'
    };

    function getOrientationMode() {
      if (window.Android && typeof window.Android.getOrientationMode === 'function') {
        return window.Android.getOrientationMode();
      }
      return localStorage.getItem('zhushen_orientation_mode') || 'auto';
    }

    function setOrientationMode(mode) {
      if (window.Android && typeof window.Android.setOrientationMode === 'function') {
        window.Android.setOrientationMode(mode);
        return;
      }
      localStorage.setItem('zhushen_orientation_mode', mode);
    }

    function syncOrientationControls() {
      var mode = getOrientationMode();
      document.querySelectorAll('[data-orientation-option]').forEach(function (button) {
        button.classList.toggle('active', button.dataset.orientationOption === mode);
      });
      document.querySelectorAll('[data-orientation-status]').forEach(function (node) {
        node.textContent = '当前方向：' + (orientationLabels[mode] || '横竖切换');
      });
    }

    function getSplashVideoMode() {
      if (window.Android && typeof window.Android.getSplashVideoMode === 'function') {
        return window.Android.getSplashVideoMode();
      }
      return localStorage.getItem('zhushen_splash_video_mode') || 'random';
    }

    function setSplashVideoMode(mode) {
      if (window.Android && typeof window.Android.setSplashVideoMode === 'function') {
        window.Android.setSplashVideoMode(mode);
        return;
      }
      localStorage.setItem('zhushen_splash_video_mode', mode);
    }

    function syncSplashVideoControls() {
      var mode = getSplashVideoMode();
      document.querySelectorAll('[data-splash-video-option]').forEach(function (button) {
        button.classList.toggle('active', button.dataset.splashVideoOption === mode);
      });
      document.querySelectorAll('[data-splash-video-status]').forEach(function (node) {
        node.textContent = '当前视频：' + (splashVideoLabels[mode] || '随机播放');
      });
    }

    function getSplashEntryMode() {
      return localStorage.getItem('zhushen_splash_entry_mode') || 'skippable';
    }

    function setSplashEntryMode(mode) {
      localStorage.setItem('zhushen_splash_entry_mode', mode);
    }

    function syncSplashEntryControls() {
      var mode = getSplashEntryMode();
      document.querySelectorAll('[data-splash-entry-mode]').forEach(function (button) {
        button.classList.toggle('active', button.dataset.splashEntryMode === mode);
      });
      document.querySelectorAll('[data-splash-entry-status]').forEach(function (node) {
        node.textContent = '进入方式：' + (splashEntryLabels[mode] || '可点击跳过');
      });
    }

    function isBackgroundMusicEnabled() {
      if (window.Android && typeof window.Android.isBackgroundMusicEnabled === 'function') {
        return window.Android.isBackgroundMusicEnabled();
      }
      return localStorage.getItem('zhushen_background_music_enabled') !== 'false';
    }

    function setBackgroundMusicEnabled(enabled) {
      if (window.Android && typeof window.Android.setBackgroundMusicEnabled === 'function') {
        window.Android.setBackgroundMusicEnabled(enabled);
        return;
      }
      localStorage.setItem('zhushen_background_music_enabled', String(enabled));
    }

    function getBackgroundMusicVolume() {
      if (window.Android && typeof window.Android.getBackgroundMusicVolume === 'function') {
        return window.Android.getBackgroundMusicVolume();
      }
      return Number(localStorage.getItem('zhushen_background_music_volume') || '45');
    }

    function setBackgroundMusicVolume(percent) {
      var normalizedPercent = Math.max(0, Math.min(100, Number(percent) || 0));
      if (window.Android && typeof window.Android.setBackgroundMusicVolume === 'function') {
        window.Android.setBackgroundMusicVolume(normalizedPercent);
        return;
      }
      localStorage.setItem('zhushen_background_music_volume', String(normalizedPercent));
    }

    function syncBackgroundMusicControls() {
      var enabled = isBackgroundMusicEnabled();
      var volume = getBackgroundMusicVolume();
      document.querySelectorAll('[data-background-music-toggle]').forEach(function (button) {
        button.classList.toggle('active', enabled);
        button.textContent = enabled ? '关闭背景音乐' : '开启背景音乐';
      });
      document.querySelectorAll('[data-background-music-set]').forEach(function (button) {
        var buttonEnabled = button.dataset.backgroundMusicSet === 'true';
        button.classList.toggle('active', buttonEnabled === enabled);
      });
      document.querySelectorAll('[data-background-music-volume]').forEach(function (input) {
        input.value = String(volume);
      });
      document.querySelectorAll('[data-background-music-status]').forEach(function (node) {
        node.textContent = '当前音乐：' + (enabled ? '开启' : '关闭') + ' · 音量 ' + volume + '%';
      });
    }

    function isReducedMotionEnabled() {
      return localStorage.getItem('zhushen_reduced_motion_enabled') === 'true';
    }

    function setReducedMotionEnabled(enabled) {
      localStorage.setItem('zhushen_reduced_motion_enabled', String(enabled));
      document.documentElement.classList.toggle('reduced-motion', enabled);
    }

    function isRecentHistoryEnabled() {
      return localStorage.getItem('zhushen_recent_history_enabled') !== 'false';
    }

    function setRecentHistoryEnabled(enabled) {
      localStorage.setItem('zhushen_recent_history_enabled', String(enabled));
      syncRecent();
    }

    function syncDisplayHistoryControls() {
      var reducedMotion = isReducedMotionEnabled();
      var recentHistory = isRecentHistoryEnabled();
      document.querySelectorAll('[data-reduced-motion-set]').forEach(function (button) {
        var buttonEnabled = button.dataset.reducedMotionSet === 'true';
        button.classList.toggle('active', buttonEnabled === reducedMotion);
      });
      document.querySelectorAll('[data-recent-history-set]').forEach(function (button) {
        var buttonEnabled = button.dataset.recentHistorySet === 'true';
        button.classList.toggle('active', buttonEnabled === recentHistory);
      });
      document.querySelectorAll('[data-display-history-status]').forEach(function (node) {
        node.textContent = '显示与记录：'
          + (reducedMotion ? '低动态开启' : '低动态关闭')
          + ' · '
          + (recentHistory ? '记录最近浏览' : '不记录最近浏览');
      });
    }

    document.querySelectorAll('[data-clear-favorites]').forEach(function (button) {
      button.addEventListener('click', function () {
        localStorage.removeItem(favoritesKey);
        syncFavorites();
        alert('收藏已清空');
      });
    });
    document.querySelectorAll('[data-clear-disclaimer]').forEach(function (button) {
      button.addEventListener('click', function () {
        if (window.Android) {
          window.Android.setSkipDisclaimer(false);
        }
        alert('首次声明提示已恢复');
      });
    });
    document.querySelectorAll('[data-orientation-option]').forEach(function (button) {
      button.addEventListener('click', function () {
        setOrientationMode(button.dataset.orientationOption);
        syncOrientationControls();
      });
    });
    document.querySelectorAll('[data-splash-video-option]').forEach(function (button) {
      button.addEventListener('click', function () {
        setSplashVideoMode(button.dataset.splashVideoOption);
        syncSplashVideoControls();
      });
    });
    document.querySelectorAll('[data-splash-entry-mode]').forEach(function (button) {
      button.addEventListener('click', function () {
        setSplashEntryMode(button.dataset.splashEntryMode);
        syncSplashEntryControls();
      });
    });
    document.querySelectorAll('[data-background-music-toggle]').forEach(function (button) {
      button.addEventListener('click', function () {
        setBackgroundMusicEnabled(!isBackgroundMusicEnabled());
        syncBackgroundMusicControls();
      });
    });
    document.querySelectorAll('[data-background-music-set]').forEach(function (button) {
      button.addEventListener('click', function () {
        setBackgroundMusicEnabled(button.dataset.backgroundMusicSet === 'true');
        syncBackgroundMusicControls();
      });
    });
    document.querySelectorAll('[data-background-music-volume]').forEach(function (input) {
      input.addEventListener('input', function () {
        setBackgroundMusicVolume(input.value);
        syncBackgroundMusicControls();
      });
    });
    document.querySelectorAll('[data-reduced-motion-set]').forEach(function (button) {
      button.addEventListener('click', function () {
        setReducedMotionEnabled(button.dataset.reducedMotionSet === 'true');
        syncDisplayHistoryControls();
      });
    });
    document.querySelectorAll('[data-recent-history-set]').forEach(function (button) {
      button.addEventListener('click', function () {
        setRecentHistoryEnabled(button.dataset.recentHistorySet === 'true');
        syncDisplayHistoryControls();
      });
    });
    syncOrientationControls();
    syncSplashVideoControls();
    syncSplashEntryControls();
    syncBackgroundMusicControls();
    syncDisplayHistoryControls();
  }

  function recordRecent() {
    if (localStorage.getItem('zhushen_recent_history_enabled') === 'false') {
      syncRecent();
      return;
    }
    var title = document.title;
    var href = location.pathname.split('/').pop();
    var list = readList(recentKey).filter(function (item) { return item.href !== href; });
    list.unshift({title: title, href: href});
    writeList(recentKey, list);
    syncRecent();
  }

  function refreshPage() {
    installSearch();
    installFilters();
    installNativeVideoBridge();
    installSettings();
    syncFavorites();
    syncRecent();
    recordRecent();
  }

  installNavigation();
  installLightbox();
  installFavorites();
  refreshPage();
  window.ZhushenUIRefresh = refreshPage;
})();
`);

console.log('UI 页面已生成。');
