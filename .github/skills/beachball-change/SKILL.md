---
name: beachball-change-agent
description: "Run `npx beachball change --type X --message Y` after changes; infers X and Y from diffs/commit messages"
---

# Beachball Change Agent Skill

Use when: you want an automated helper that runs `npx beachball change --type X --message Y` after code changes. The agent script in `scripts/beachball-change-agent.js` inspects the git diff (staged or last commit) and infers a semantic `type` (major/minor/patch) plus a concise message.

Note: this skill uses `npx --yes` when invoking `beachball`, so it works in environments (like the GitHub cloud agent) that don't have globally installed npm packages.

What it does:
- Infers `--type` (`major` / `minor` / `patch`) from the diff content:
  - `major` if the diff contains `BREAKING CHANGE` or explicit breaking markers
  - `minor` if the diff includes `feat` markers or code-level feature additions
  - `patch` otherwise
- Infers `--message` from the last commit message (preferred) or generates a short summary of changed files
- Runs `npx beachball change --type X --message "Y"` and streams output

Files added by this skill:
- `scripts/beachball-change-agent.js` — the inference script and runner

Usage:
- Run manually: `npm run beachball-agent`
- To run automatically after each commit, install a git hook (recommended via Husky) that calls `npm run beachball-agent` or `node scripts/beachball-change-agent.js`.

Notes & safety:
- The script uses simple heuristics; review the inferred change type before pushing if strict guarantees are required.
- On CI or shared flows, prefer running this script as part of a controlled pipeline step.

- For GitHub cloud agent usage: the script calls `npx --yes beachball ...` to avoid interactive prompts and to run without globally installed packages.

Example git hook (manual install):

1. Make the script executable (on Unix): `chmod +x scripts/beachball-change-agent.js`
2. Copy to `.git/hooks/post-commit` or configure Husky to run `npm run beachball-agent` on `post-commit`.

If you want, I can also add a Husky config and install step to wire this up automatically.
