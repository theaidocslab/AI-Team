# AI-Team

This repository defines a small **team of AI helpers** (called "subagents") for use
with [Claude Code](https://code.claude.com). Each helper has one job, and the main
assistant can call on them when that job comes up — similar to how a human team lead
might hand a task to the teammate best suited for it.

## What's a subagent?

A subagent is just a text file that tells Claude Code:
- **What** the helper is called
- **When** it should be used
- **How** it should behave (its instructions/job description)

Claude Code automatically reads every file in the `.claude/agents/` folder and makes
those helpers available. You don't need to run any setup command — just having the
files there is enough.

## The team

| Agent | File | Job |
|---|---|---|
| Planner | `.claude/agents/planner.md` | Explores the codebase and writes a step-by-step plan *before* any code is written. |
| Coder | `.claude/agents/coder.md` | Implements the actual code changes, following a plan or a clear request. |
| Reviewer | `.claude/agents/reviewer.md` | Reads finished code changes and looks for bugs, security issues, or messy logic. |
| Tester | `.claude/agents/tester.md` | Writes and runs tests to prove the code actually works. |

## How to use them

In Claude Code, you can ask the main assistant to use a specific helper, e.g.
"use the planner to figure out how to add a login page," or just describe your task
normally — the assistant will pull in the right helper automatically when it fits.

## Folder structure

```
.claude/agents/   <- one file per AI helper (the "team roster")
README.md         <- this file, explains the project
```
