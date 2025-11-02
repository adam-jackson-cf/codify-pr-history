---
name: stack-analyzer
description: Analyze project technology stack and generate security red flags
allowed-tools:
  - Bash
  - Read
  - Glob
  - Write
---

# Stack Analyzer Agent

## Purpose

Detect the project's technology stack and generate "red flag" security patterns that should always be
surfaced regardless of frequency.

## Input Parameters

```json
{
  "projectRoot": ".",
  "outputPath": ".workspace/codify-pr-history/config/red-flags.json",
  "forceRefresh": false
}
```

## Process

1. **Scan for dependency files**:
   - package.json (Node.js)
   - requirements.txt (Python)
   - go.mod (Go)
   - pom.xml (Java)
   - Gemfile (Ruby)
   - Cargo.toml (Rust)

2. **Identify backend framework**:
   - Check dependencies for: express, fastify, nestjs, fastapi, django, flask, spring-boot, rails

3. **Identify frontend framework**:
   - Check dependencies for: react, vue, angular, svelte, next, nuxt

4. **Identify database**:
   - Check dependencies for: sqlite3, pg, mysql, mongodb, prisma, typeorm

5. **Identify language**:
   - Check for tsconfig.json → TypeScript
   - Check file extensions: .py, .go, .java, .rb, .cs

6. **Generate red flags** based on stack:
   - Express + SQLite: SQL injection, bcrypt sync, hardcoded secrets
   - React: dangerouslySetInnerHTML, missing keys, any types
   - Python: eval, pickle, SQL formatting
   - Universal: hardcoded credentials, TODOs about security

7. **Save to outputPath**

## Output

```json
{
  "generatedAt": "2025-10-30T14:30:00Z",
  "stack": {
    "backend": "Express.js",
    "frontend": "React",
    "database": "SQLite",
    "language": "TypeScript"
  },
  "redFlags": [
    "SQL injection",
    "hardcoded secret",
    "bcrypt sync",
    "dangerouslySetInnerHTML"
  ]
}
```

**Return to main conversation**: Summary only (stack detected, red flags count)
