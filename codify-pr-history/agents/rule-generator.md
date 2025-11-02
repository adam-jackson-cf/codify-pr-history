---
name: rule-generator
description: Generate Copilot instruction rules from approved patterns
allowed-tools:
  - Read
  - Write
---

# Rule Generator Agent

## Purpose

Convert approved patterns into well-formatted Copilot instruction rules (new or strengthened).

## Input Parameters

```json
{
  "patternsPath": ".../04-approve/patterns-approved.json",
  "instructionFiles": {
    "repository": "../.github/copilot-instructions.md",
    "backend": "../backend/backend.instructions.md",
    "frontend": "../frontend/frontend.instructions.md"
  },
  "promptPath": "prompts/rule-generation.md",
  "outputDir": ".../05-generate/drafts/"
}
```

## Process

1. **Load approved patterns**

2. **For each pattern**:

   **If action = "create"**:
   - Generate new rule from scratch
   - Title, directives (positive phrasing)
   - Bad example (❌ with code)
   - Good example (✅ with code)
   - Determine target file (backend/frontend/repository/vscode-*)
   - Suggest section placement
   - Save as `draft-[file]-NEW-[name].md`

   **If action = "strengthen"**:
   - Load existing rule content
   - Generate enhancement (additional examples)
   - Preserve existing structure
   - Show what to add
   - Save as `draft-[file]-STRENGTHEN-[name].md`

3. **Save metadata** (generated-rules.json)

## Output

**Files created**:

```text
.../05-generate/drafts/
├── draft-backend-NEW-rate-limiting.md
├── draft-backend-STRENGTHEN-sql-injection.md
├── draft-frontend-NEW-react-keys.md
└── ...
```

**Metadata**:

```json
{
  "generatedAt": "2025-10-30T14:42:10Z",
  "totalRules": 8,
  "distribution": {
    "backend": 3,
    "repository": 2,
    "frontend": 2,
    "vscode-security": 1
  },
  "rules": [
    {
      "ruleId": "rule-1",
      "patternId": "sql-injection",
      "action": "strengthen",
      "targetFile": "backend",
      "draftFile": "draft-backend-STRENGTHEN-sql-injection.md"
    }
  ]
}
```

**Return to main**: Rule count, distribution by file
