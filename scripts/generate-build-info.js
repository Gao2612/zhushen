const { execFileSync } = require('child_process');
const { mkdirSync, readFileSync, writeFileSync } = require('fs');
const { dirname, join, resolve } = require('path');

const root = resolve(__dirname, '..');
const packageJson = JSON.parse(
  readFileSync(join(root, 'package.json'), 'utf8')
);

function gitValue(args, fallback) {
  try {
    return execFileSync('git', args, {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
  } catch (error) {
    return fallback;
  }
}

function writeJson(filePath, value) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

const buildDate = new Date();
const buildInfo = {
  name: packageJson.name,
  version: packageJson.version,
  buildTime: buildDate.toISOString(),
  branch: gitValue(['rev-parse', '--abbrev-ref', 'HEAD'], 'unknown'),
  commit: gitValue(['rev-parse', '--short', 'HEAD'], 'unknown'),
  target: process.env.ZHUSHEN_BUILD_TARGET || 'local'
};
const dateKey = buildInfo.buildTime.slice(0, 10);

writeJson(join(root, 'manual-build', 'assets', 'build-info.json'), buildInfo);
writeJson(join(root, 'scripts', 'generated', 'build-info.json'), buildInfo);
writeJson(
  join(root, 'releases', 'build-info', `build-info-${dateKey}.json`),
  buildInfo
);

console.log(
  `构建信息已生成：${buildInfo.version} ${buildInfo.commit} ${buildInfo.target}`
);
