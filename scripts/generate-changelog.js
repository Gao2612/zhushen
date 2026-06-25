const { readdirSync, readFileSync, writeFileSync } = require('fs');
const { join, resolve } = require('path');

const root = resolve(__dirname, '..');
const docsRoot = join(root, 'docs');
const notePattern = /^change-notes-(\d{4}(?:-\d{2}){1,2}(?:-to-\d{4}-\d{2}-\d{2})?)\.md$/;

function titleFromName(fileName) {
  const match = fileName.match(notePattern);
  return match ? match[1] : fileName.replace(/\.md$/i, '');
}

const notes = readdirSync(docsRoot)
  .filter((fileName) => notePattern.test(fileName))
  .sort((left, right) => right.localeCompare(left))
  .map((fileName) => ({
    fileName,
    title: titleFromName(fileName),
    content: readFileSync(join(docsRoot, fileName), 'utf8').trim()
  }));

const changelog = [
  '# CHANGELOG',
  '',
  '本文件由 `npm run prebuild:meta` 根据 `docs/change-notes-*.md` 自动生成。',
  ''
];

for (const note of notes) {
  changelog.push(`## ${note.title}`);
  changelog.push('');
  changelog.push(note.content.replace(/^# .+$/m, '').trim());
  changelog.push('');
}

writeFileSync(join(root, 'CHANGELOG.md'), `${changelog.join('\n').trim()}\n`, 'utf8');
console.log(`CHANGELOG 已生成：${notes.length} 条维护记录。`);
