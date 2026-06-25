const {
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync
} = require('fs');
const { createHash } = require('crypto');
const { extname, join, normalize, relative, resolve } = require('path');

const root = resolve(__dirname, '..');
const contentRoot = join(root, 'content');
const assetsRoot = join(root, 'manual-build', 'assets');
const reportsRoot = join(root, 'releases', 'reports');
const strictMode = process.argv.includes('--strict');
const generatedAt = new Date().toISOString();
const errors = [];
const warnings = [];
const infos = [];
const seenTitles = new Map();
const seenSources = new Map();
const seenHashes = new Map();
const largeResourceThreshold = 25 * 1024 * 1024;
const suspiciousWords = ['待补充', '待考证', '未知', 'TODO', 'undefined', 'null'];
const mediaExtensions = new Set([
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

function addError(file, path, message) {
  errors.push({ level: 'error', file, path, message });
}

function addWarning(file, path, message) {
  warnings.push({ level: 'warning', file, path, message });
}

function addInfo(file, path, message) {
  infos.push({ level: 'info', file, path, message });
}

function readJson(file) {
  const fullPath = join(contentRoot, file);
  if (!existsSync(fullPath)) {
    addError(file, '$', '源数据文件不存在');
    return null;
  }
  try {
    return JSON.parse(readFileSync(fullPath, 'utf8'));
  } catch (error) {
    addError(file, '$', `JSON 解析失败：${error.message}`);
    return null;
  }
}

function assertObject(value, file, path) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    addError(file, path, '字段必须是对象');
    return false;
  }
  return true;
}

function assertArray(value, file, path) {
  if (!Array.isArray(value)) {
    addError(file, path, '字段必须是数组');
    return false;
  }
  if (value.length === 0) {
    addWarning(file, path, '数组为空，请确认是否符合预期');
  }
  return true;
}

function assertString(value, file, path) {
  if (typeof value !== 'string' || value.trim() === '') {
    addError(file, path, '字段必须是非空字符串');
    return false;
  }
  inspectText(value, file, path);
  return true;
}

function inspectText(value, file, path) {
  if (value.includes(String.fromCharCode(0xfffd))) {
    addWarning(file, path, '文本包含疑似乱码替换字符');
  }
  for (const word of suspiciousWords) {
    if (value.includes(word)) {
      addWarning(file, path, `文本包含需人工确认的标记：${word}`);
    }
  }
}

function assertKnownFields(item, file, path, allowedFields) {
  for (const key of Object.keys(item)) {
    if (!allowedFields.has(key)) {
      addWarning(file, `${path}.${key}`, '发现未知字段，请确认生成器是否会读取');
    }
  }
}

function recordTitle(title, file, path) {
  const key = title.trim();
  if (seenTitles.has(key)) {
    addWarning(file, path, `标题重复：首次出现于 ${seenTitles.get(key)}`);
    return;
  }
  seenTitles.set(key, `${file}:${path}`);
}

function normalizeAssetReference(reference) {
  if (typeof reference !== 'string' || reference.trim() === '') {
    return '';
  }
  if (/^(?:https?:|data:|mqqapi:|javascript:|#)/i.test(reference)) {
    return '';
  }
  return reference.split(/[?#]/, 1)[0];
}

function resolveAsset(reference, file, path) {
  const normalizedReference = normalizeAssetReference(reference);
  if (!normalizedReference) {
    return null;
  }
  const targetPath = normalize(join(assetsRoot, normalizedReference));
  if (!targetPath.startsWith(normalize(assetsRoot + '\\'))) {
    addError(file, path, `资源路径越出运行资产目录：${reference}`);
    return null;
  }
  if (!existsSync(targetPath)) {
    addError(file, path, `资源不存在：${reference}`);
    return null;
  }
  const extension = extname(targetPath).toLowerCase();
  if (!mediaExtensions.has(extension)) {
    addWarning(file, path, `资源扩展名不在常用媒体白名单：${reference}`);
  }
  const size = statSync(targetPath).size;
  if (size > largeResourceThreshold) {
    addWarning(
      file,
      path,
      `资源体积超过 ${Math.round(largeResourceThreshold / 1024 / 1024)} MB：${reference}`
    );
  }
  return targetPath;
}

function hashFile(path) {
  const hash = createHash('sha256');
  hash.update(readFileSync(path));
  return hash.digest('hex');
}

function recordAsset(reference, file, path) {
  const assetPath = resolveAsset(reference, file, path);
  if (!assetPath) {
    return;
  }
  const relativePath = relative(assetsRoot, assetPath).replace(/\\/g, '/');
  if (seenSources.has(relativePath)) {
    addWarning(file, path, `资源重复引用：${relativePath}`);
  }
  seenSources.set(relativePath, `${file}:${path}`);
  const digest = hashFile(assetPath);
  const current = seenHashes.get(digest) || [];
  current.push(relativePath);
  seenHashes.set(digest, current);
}

function validateCharacters() {
  const file = 'characters.json';
  const data = readJson(file);
  if (!assertArray(data, file, '$')) {
    return;
  }
  const allowed = new Set([
    'key',
    'name',
    'title',
    'tags',
    'cover',
    'desc',
    'quote',
    'images',
    'videos'
  ]);
  data.forEach((item, index) => {
    const path = `$[${index}]`;
    if (!assertObject(item, file, path)) {
      return;
    }
    assertKnownFields(item, file, path, allowed);
    for (const key of ['key', 'name', 'title', 'cover', 'desc']) {
      assertString(item[key], file, `${path}.${key}`);
    }
    recordTitle(item.name || '', file, `${path}.name`);
    recordAsset(item.cover, file, `${path}.cover`);
    if (assertArray(item.tags, file, `${path}.tags`)) {
      item.tags.forEach((tag, tagIndex) => assertString(tag, file, `${path}.tags[${tagIndex}]`));
    }
    if (assertArray(item.images, file, `${path}.images`)) {
      item.images.forEach((src, imageIndex) => recordAsset(src, file, `${path}.images[${imageIndex}]`));
    }
    if (item.videos && assertArray(item.videos, file, `${path}.videos`)) {
      item.videos.forEach((video, videoIndex) => {
        if (!assertObject(video, file, `${path}.videos[${videoIndex}]`)) {
          return;
        }
        assertString(video.src, file, `${path}.videos[${videoIndex}].src`);
        assertString(video.label, file, `${path}.videos[${videoIndex}].label`);
        recordAsset(video.src, file, `${path}.videos[${videoIndex}].src`);
      });
    }
  });
}

function validateConcepts() {
  const file = 'concepts.json';
  const data = readJson(file);
  if (!assertArray(data, file, '$')) {
    return;
  }
  const allowed = new Set(['title', 'src', 'tag']);
  data.forEach((item, index) => {
    const path = `$[${index}]`;
    if (!assertObject(item, file, path)) {
      return;
    }
    assertKnownFields(item, file, path, allowed);
    assertString(item.title, file, `${path}.title`);
    assertString(item.src, file, `${path}.src`);
    recordTitle(item.title || '', file, `${path}.title`);
    recordAsset(item.src, file, `${path}.src`);
    if (item.tag) {
      assertString(item.tag, file, `${path}.tag`);
    }
  });
}

function validateJokes() {
  const file = 'jokes.json';
  const data = readJson(file);
  if (!assertArray(data, file, '$')) {
    return;
  }
  const allowed = new Set(['title', 'desc', 'src']);
  data.forEach((item, index) => {
    const path = `$[${index}]`;
    if (!assertObject(item, file, path)) {
      return;
    }
    assertKnownFields(item, file, path, allowed);
    assertString(item.title, file, `${path}.title`);
    assertString(item.desc, file, `${path}.desc`);
    assertString(item.src, file, `${path}.src`);
    recordTitle(item.title || '', file, `${path}.title`);
    recordAsset(item.src, file, `${path}.src`);
  });
}

function validateFanCreations() {
  const file = 'fan-creations.json';
  const data = readJson(file);
  if (!assertObject(data, file, '$')) {
    return;
  }
  const allowedRoot = new Set(['fanVideos', 'artists']);
  assertKnownFields(data, file, '$', allowedRoot);
  if (assertArray(data.fanVideos, file, '$.fanVideos')) {
    data.fanVideos.forEach((item, index) => {
      const path = `$.fanVideos[${index}]`;
      if (!assertObject(item, file, path)) {
        return;
      }
      for (const key of ['src', 'title', 'desc', 'character']) {
        assertString(item[key], file, `${path}.${key}`);
      }
      recordTitle(item.title || '', file, `${path}.title`);
      recordAsset(item.src, file, `${path}.src`);
    });
  }
  if (assertArray(data.artists, file, '$.artists')) {
    data.artists.forEach((artist, artistIndex) => {
      const path = `$.artists[${artistIndex}]`;
      if (!assertObject(artist, file, path)) {
        return;
      }
      assertString(artist.name, file, `${path}.name`);
      assertString(artist.base, file, `${path}.base`);
      if (assertArray(artist.files, file, `${path}.files`)) {
        artist.files.forEach((name, fileIndex) => {
          assertString(name, file, `${path}.files[${fileIndex}]`);
          recordAsset(`${artist.base}${name}`, file, `${path}.files[${fileIndex}]`);
        });
      }
      if (assertArray(artist.entries, file, `${path}.entries`)) {
        artist.entries.forEach((entry, entryIndex) => {
          const entryPath = `${path}.entries[${entryIndex}]`;
          if (!assertObject(entry, file, entryPath)) {
            return;
          }
          for (const key of ['title', 'src', 'artist', 'type', 'character']) {
            assertString(entry[key], file, `${entryPath}.${key}`);
          }
          if (entry.artist !== artist.name) {
            addWarning(file, `${entryPath}.artist`, '二创条目作者与分组作者不一致');
          }
          recordTitle(entry.title || '', file, `${entryPath}.title`);
          recordAsset(entry.src, file, `${entryPath}.src`);
        });
      }
    });
  }
}

function validateOfficialPosts() {
  const file = 'official-posts.json';
  const data = readJson(file);
  if (!assertArray(data, file, '$')) {
    return;
  }
  const allowed = new Set([
    'id',
    'title',
    'date',
    'sourceName',
    'category',
    'sourceUrl',
    'sourceLabel',
    'summary',
    'quote',
    'points',
    'media',
    'contentFile'
  ]);
  data.forEach((item, index) => {
    const path = `$[${index}]`;
    if (!assertObject(item, file, path)) {
      return;
    }
    assertKnownFields(item, file, path, allowed);
    for (const key of ['id', 'title', 'date', 'sourceName', 'category', 'summary', 'contentFile']) {
      assertString(item[key], file, `${path}.${key}`);
    }
    recordTitle(item.title || '', file, `${path}.title`);
    const contentFile = join(contentRoot, item.contentFile || '');
    if (!contentFile.startsWith(contentRoot) || !existsSync(contentFile)) {
      addError(file, `${path}.contentFile`, `正文 Markdown 不存在：${item.contentFile}`);
    } else {
      inspectText(readFileSync(contentFile, 'utf8'), item.contentFile, '$');
    }
    if (assertArray(item.points, file, `${path}.points`)) {
      item.points.forEach((point, pointIndex) => assertString(point, file, `${path}.points[${pointIndex}]`));
    }
    if (assertArray(item.media, file, `${path}.media`)) {
      item.media.forEach((media, mediaIndex) => {
        const mediaPath = `${path}.media[${mediaIndex}]`;
        if (!assertObject(media, file, mediaPath)) {
          return;
        }
        assertString(media.type, file, `${mediaPath}.type`);
        assertString(media.src, file, `${mediaPath}.src`);
        assertString(media.label, file, `${mediaPath}.label`);
        recordAsset(media.src, file, `${mediaPath}.src`);
        if (media.poster) {
          recordAsset(media.poster, file, `${mediaPath}.poster`);
        }
      });
    }
  });
}

function validateResourceManifest() {
  const file = 'resource-manifest.json';
  const data = readJson(file);
  if (!assertObject(data, file, '$')) {
    return;
  }
  if (!assertObject(data.assets, file, '$.assets')) {
    return;
  }
  for (const [assetPath, asset] of Object.entries(data.assets)) {
    const path = `$.assets["${assetPath}"]`;
    recordAsset(assetPath, file, path);
    if (!asset || typeof asset !== 'object') {
      addError(file, path, 'manifest 资源记录必须是对象');
      continue;
    }
    if (asset.kind === 'image' && !asset.thumbnail) {
      addError(file, `${path}.thumbnail`, '图片资源缺少缩略图');
    }
    if (asset.thumbnail) {
      recordAsset(asset.thumbnail, file, `${path}.thumbnail`);
    }
  }
}

function collectDuplicateHashes() {
  for (const [digest, files] of seenHashes.entries()) {
    const uniqueFiles = Array.from(new Set(files));
    if (uniqueFiles.length > 1) {
      warnings.push({
        level: 'warning',
        file: 'manual-build/assets',
        path: digest.slice(0, 12),
        message: `发现重复哈希资源：${uniqueFiles.join('、')}`
      });
    }
  }
}

function renderHtml(report) {
  const row = (item) => `<tr><td>${item.level}</td><td>${item.file}</td><td>${item.path}</td><td>${item.message}</td></tr>`;
  const section = (title, list) => `
    <section>
      <h2>${title} <span>${list.length}</span></h2>
      ${list.length === 0 ? '<p class="empty">无</p>' : `<table><tbody>${list.map(row).join('')}</tbody></table>`}
    </section>`;
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>诸神终应知晓 内容健康检查</title>
<style>
body{margin:0;background:#0b0b10;color:#eee4d2;font-family:"Microsoft YaHei",Arial,sans-serif}
main{width:min(1180px,calc(100% - 40px));margin:0 auto;padding:40px 0}
h1{font-size:34px}h2{margin-top:30px;color:#f0d78c}h2 span{font-size:16px;color:#d4a754}
.summary{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:24px 0}
.summary div{padding:18px;border:1px solid rgba(212,167,84,.22);border-radius:18px;background:rgba(255,255,255,.04)}
.summary strong{display:block;font-size:30px;color:#f0d78c}
table{width:100%;border-collapse:collapse;border:1px solid rgba(212,167,84,.18);background:rgba(255,255,255,.035)}
td{padding:10px;border-top:1px solid rgba(212,167,84,.12);vertical-align:top}
td:first-child{width:90px;color:#f0d78c}.empty{color:rgba(238,228,210,.62)}
</style>
</head>
<body><main>
<h1>内容健康检查</h1>
<p>生成时间：${report.generatedAt}</p>
<div class="summary">
<div><strong>${report.errors.length}</strong>错误</div>
<div><strong>${report.warnings.length}</strong>警告</div>
<div><strong>${report.infos.length}</strong>信息</div>
</div>
${section('错误', report.errors)}
${section('警告', report.warnings)}
${section('信息', report.infos)}
</main></body></html>`;
}

function writeReport() {
  mkdirSync(reportsRoot, { recursive: true });
  collectDuplicateHashes();
  addInfo('content', '$', `已扫描 ${seenSources.size} 个唯一资源引用`);
  const report = {
    generatedAt,
    strictMode,
    summary: {
      errors: errors.length,
      warnings: warnings.length,
      infos: infos.length,
      assets: seenSources.size
    },
    errors,
    warnings,
    infos
  };
  writeFileSync(
    join(reportsRoot, 'content-health.json'),
    JSON.stringify(report, null, 2) + '\n',
    'utf8'
  );
  writeFileSync(join(reportsRoot, 'content-health.html'), renderHtml(report), 'utf8');
  return report;
}

function main() {
  validateCharacters();
  validateConcepts();
  validateFanCreations();
  validateJokes();
  validateOfficialPosts();
  validateResourceManifest();
  const report = writeReport();
  if (report.errors.length > 0) {
    console.error(`内容健康检查失败：${report.errors.length} 个错误`);
    for (const item of report.errors) {
      console.error(`${item.file} ${item.path} ${item.message}`);
    }
    process.exit(1);
  }
  if (strictMode) {
    console.log(`内容健康检查通过：${report.warnings.length} 个警告已写入报告。`);
  } else {
    console.log(`内容健康报告已生成：${report.summary.assets} 个资源引用。`);
  }
}

main();
