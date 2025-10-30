# Stack Analysis Guide

How the skill detects your project's technology stack and generates red flag patterns.

---

## Purpose

Stack analysis identifies your project's technologies to:

1. **Generate relevant red flags** - Critical security patterns specific to your stack
2. **Inform rule generation** - Examples use correct frameworks/libraries
3. **Improve pattern matching** - Understand context for better grouping

**Red flags**: Patterns that should ALWAYS be surfaced, regardless of frequency (e.g., hardcoded passwords, SQL injection).

---

## When It Runs

### First Run

Automatically runs when no `red-flags.json` exists:

```bash
/codify-pr-history 90

Stack analysis needed (first run)...
Analyzing project...
```text

### Manual Refresh

Force re-analysis with `--refresh-stack`:

```bash
/codify-pr-history 90 --refresh-stack

Refreshing stack analysis...
Re-analyzing project...
```text

### Cached

Skipped if `red-flags.json` exists:

```bash
/codify-pr-history 90

Using existing stack analysis ✓
(Run with --refresh-stack to update)
```text

---

## Detection Process

### 1. Scan Project Files

**Files examined**:

```text
package.json          # Node.js dependencies
requirements.txt      # Python dependencies
go.mod                # Go modules
Gemfile               # Ruby gems
pom.xml               # Java/Maven
build.gradle          # Java/Gradle
Cargo.toml            # Rust crates
composer.json         # PHP dependencies
```text

**Also scans**:

- Configuration files (`tsconfig.json`, `.babelrc`, `vite.config.ts`)
- Import statements in source files (first 100 files)
- Framework-specific directories (`pages/`, `app/`, `src/components/`)

### 2. Identify Backend Framework

**Detection logic**:

```javascript
// Check dependencies
if (packageJson.dependencies.express) {
  backend = "Express.js";
} else if (packageJson.dependencies.fastify) {
  backend = "Fastify";
} else if (packageJson.dependencies["@nestjs/core"]) {
  backend = "NestJS";
}

// Python
if (requirementsTxt.includes("fastapi")) {
  backend = "FastAPI";
} else if (requirementsTxt.includes("django")) {
  backend = "Django";
} else if (requirementsTxt.includes("flask")) {
  backend = "Flask";
}
```text

**Supported frameworks**:

- **Node.js**: Express, Fastify, NestJS, Koa, Hapi
- **Python**: FastAPI, Django, Flask
- **Go**: Gin, Echo, Fiber
- **Java**: Spring Boot
- **Ruby**: Rails, Sinatra
- **.NET**: ASP.NET Core

### 3. Identify Frontend Framework

**Detection logic**:

```javascript
// Check dependencies
if (packageJson.dependencies.react) {
  frontend = "React";
} else if (packageJson.dependencies.vue) {
  frontend = "Vue";
} else if (packageJson.dependencies["@angular/core"]) {
  frontend = "Angular";
} else if (packageJson.dependencies.svelte) {
  frontend = "Svelte";
}

// Check for meta-frameworks
if (packageJson.dependencies.next) {
  frontend = "Next.js (React)";
} else if (packageJson.dependencies.nuxt) {
  frontend = "Nuxt (Vue)";
}
```text

### 4. Identify Database

**Detection logic**:

```javascript
// Check dependencies
if (packageJson.dependencies.sqlite3 || packageJson.dependencies["better-sqlite3"]) {
  database = "SQLite";
} else if (packageJson.dependencies.pg) {
  database = "PostgreSQL";
} else if (packageJson.dependencies.mysql || packageJson.dependencies.mysql2) {
  database = "MySQL";
} else if (packageJson.dependencies.mongodb) {
  database = "MongoDB";
}

// Check for ORMs
if (packageJson.dependencies.prisma) {
  database += " (via Prisma)";
} else if (packageJson.dependencies.typeorm) {
  database += " (via TypeORM)";
} else if (packageJson.dependencies.sequelize) {
  database += " (via Sequelize)";
}
```text

### 5. Identify Language

**Detection priority**:

1. Check for `tsconfig.json` → TypeScript
2. Check for `.py` files → Python
3. Check for `.go` files → Go
4. Check for `.java` files → Java
5. Check for `.rb` files → Ruby
6. Check for `.cs` files → C#
7. Default to JavaScript if Node.js detected

---

## Red Flag Generation

### Stack-Specific Red Flags

#### Express.js + SQLite + TypeScript

```json
{
  "redFlags": [
    "SQL injection",
    "sql concatenation",
    "string interpolation in query",
    "hardcoded secret",
    "hardcoded password",
    "hardcoded api key",
    "bcrypt.hashSync",
    "bcrypt sync",
    "process.env without validation",
    "eval(",
    "new Function("
  ]
}
```text

#### React + TypeScript

```json
{
  "redFlags": [
    "dangerouslySetInnerHTML",
    "innerHTML =",
    "missing key prop",
    "key={index}",
    "any type",
    "as any",
    "suppressHydrationWarning",
    "// @ts-ignore"
  ]
}
```text

#### FastAPI + PostgreSQL + Python

```json
{
  "redFlags": [
    "SQL injection",
    "execute(f\"",
    "string formatting in query",
    "hardcoded password",
    "eval(",
    "exec(",
    "pickle.loads",
    "__import__",
    "os.system(",
    "subprocess without shell=False"
  ]
}
```text

### Universal Red Flags

Always included regardless of stack:

```json
{
  "redFlags": [
    "hardcoded password",
    "hardcoded secret",
    "hardcoded api key",
    "TODO: remove this",
    "FIXME: security"
  ]
}
```text

---

## Example Output

### Stack Analysis for Express + React Project

```json
{
  "generatedAt": "2025-10-30T14:30:00Z",
  "projectRoot": "/Users/adam/Projects/myapp",
  "stack": {
    "backend": "Express.js",
    "frontend": "React",
    "database": "SQLite (via better-sqlite3)",
    "language": "TypeScript",
    "otherTools": ["Vite", "Vitest", "ESLint"]
  },
  "redFlags": [
    "SQL injection",
    "sql concatenation",
    "string interpolation in query",
    "db.prepare(${",
    "db.all(`SELECT",
    "hardcoded secret",
    "hardcoded password",
    "hardcoded api key",
    "process.env.PASSWORD",
    "bcrypt.hashSync",
    "bcrypt sync",
    "bcryptSync",
    "dangerouslySetInnerHTML",
    "innerHTML =",
    "missing key prop",
    "key={index}",
    "eval(",
    "new Function("
  ],
  "detectionSources": {
    "backend": "package.json dependencies.express",
    "frontend": "package.json dependencies.react",
    "database": "package.json dependencies.better-sqlite3",
    "language": "tsconfig.json present"
  }
}
```text

Saved to: `.workspace/codify-pr-history/config/red-flags.json`

---

## How Red Flags Are Used

### During Preprocessing

Comments matching red flags are ALWAYS kept, even if they only appear once:

```javascript
// Normal pattern: needs 3+ occurrences
"Missing try-catch" → 1 occurrence → FILTERED OUT

// Red flag: always kept
"Hardcoded password in config" → 1 occurrence → KEPT
```text

### During Pattern Analysis

Red flag patterns are marked as **critical severity** automatically:

```json
{
  "id": "hardcoded-credentials",
  "title": "Hardcoded Credentials",
  "frequency": 1,  // Only 1 occurrence
  "severity": "critical",  // Elevated due to red flag
  "isRedFlag": true,
  "action": "create"  // Will generate rule
}
```text

---

## Customizing Red Flags

### Manual Editing

Edit `.workspace/codify-pr-history/config/red-flags.json`:

```json
{
  "redFlags": [
    "SQL injection",
    "hardcoded secret",
    "bcrypt sync",

    "custom pattern specific to our app",
    "deprecated function X",
    "legacy auth method"
  ]
}
```text

**After editing**: No need to refresh stack, changes take effect on next run.

### Adding Stack-Specific Patterns

If you use a framework not yet supported:

```json
{
  "stack": {
    "backend": "Express.js",
    "frontend": "React",
    "database": "SQLite",
    "language": "TypeScript",
    "custom": "GraphQL with Apollo"  // Add your own
  },
  "redFlags": [
    "existing patterns...",

    "GraphQL injection",
    "resolver without auth check",
    "N+1 query in resolver"
  ]
}
```text

---

## Detection Confidence

### High Confidence

Clear indicators:

```text
package.json lists express → Express.js ✓
tsconfig.json present → TypeScript ✓
dependencies.react → React ✓
```text

### Medium Confidence

Inferred from patterns:

```text
src/pages/ directory → Likely Next.js
app/routes/ directory → Likely Remix
```text

### Low Confidence

Ambiguous or multiple possibilities:

```text
Both Django and FastAPI in requirements.txt → ???
```text

In low confidence cases, red flags for ALL detected frameworks are included.

---

## Refresh Scenarios

### When to Refresh

**Refresh stack analysis when**:

- Major tech stack change (React → Vue)
- New framework added (added GraphQL)
- Database migration (SQLite → PostgreSQL)
- Language change (JavaScript → TypeScript)

### When Not Needed

**Don't refresh for**:

- Dependency version updates
- Adding utility libraries
- Minor framework changes

---

## Troubleshooting

### Wrong Framework Detected

**Check**:

```bash
cat .workspace/codify-pr-history/config/red-flags.json | jq '.stack'
```text

**Fix**:

1. Manually edit `red-flags.json`
2. Or run with `--refresh-stack`
3. Or file an issue for better detection

### Missing Red Flags

**Check**: Is the pattern security-critical for your stack?

**Fix**: Manually add to `red-flags.json`

### Too Many Red Flags

**Issue**: Every comment is kept, defeating the purpose of filtering.

**Fix**: Be selective - only truly critical security issues should be red flags.

---

## See Also

- [workflow-overview.md](workflow-overview.md) - Complete workflow
- [preprocessing-guide.md](preprocessing-guide.md) - How red flags affect preprocessing
- [pattern-analysis-guide.md](pattern-analysis-guide.md) - How red flags affect triage
