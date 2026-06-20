const { app } = require('electron');
const { createHash } = require('crypto');
const { join } = require('path');
const originalFs = require('original-fs');

const rootDir = join(__dirname, '..');
const sourcePath = join(
  rootDir,
  'releases',
  'desktop',
  'win-unpacked',
  'resources',
  'app.asar'
);
const testDir = join(rootDir, 'releases', 'asar-copy-test');
const targetPath = join(testDir, 'app.asar');

const hashFile = (path) => {
  return createHash('sha256')
    .update(originalFs.readFileSync(path))
    .digest('hex');
};

app.whenReady().then(() => {
  try {
    originalFs.rmSync(testDir, { recursive: true, force: true });
    originalFs.mkdirSync(testDir, { recursive: true });
    originalFs.copyFileSync(sourcePath, targetPath);

    if (hashFile(sourcePath) !== hashFile(targetPath)) {
      throw new Error('ASAR copy hash mismatch');
    }

    console.log('ASAR raw copy verified.');
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    originalFs.rmSync(testDir, { recursive: true, force: true });
    app.quit();
  }
});
