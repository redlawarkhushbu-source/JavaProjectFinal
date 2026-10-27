#!/usr/bin/env node

/**
 * Shet Samarthan (शेत समर्थन) - Full Stack Unified Development Launcher
 * 
 * Runs both Frontend (React 19 + Vite + Three.js) and Backend (Java Spring Boot)
 * concurrently with colored prefixes and unified process lifecycle management.
 */

import { spawn, execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Terminal color codes
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const DIM = '\x1b[2m';

const FRONTEND_DIR = path.join(__dirname, 'frontend');
const BACKEND_DIR = path.join(__dirname, 'backend');

let frontendProcess = null;
let backendProcess = null;
let isShuttingDown = false;

function printBanner() {
  console.log(`
${GREEN}${BOLD}========================================================================${RESET}
${GREEN}${BOLD}   🌾 SHET SAMARTHAN (शेत समर्थन) • UNIFIED DEVELOPMENT LAUNCHER       ${RESET}
${GREEN}${BOLD}========================================================================${RESET}
  ${BOLD}🌐 Frontend (React + Vite + 3D):${RESET}  ${CYAN}http://localhost:5173${RESET}
  ${BOLD}⚙️  Backend (Spring Boot API):${RESET}     ${CYAN}http://localhost:8080${RESET}
  ${BOLD}📍 Location Intelligence:${RESET}         ${GREEN}Two-Stage Active (Mumbai, Pune, etc.)${RESET}
  ${BOLD}🔑 Farmer-Friendly Setup:${RESET}         ${GREEN}100% Zero-Key Free Satellite Engine${RESET}
${GREEN}${BOLD}========================================================================${RESET}
`);
}

function checkCommand(cmd) {
  try {
    const checkCmd = process.platform === 'win32' ? `where.exe ${cmd}` : `which ${cmd}`;
    execSync(checkCmd, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function log(prefix, color, message) {
  const lines = message.toString().split('\n');
  lines.forEach((line) => {
    if (line.trim().length > 0) {
      console.log(`${color}${BOLD}[${prefix}]${RESET} ${line}`);
    }
  });
}

function startFrontend() {
  log('system', YELLOW, 'Starting Frontend Vite dev server...');
  const isWindows = process.platform === 'win32';
  const npmCmd = isWindows ? 'npm.cmd' : 'npm';

  frontendProcess = spawn(npmCmd, ['run', 'dev'], {
    cwd: FRONTEND_DIR,
    shell: isWindows,
    env: { ...process.env, FORCE_COLOR: 'true' }
  });

  frontendProcess.stdout.on('data', (data) => log('frontend', GREEN, data));
  frontendProcess.stderr.on('data', (data) => log('frontend', RED, data));

  frontendProcess.on('close', (code) => {
    if (!isShuttingDown) {
      log('frontend', YELLOW, `Frontend process exited with code ${code}`);
    }
  });
}

function startBackend() {
  const isWindows = process.platform === 'win32';
  const hasMaven = checkCommand('mvn') || (isWindows && checkCommand('mvn.cmd'));

  if (!hasMaven) {
    log('backend', YELLOW, '⚠️  Maven (mvn) was not detected on system PATH.');
    log('backend', CYAN, 'ℹ️  Shet Samarthan is running seamlessly with built-in client-side mock backend,');
    log('backend', CYAN, '   complete DL4J neural simulation, and free live meteorological satellite APIs.');
    log('backend', DIM, '   (To run Spring Boot locally, install Java 17+ and Apache Maven: `mvn spring-boot:run`)\n');
    return;
  }

  log('system', YELLOW, 'Starting Java Spring Boot Backend (Maven)...');
  const mvnCmd = isWindows ? 'mvn.cmd' : 'mvn';

  backendProcess = spawn(mvnCmd, ['spring-boot:run'], {
    cwd: BACKEND_DIR,
    shell: isWindows,
    env: { ...process.env }
  });

  backendProcess.stdout.on('data', (data) => log('backend', CYAN, data));
  backendProcess.stderr.on('data', (data) => log('backend', RED, data));

  backendProcess.on('close', (code) => {
    if (!isShuttingDown) {
      log('backend', YELLOW, `Backend process exited with code ${code}`);
    }
  });
}

function cleanup() {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`\n${YELLOW}${BOLD}[system] Shutting down all Shet Samarthan services cleanly...${RESET}`);

  const killChild = (child, name) => {
    if (!child || child.killed) return;
    try {
      if (process.platform === 'win32' && child.pid) {
        execSync(`taskkill /pid ${child.pid} /T /F`, { stdio: 'ignore' });
      } else {
        child.kill('SIGTERM');
      }
      log(name, YELLOW, 'Stopped successfully.');
    } catch {
      // Process already terminated
    }
  };

  killChild(frontendProcess, 'frontend');
  killChild(backendProcess, 'backend');

  process.exit(0);
}

// Register signal handlers for clean exit on Ctrl+C
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

// Launch All Services
printBanner();
startFrontend();
startBackend();
