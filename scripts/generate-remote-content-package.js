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
const contentRoot = join(root, 'content');
const outputRoot = join(root, 'releases', 'update-content');
const reportsRoot = join(root, 'releases', 'reports');
const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const generatedAt = new Date().toISOString();
const contentVersion = `${packageJson.version}-${generatedAt.slice(0, 10).replace(/-/g, '')}`;
const allowedExtensions = new Set(['.json', '.md']);

function toPosix(path) {
  return path.replace(/\\/g, '/');
}

function hashText(text) {
  return createHash('sha256').update(text).digest('hex');
}

function walk(directory) {
  const result = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      result.push(...walk(fullPath));
      continue;
    }
    if (entry.isFile() && allowedExtensions.has(extname(entry.name).toLowerCase())) {
      result.push(fullPath);
    }
  }
  return result;
}

function writeMarkdownReport(manifest) {
  const lines = [
    '# 远程内容同步试点报告',
    '',
    `生成时间：${manifest.generatedAt}`,
    `内容包版本：${manifest.contentVersion}`,
    `兼容客户端：${manifest.compatibleClientVersion}`,
    '',
    '## 已落地',
    '',
    '- 生成远程内容 manifest。',
    '- 内容包只包含 JSON 与 Markdown，不包含可执行脚本。',
    '- 每个文件记录 sha256、字节数和相对路径。',
    '- 桌面端预留下载、校验、缓存、应用和回滚 IPC。',
    '',
    '## 边界',
    '',
    '- Android 第一阶段只提示内容更新，不做静默覆盖。',
    '- 已安装桌面客户端仍以内置静态页面为主；内容包应用优先服务维护环境。',
    '- 损坏内容包不得覆盖内置资料。',
    '',
    '## 验收场景',
    '',
    '- 断网：继续使用内置资料。',
    '- hash 不一致：拒绝应用并保留旧内容。',
    '- 应用失败：回滚到上一个已缓存内容版本。',
    ''
  ];
  writeFileSync(
    join(reportsRoot, 'remote-content-sync-report.md'),
    lines.join('\n'),
    'utf8'
  );
}

function writeCloudPlanReport() {
  const report = {
    generatedAt,
    status: 'planned',
    implementedThisRound: false,
    scope: '账号登录与云端资料同步规划，不实现账号系统',
    phases: [
      '定义本地档案、收藏、备注和云端档案的数据边界',
      '设计登录态、刷新令牌、退出、离线编辑和冲突合并',
      '接入真实后端接口并做小范围灰度',
      '把备份入口升级为真实云同步入口'
    ],
    risks: [
      '账号安全、隐私合规和数据冲突合并都需要独立设计',
      '基础内容层、资源校验和发布链路稳定前不应抢先上线',
      'Android 与桌面端必须共享同一份同步协议'
    ]
  };
  writeFileSync(
    join(reportsRoot, 'account-cloud-sync-plan.json'),
    JSON.stringify(report, null, 2) + '\n',
    'utf8'
  );
  writeFileSync(
    join(reportsRoot, 'account-cloud-sync-plan.md'),
    [
      '# 账号登录与云端同步简要计划',
      '',
      `生成时间：${generatedAt}`,
      '',
      '本轮不实现账号登录和云端资料同步，仅保留规划。',
      '',
      '## 后续阶段',
      '',
      ...report.phases.map((item) => `- ${item}`),
      '',
      '## 风险',
      '',
      ...report.risks.map((item) => `- ${item}`),
      ''
    ].join('\n'),
    'utf8'
  );
}

function main() {
  mkdirSync(outputRoot, { recursive: true });
  mkdirSync(reportsRoot, { recursive: true });
  const files = walk(contentRoot).map((path) => {
    const relativePath = toPosix(relative(contentRoot, path));
    const content = readFileSync(path, 'utf8');
    return {
      path: relativePath,
      size: statSync(path).size,
      sha256: hashText(content),
      content
    };
  });
  const bundle = {
    generatedAt,
    contentVersion,
    compatibleClientVersion: packageJson.version,
    files: files.map((item) => ({
      path: item.path,
      size: item.size,
      sha256: item.sha256,
      content: item.content
    }))
  };
  const manifest = {
    generatedAt,
    contentVersion,
    compatibleClientVersion: packageJson.version,
    minClientVersion: packageJson.version,
    packageFile: 'content-bundle.json',
    packageSha256: hashText(JSON.stringify(bundle)),
    fileCount: files.length,
    files: files.map((item) => ({
      path: item.path,
      size: item.size,
      sha256: item.sha256
    }))
  };
  writeFileSync(
    join(outputRoot, 'content-bundle.json'),
    JSON.stringify(bundle, null, 2) + '\n',
    'utf8'
  );
  manifest.packageSha256 = hashText(readFileSync(join(outputRoot, 'content-bundle.json'), 'utf8'));
  writeFileSync(
    join(outputRoot, 'remote-content-manifest.json'),
    JSON.stringify(manifest, null, 2) + '\n',
    'utf8'
  );
  writeFileSync(
    join(reportsRoot, 'remote-content-sync-report.json'),
    JSON.stringify({
      generatedAt,
      status: 'ready-for-desktop-pilot',
      manifest,
      notes: [
        '内容包不包含可执行脚本。',
        '桌面端可下载、校验、缓存和回滚。',
        'Android 第一阶段只提示，不静默覆盖内置内容。'
      ]
    }, null, 2) + '\n',
    'utf8'
  );
  writeMarkdownReport(manifest);
  writeCloudPlanReport();
  console.log(`远程内容包已生成：${files.length} 个内容文件。`);
}

main();
