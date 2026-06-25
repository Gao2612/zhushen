const { copyFileSync, existsSync, mkdirSync, renameSync, statSync, writeFileSync } = require('fs');
const { dirname, join, relative, resolve } = require('path');
const { spawnSync } = require('child_process');
const ffmpegPath = require('ffmpeg-static');

const root = resolve(__dirname, '..');
const assetsRoot = join(root, 'manual-build', 'assets');
const backupRoot = join(root, 'releases', 'original-media-backup', '2026-06-25');
const reportPath = join(root, 'releases', 'resource-reports', 'media-optimization-2026-06-25.json');
const candidates = [
  'official-posts/492288870839223557/pv.mp4',
  'official-posts/492294102788866561/player-reaction.mp4',
  '官方-角色/视频/阿塔尔技能特效.mp4',
  '官方-角色/视频/阿塔尔回睦.mp4'
];

function ensureDir(path) {
  mkdirSync(path, { recursive: true });
}

function sizeOf(path) {
  return statSync(path).size;
}

function optimizeVideo(relativePath) {
  const sourcePath = join(assetsRoot, ...relativePath.split('/'));
  if (!existsSync(sourcePath)) {
    throw new Error(`视频不存在：${relativePath}`);
  }
  const before = sizeOf(sourcePath);
  if (before < 5 * 1024 * 1024) {
    return {
      path: relativePath,
      skipped: true,
      reason: '小于 5MB',
      before,
      after: before
    };
  }
  const backupPath = join(backupRoot, relativePath);
  const tempPath = `${sourcePath}.optimized.mp4`;
  ensureDir(dirname(backupPath));
  ensureDir(dirname(tempPath));
  copyFileSync(sourcePath, backupPath);
  const result = spawnSync(ffmpegPath, [
    '-y',
    '-i',
    sourcePath,
    '-vf',
    'scale=min(1280\\,iw):-2',
    '-c:v',
    'libx264',
    '-preset',
    'veryfast',
    '-crf',
    '30',
    '-c:a',
    'aac',
    '-b:a',
    '96k',
    '-movflags',
    '+faststart',
    tempPath
  ], {
    encoding: 'utf8',
    windowsHide: true
  });
  if (result.status !== 0) {
    throw new Error(`视频压缩失败：${relativePath}\n${result.stderr || result.stdout}`);
  }
  const after = sizeOf(tempPath);
  if (after >= before * 0.95) {
    return {
      path: relativePath,
      skipped: true,
      reason: '压缩收益不足',
      before,
      after
    };
  }
  renameSync(tempPath, sourcePath);
  return {
    path: relativePath,
    skipped: false,
    before,
    after,
    saved: before - after,
    backup: relative(backupRoot, backupPath).replace(/\\/g, '/')
  };
}

function main() {
  ensureDir(dirname(reportPath));
  const results = candidates.map(optimizeVideo);
  const report = {
    generatedAt: '2026-06-25',
    totalBefore: results.reduce((sum, item) => sum + item.before, 0),
    totalAfter: results.reduce((sum, item) => sum + item.after, 0),
    totalSaved: results.reduce((sum, item) => sum + Math.max(0, item.before - item.after), 0),
    results
  };
  writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`视频优化完成：节省 ${Math.round(report.totalSaved / 1024 / 1024)} MB`);
}

main();
