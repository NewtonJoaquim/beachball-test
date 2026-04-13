#!/usr/bin/env node
const { execSync } = require('child_process');

function run(cmd, opts = {}) {
  return execSync(cmd, { encoding: 'utf8', ...opts });
}

function safeRun(cmd) {
  try {
    return run(cmd);
  } catch (e) {
    return '';
  }
}

function inferTypeFromDiff(diff) {
  if (!diff) return 'patch';
  if (/BREAKING CHANGE|BREAKING:/i.test(diff)) return 'major';
  if (/\bfeat\b|^\+.*feat[:(]/mi.test(diff)) return 'minor';
  return 'patch';
}

function makeMessage(commitMsg, files) {
  const cm = (commitMsg || '').trim();
  if (cm) {
    const firstLine = cm.split('\n')[0].trim();
    if (firstLine) return firstLine;
  }
  if (files && files.length) return `Auto change: ${files.slice(0,5).join(', ')}${files.length>5? ' and more':''}`;
  return 'Auto-generated change';
}

function escapeForShell(s) {
  return s.replace(/"/g, '\\"');
}

function main() {
  let stagedFiles = safeRun('git diff --staged --name-only').trim().split('\n').filter(Boolean);
  if (stagedFiles.length === 0) {
    // fallback to last commit diff
    const diffNames = safeRun('git diff --name-only HEAD').trim();
    stagedFiles = diffNames.split('\n').filter(Boolean);
  }

  if (stagedFiles.length === 0) {
    console.error('No changed files detected (staged or unstaged). Nothing to do.');
    process.exit(0);
  }

  // Try to get staged diff, else last commit diff
  let diffText = safeRun('git diff --staged');
  if (!diffText) diffText = safeRun('git diff HEAD');

  const inferredType = inferTypeFromDiff(diffText);

  // Prefer last commit message if present (works when running post-commit)
  const lastCommitMessage = safeRun('git log -1 --pretty=%B').trim();
  const message = makeMessage(lastCommitMessage, stagedFiles);

  const cmd = `npx --yes beachball change --type ${inferredType} --message "${escapeForShell(message)}"`;
  console.log(`Running: ${cmd}`);

  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch (e) {
    console.error('beachball command failed:', e.message || e);
    process.exitCode = e.status || 1;
  }
}

main();
