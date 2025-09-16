#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

const projectRoot = path.join(__dirname, '../..');

console.log('🚀 Starting Taskify Development Environment...\n');

function startProcess(name, command, args, cwd, color = '\x1b[0m') {
  const process = spawn(command, args, {
    cwd,
    stdio: 'pipe',
    shell: true,
    env: { ...process.env, FORCE_COLOR: '1' }
  });

  process.stdout.on('data', (data) => {
    const output = data.toString().split('\n').filter(line => line.trim());
    output.forEach(line => {
      console.log(`${color}[${name}]\x1b[0m ${line}`);
    });
  });

  process.stderr.on('data', (data) => {
    const output = data.toString().split('\n').filter(line => line.trim());
    output.forEach(line => {
      console.log(`${color}[${name}]\x1b[31m ERROR:\x1b[0m ${line}`);
    });
  });

  process.on('close', (code) => {
    console.log(`${color}[${name}]\x1b[0m Process exited with code ${code}`);
  });

  return process;
}

async function main() {
  const frontendProcess = startProcess(
    'Frontend',
    'npm',
    ['run', 'dev'],
    path.join(projectRoot, 'frontend'),
    '\x1b[36m' // Cyan
  );

  const backendProcess = startProcess(
    'Backend',
    'npm',
    ['run', 'dev'],
    path.join(projectRoot, 'backend'),
    '\x1b[32m' // Green
  );

  console.log('\x1b[33m[DEV]\x1b[0m Waiting for services to start...');

  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log('\x1b[33m[DEV]\x1b[0m Starting Electron...');
  const electronProcess = startProcess(
    'Electron',
    'npm',
    ['run', 'dev'],
    path.join(__dirname, '..'),
    '\x1b[35m' // Magenta
  );

  process.on('SIGINT', () => {
    console.log('\n\x1b[33m[DEV]\x1b[0m Shutting down development environment...');
    frontendProcess.kill();
    backendProcess.kill();
    electronProcess.kill();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    frontendProcess.kill();
    backendProcess.kill();
    electronProcess.kill();
    process.exit(0);
  });
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };