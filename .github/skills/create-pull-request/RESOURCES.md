# Troubleshooting & Resources

## Installation: gh CLI
- **macOS**: `brew install gh`
- **Windows**: `winget install --id GitHub.cli`
- **Linux**: See [cli.github.com](https://cli.github.com/)

## Authentication
Run `gh auth login` and follow the interactive prompts to authenticate with your GitHub account.

## Working Directory
If there are uncommitted changes, ask the user whether to:
1. `git add . && git commit -m "your message"`
2. `git stash`
3. `git checkout -- .` (Warning: Discards changes)
**Important** Do not stage any uncommitted changes without explict request/reply by the user