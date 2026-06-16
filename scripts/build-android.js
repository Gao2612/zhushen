const { copyFileSync, existsSync } = require('fs');
const { join, resolve } = require('path');
const { spawnSync } = require('child_process');

const root = resolve(__dirname, '..');
const androidDir = join(root, 'android');
const variant = process.argv[2] === 'release' ? 'release' : 'debug';
const task = variant === 'release' ? 'assembleRelease' : 'assembleDebug';
const javaHome = join(root, 'jdk', 'jdk-17.0.14+7');
const androidHome = join(root, 'android-sdk');
const gradle = join(androidDir, 'gradlew.bat');
const environment = {
  ...process.env,
  JAVA_HOME: javaHome,
  ANDROID_HOME: androidHome,
  ANDROID_SDK_ROOT: androidHome,
  Path: [
    join(javaHome, 'bin'),
    join(androidHome, 'platform-tools'),
    process.env.Path
  ].join(';')
};

const result = spawnSync(
  'cmd.exe',
  ['/d', '/s', '/c', gradle, `:app:${task}`, '--no-daemon'],
  {
    cwd: androidDir,
    env: environment,
    stdio: 'inherit',
    shell: false
  }
);

if (result.error) {
  throw result.error;
}
if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

const source = join(
  androidDir,
  'app',
  'build',
  'outputs',
  'apk',
  variant,
  `app-${variant}.apk`
);
if (!existsSync(source)) {
  throw new Error(`构建成功但未找到 APK：${source}`);
}

const output = join(root, `app-${variant}.apk`);
copyFileSync(source, output);
console.log(`APK 已生成：${output}`);
