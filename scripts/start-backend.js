#!/usr/bin/env node

/**
 * Start the backend Express server
 * This script ensures the backend API is running on port 4000
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const serverDir = join(projectRoot, 'server');

console.log('Starting backend server...');
console.log('Server directory:', serverDir);

// Start the backend server
const backend = spawn('npm', ['run', 'dev'], {
  cwd: serverDir,
  stdio: 'inherit',
  shell: true
});

backend.on('error', (error) => {
  console.error('Failed to start backend server:', error);
  process.exit(1);
});

backend.on('exit', (code) => {
  if (code !== 0) {
    console.error(`Backend server exited with code ${code}`);
    process.exit(code);
  }
});

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\nStopping backend server...');
  backend.kill('SIGINT');
  process.exit(0);
});
