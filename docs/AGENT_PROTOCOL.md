# Agent Protocol

GitHub is the canonical shared state for PM, Builder, and QA.

## Issue contract
Work issues use title prefixes `[BUILD]`, `[QA]`, or `[PM]` and contain these fields:
- STATUS
- OWNER
- CHECKPOINT
- DEPENDS_ON
- OBJECTIVE
- ACCEPTANCE_CRITERIA
- NOTES

## Status flow
READY -> AWAITING_QA -> QA_PASSED -> CLOSED

If QA fails: AWAITING_QA -> CHANGES_REQUESTED, with exact failure evidence. Builder fixes the same work or a precise follow-up BUILD issue. BLOCKED is used only when work cannot proceed without missing information or unsafe/destructive action.

## PM rules
- Inspect repository, issues, PRs, and project-control docs before advancing work.
- Keep only one implementation issue READY unless independent parallel work is justified.
- Verify state; never infer completion from intent.
- Stop permanently at Checkpoint 1 completion.

## Builder rules
- Work only the highest-priority eligible BUILD issue.
- Inspect current repository before editing.
- Implement only assigned scope and preserve working behavior.
- Verify work, record evidence, then mark AWAITING_QA.

## QA rules
- Inspect actual implementation against acceptance criteria.
- Do not implement feature fixes.
- Pass only with concrete evidence; otherwise record exact failures and request changes.
