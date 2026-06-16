const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const root = __dirname;
const javaHome = path.join(root, 'jdk', 'jdk-17.0.14+7');
const androidHome = path.join(root, 'android-sdk');
const sdkmanager = path.join(androidHome, 'cmdline-tools', 'latest', 'bin', 'sdkmanager.bat');

const args = process.argv.slice(2);
const env = {
  ...process.env,
  JAVA_HOME: javaHome,
  ANDROID_HOME: androidHome,
  PATH: path.join(javaHome, 'bin') + path.delimiter + process.env.PATH
};

// Create licenses directory and pre-accept
const licensesDir = path.join(androidHome, 'licenses');
fs.mkdirSync(licensesDir, { recursive: true });
// Standard Android SDK license hash
fs.writeFileSync(path.join(licensesDir, 'android-sdk-license'), '\n24333f8a63b6825ea9c5514f83c2829b004d1bae\n');

console.log('JAVA_HOME=' + javaHome);
console.log('ANDROID_HOME=' + androidHome);
console.log('Running:', sdkmanager, args.join(' '));

try {
  // Pipe "y" to accept any remaining license prompts
  const result = execSync(`"${sdkmanager}" ${args.join(' ')}`, { 
    env, 
    stdio: ['pipe', 'inherit', 'inherit'],
    input: 'y\n'
  });
} catch (e) {
  process.exit(e.status || 1);
}
