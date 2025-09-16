#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const electronDir = path.join(__dirname, '..');
const projectRoot = path.join(__dirname, '../..');
const buildDir = path.join(electronDir, 'build');

console.log('🔨 Building Taskify Desktop Application...\n');

function executeCommand(command, cwd = projectRoot) {
  console.log(`📂 Working directory: ${cwd}`);
  console.log(`🏃 Executing: ${command}`);

  try {
    execSync(command, {
      cwd,
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' }
    });
    console.log('✅ Command completed successfully\n');
  } catch (error) {
    console.error(`❌ Command failed: ${error.message}`);
    process.exit(1);
  }
}

function ensureDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dirPath}`);
  }
}

function copyDirectory(src, dest) {
  ensureDirectory(dest);

  console.log(`📋 Copying ${src} -> ${dest}`);

  if (process.platform === 'win32') {
    executeCommand(`xcopy "${src}" "${dest}" /E /I /Y`, projectRoot);
  } else {
    executeCommand(`cp -r "${src}" "${dest}"`, projectRoot);
  }
}

function copyFile(src, dest) {
  const destDir = path.dirname(dest);
  ensureDirectory(destDir);

  console.log(`📄 Copying ${src} -> ${dest}`);
  fs.copyFileSync(src, dest);
}

function createProductionEnv() {
  const envContent = `# Electron Production Environment
NODE_ENV=production
PORT=3001
DB_TYPE=sqlite
JWT_SECRET=electron-production-secret-change-me
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3001
`;

  const envPath = path.join(buildDir, 'backend', '.env');
  fs.writeFileSync(envPath, envContent);
  console.log(`📝 Created production .env file`);
}

function updateBackendConfig() {
  const configPath = path.join(buildDir, 'backend', 'src', 'config', 'database.js');

  if (fs.existsSync(configPath)) {
    let config = fs.readFileSync(configPath, 'utf8');

    config = config.replace(
      "filename: process.env.SQLITE_DB || './database.sqlite'",
      "filename: process.env.SQLITE_DB || require('electron').app.getPath('userData') + '/taskify.sqlite'"
    );

    fs.writeFileSync(configPath, config);
    console.log(`🔧 Updated database config for Electron`);
  }
}

function main() {
  console.log('🏗️  Step 1: Building Frontend...');
  executeCommand('npm run build', path.join(projectRoot, 'frontend'));

  console.log('🏗️  Step 2: Installing Backend Dependencies...');
  executeCommand('npm install --only=production', path.join(projectRoot, 'backend'));

  console.log('🏗️  Step 3: Preparing Build Directory...');
  if (fs.existsSync(buildDir)) {
    if (process.platform === 'win32') {
      executeCommand(`rmdir /S /Q "${buildDir}"`, projectRoot);
    } else {
      executeCommand(`rm -rf "${buildDir}"`, projectRoot);
    }
  }
  ensureDirectory(buildDir);

  console.log('🏗️  Step 4: Copying Frontend Build...');
  copyDirectory(
    path.join(projectRoot, 'frontend', 'dist'),
    path.join(buildDir, 'frontend')
  );

  console.log('🏗️  Step 5: Copying Backend Files...');
  ensureDirectory(path.join(buildDir, 'backend'));

  copyDirectory(
    path.join(projectRoot, 'backend', 'src'),
    path.join(buildDir, 'backend', 'src')
  );

  copyDirectory(
    path.join(projectRoot, 'backend', 'node_modules'),
    path.join(buildDir, 'backend', 'node_modules')
  );

  copyFile(
    path.join(projectRoot, 'backend', 'package.json'),
    path.join(buildDir, 'backend', 'package.json')
  );

  console.log('🏗️  Step 6: Creating Production Environment...');
  createProductionEnv();

  console.log('🏗️  Step 7: Updating Backend Configuration...');
  updateBackendConfig();

  console.log('✨ Build completed successfully!');
  console.log('\n📦 You can now run:');
  console.log('   npm start     - Start the Electron app');
  console.log('   npm run pack  - Package for current platform');
  console.log('   npm run dist  - Create distributable');
}

if (require.main === module) {
  main();
}

module.exports = { main };