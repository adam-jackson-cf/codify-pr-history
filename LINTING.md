# Markdown Linting Setup

This project uses `markdownlint-cli` to ensure consistent markdown formatting, especially for the `codify-pr-history/` plugin.

## Installation

Install dependencies (only needed once):

```bash
npm install
```

This installs `markdownlint-cli` locally.

## Usage

### Lint Markdown Files

Lint all markdown files in `codify-pr-history/`:

```bash
npm run lint:md
```

### Auto-fix Issues

Automatically fix fixable markdown issues:

```bash
npm run lint:md:fix
```

## Configuration

Linting rules are configured in `.markdownlint.json`:

- **MD003**: ATX-style headings (`#` syntax)
- **MD007**: List indentation (2 spaces)
- **MD013**: Line length limit (120 characters, excluding code blocks and tables)
- **MD024**: Allow duplicate headings in different sections
- **MD033**: Allow inline HTML (disabled)
- **MD041**: Allow files without top-level heading
- **no-hard-tabs**: Use spaces, not tabs
- **whitespace**: Enforce proper whitespace

## Pre-commit Hook (Optional)

To automatically lint before commits, add this to `.git/hooks/pre-commit`:

```bash
#!/bin/bash
npm run lint:md
if [ $? -ne 0 ]; then
  echo "Markdown linting failed. Please fix errors or run 'npm run lint:md:fix'."
  exit 1
fi
```

Make it executable:

```bash
chmod +x .git/hooks/pre-commit
```

## CI Integration (Optional)

Add to your CI workflow (GitHub Actions example):

```yaml
- name: Lint Markdown
  run: |
    npm install
    npm run lint:md
```

## Scope

Linting is **scoped to `codify-pr-history/` only**. Other markdown files in the project are not affected.

To lint other directories, modify the `lint:md` script in `package.json`.
