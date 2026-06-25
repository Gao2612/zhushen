const {
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync
} = require('fs');
const { createHash } = require('crypto');
const { execFileSync } = require('child_process');
const { join, resolve } = require('path');

const root = resolve(__dirname, '..');
const reportsRoot = join(root, 'releases', 'reports');
const generatedAt = new Date().toISOString();

function readJson(path) {
  if (!existsSync(path)) {
    return null;
  }
  return JSON.parse(readFileSync(path, 'utf8'));
}

function runGit(args) {
  try {
    return execFileSync('git', args, {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
  } catch (error) {
    return '';
  }
}

function sha256(path) {
  if (!existsSync(path)) {
    return null;
  }
  const hash = createHash('sha256');
  hash.update(readFileSync(path));
  return hash.digest('hex');
}

function fileInfo(label, path, type) {
  if (!existsSync(path)) {
    return {
      label,
      path,
      type,
      exists: false,
      size: 0,
      sizeMB: 0,
      sha256: null
    };
  }
  const size = statSync(path).size;
  return {
    label,
    path,
    type,
    exists: true,
    size,
    sizeMB: Math.round((size / 1024 / 1024) * 100) / 100,
    sha256: sha256(path)
  };
}

function status(label, state, detail) {
  return { label, state, detail };
}

function renderHtml(report) {
  const statusRows = report.statuses.map((item) => (
    `<tr><td>${item.label}</td><td class="${item.state}">${item.state}</td><td>${item.detail}</td></tr>`
  )).join('');
  const assetRows = report.assets.map((item) => (
    `<tr><td>${item.label}</td><td>${item.type}</td><td>${item.exists ? item.sizeMB : '缺失'}</td><td><code>${item.sha256 || '-'}</code></td><td>${item.path}</td></tr>`
  )).join('');
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>诸神终应知晓 发布前检查</title>
<style>
body{margin:0;background:#0b0b10;color:#eee4d2;font-family:"Microsoft YaHei",Arial,sans-serif}
main{width:min(1180px,calc(100% - 40px));margin:0 auto;padding:40px 0}
h1{font-size:34px}h2{margin-top:30px;color:#f0d78c}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin:24px 0}
.grid div{padding:18px;border:1px solid rgba(212,167,84,.22);border-radius:18px;background:rgba(255,255,255,.04)}
.grid strong{display:block;font-size:22px;color:#f0d78c;word-break:break-all}
table{width:100%;border-collapse:collapse;border:1px solid rgba(212,167,84,.18);background:rgba(255,255,255,.035);margin-top:12px}
td,th{padding:10px;border-top:1px solid rgba(212,167,84,.12);text-align:left;vertical-align:top}
th{color:#d4a754}.ok{color:#92d39a}.warn{color:#f0d78c}.fail{color:#ff9c8c}code{font-size:12px;color:#d9c7ff}
</style>
</head>
<body><main>
<h1>发布前检查面板</h1>
<p>生成时间：${report.generatedAt}</p>
<div class="grid">
<div><span>版本</span><strong>${report.package.version}</strong></div>
<div><span>分支</span><strong>${report.git.branch || '-'}</strong></div>
<div><span>提交</span><strong>${report.git.commit || '-'}</strong></div>
<div><span>工作区</span><strong>${report.git.dirty ? '有改动' : '干净'}</strong></div>
</div>
<h2>状态</h2><table><thead><tr><th>项目</th><th>状态</th><th>说明</th></tr></thead><tbody>${statusRows}</tbody></table>
<h2>发布资产</h2><table><thead><tr><th>名称</th><th>类型</th><th>MB</th><th>sha256</th><th>路径</th></tr></thead><tbody>${assetRows}</tbody></table>
</main></body></html>`;
}

function main() {
  mkdirSync(reportsRoot, { recursive: true });
  const packageJson = readJson(join(root, 'package.json')) || {};
  const buildInfo = readJson(join(root, 'manual-build', 'assets', 'build-info.json'));
  const contentHealth = readJson(join(reportsRoot, 'content-health.json'));
  const assetsSize = readJson(join(reportsRoot, 'assets-size.json'));
  const updateManifest = readJson(join(root, 'releases', 'update-current', 'zhushen-update-manifest.json'));
  const assets = [
    fileInfo('Android 调试包', join(root, 'releases', 'android-debug.apk'), 'apk'),
    fileInfo('根目录 Android 调试包', join(root, 'app-debug.apk'), 'apk'),
    fileInfo('Windows 安装器', join(root, 'releases', 'installer-shell', `zhushen-installer-${packageJson.version}-win-x64.exe`), 'exe'),
    fileInfo('桌面便携包', join(root, 'releases', 'pc', `zhushen-pc-client-v${packageJson.version}.zip`), 'zip'),
    fileInfo('自动更新 manifest', join(root, 'releases', 'update-current', 'zhushen-update-manifest.json'), 'json'),
    fileInfo('自动更新 app.asar', join(root, 'releases', 'update-current', 'zhushen-app.asar'), 'asar'),
    fileInfo('自动更新客户端 exe', join(root, 'releases', 'update-current', 'zhushen-archive.exe'), 'exe'),
    fileInfo('远程内容 manifest', join(root, 'releases', 'update-content', 'remote-content-manifest.json'), 'json'),
    fileInfo('远程内容包', join(root, 'releases', 'update-content', 'content-bundle.json'), 'json'),
    fileInfo('内容健康报告', join(root, 'releases', 'reports', 'content-health.html'), 'html'),
    fileInfo('资源体积报告', join(root, 'releases', 'reports', 'assets-size.html'), 'html'),
    fileInfo('远程内容同步报告', join(root, 'releases', 'reports', 'remote-content-sync-report.md'), 'md'),
    fileInfo('账号云端计划简报', join(root, 'releases', 'reports', 'account-cloud-sync-plan.md'), 'md')
  ];
  const statuses = [
    status(
      '内容健康检查',
      contentHealth && contentHealth.summary.errors === 0 ? 'ok' : 'fail',
      contentHealth ? `${contentHealth.summary.errors} 个错误，${contentHealth.summary.warnings} 个警告` : '报告缺失'
    ),
    status(
      '资源体积报告',
      assetsSize ? 'ok' : 'warn',
      assetsSize ? `${assetsSize.summary.totalMB} MB，${assetsSize.summary.totalFiles} 个媒体资源` : '报告缺失'
    ),
    status(
      '构建信息',
      buildInfo ? 'ok' : 'warn',
      buildInfo ? `${buildInfo.version || packageJson.version} / ${buildInfo.commit || '无提交号'}` : 'build-info 缺失'
    ),
    status(
      '自动更新 manifest',
      updateManifest ? 'ok' : 'warn',
      updateManifest ? `目标版本 ${updateManifest.version || packageJson.version}` : 'manifest 缺失'
    ),
    status(
      '发布资产完整性',
      assets.every((item) => item.exists) ? 'ok' : 'fail',
      `${assets.filter((item) => item.exists).length}/${assets.length} 个资产存在`
    ),
    status(
      'Debug 签名提示',
      existsSync(join(root, 'app-debug.apk')) ? 'warn' : 'ok',
      '当前包含 debug APK，正式分发前应使用 release 签名包'
    )
  ];
  const report = {
    generatedAt,
    package: {
      name: packageJson.name,
      version: packageJson.version
    },
    git: {
      branch: runGit(['rev-parse', '--abbrev-ref', 'HEAD']),
      commit: runGit(['rev-parse', '--short', 'HEAD']),
      dirty: runGit(['status', '--short']).length > 0
    },
    buildInfo,
    statuses,
    assets
  };
  writeFileSync(
    join(reportsRoot, 'release-check.json'),
    JSON.stringify(report, null, 2) + '\n',
    'utf8'
  );
  writeFileSync(join(reportsRoot, 'release-check.html'), renderHtml(report), 'utf8');
  console.log(`发布前检查报告已生成：${statuses.length} 个状态项。`);
}

main();
