const { readdirSync, readFileSync, statSync } = require('fs');
const { extname, join, relative, resolve } = require('path');
const { TextDecoder } = require('util');

const root = resolve(__dirname, '..');
const textExtensions = new Set([
  '.bat',
  '.css',
  '.gradle',
  '.html',
  '.java',
  '.js',
  '.json',
  '.kt',
  '.md',
  '.properties',
  '.toml',
  '.ts',
  '.txt',
  '.xml',
  '.yml',
  '.yaml'
]);
const ignoredDirectories = new Set([
  '.git',
  '.gradle',
  'android-sdk',
  'android-sdk-tmp',
  'build',
  'dist',
  'jdk',
  'node_modules',
  'releases',
  'tmp'
]);
const ignoredFiles = new Set([
  'package-lock.json'
]);
const mojibakePatterns = [
  '\u951b',
  '\u6d93',
  '\u7ecb',
  '\u93c2',
  '\u93c3',
  '\u00c2',
  '\u00c3',
  '\uFFFD'
];
const failures = [];
const decoder = new TextDecoder('utf-8', { fatal: true });

function shouldScanFile(filePath) {
  const name = relative(root, filePath).replaceAll('\\', '/');
  if (ignoredFiles.has(name)) {
    return false;
  }
  return textExtensions.has(extname(filePath).toLowerCase());
}

function walk(directory) {
  for (const entry of readdirSync(directory)) {
    if (ignoredDirectories.has(entry)) {
      continue;
    }
    const filePath = join(directory, entry);
    const stat = statSync(filePath);
    if (stat.isDirectory()) {
      walk(filePath);
      continue;
    }
    if (stat.isFile() && shouldScanFile(filePath)) {
      checkFile(filePath);
    }
  }
}

function checkFile(filePath) {
  const buffer = readFileSync(filePath);
  const name = relative(root, filePath).replaceAll('\\', '/');
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xef &&
    buffer[1] === 0xbb &&
    buffer[2] === 0xbf
  ) {
    failures.push(`${name}: 包含 UTF-8 BOM`);
  }

  let content = '';
  try {
    content = decoder.decode(buffer);
  } catch (error) {
    failures.push(`${name}: 不是可严格解码的 UTF-8 文本`);
    return;
  }

  const controlMatch = content.match(/[\x00-\x08\x0B\x0C\x0E-\x1F]/);
  if (controlMatch) {
    failures.push(`${name}: 含异常控制字符`);
  }

  for (const pattern of mojibakePatterns) {
    if (content.includes(pattern)) {
      failures.push(`${name}: 疑似中文编码异常片段 ${pattern}`);
      break;
    }
  }
}

walk(root);

if (failures.length > 0) {
  console.error('编码检查失败：');
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('编码检查通过：源码文本均为可解码 UTF-8。');
