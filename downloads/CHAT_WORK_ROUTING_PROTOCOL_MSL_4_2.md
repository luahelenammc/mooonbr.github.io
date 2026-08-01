# Chat–Work Routing Protocol
## Public Portable Edition · MSL-4.2

## Meta

- **status:** public portable protocol
- **primary implementation:** ChatGPT Chat and Work modes
- **version:** 1.0-public
- **as of:** 2026-08-01
- **publishing body:** Moon Professional Source
- **human author and editorial authority:** Lua Helena Moon Martins Cardoso (Moon)
- **AI-assisted development:** Moon + Áurion coauthoring dyad
- **method lineage:** Local Moon Source → Moon Professional Source
- **canonical reference:** https://www.luahelena.com.br/ia/?lang=en
- **portability:** ChatGPT-first; adaptable to equivalent interactive and continuity-intensive lanes

## What This Protocol Is

ChatGPT has two different operating experiences:

- **Chat** is the interactive, conversational, resumable lane for questions, research, reasoning, planning, writing, review, source inspection, and safely bounded execution.
- **Work** is an agentic lane for longer, multi-step operations and finished deliverables that benefit from sustained execution continuity.

Work draws from the account’s shared agentic usage allowance when available. Ordinary Chat uses separate limits. Exact availability, included usage, credit options, and reset rules depend on the plan and workspace.

This protocol helps preserve that scarcer Work allowance. It keeps everything safely possible in Chat, prepares any genuine Work operation before escalation, and requires Work to return evidence that Chat can verify and integrate.

> **Chat clears the fog and completes bounded work. Work receives a defined operation, sustains the long execution, and returns proof. Chat verifies, integrates, and preserves continuity.**

## Why It Exists

The common mistake is to treat Work as the “better brain.” That wastes agentic usage in three ways:

- unclear tasks enter Work before the real problem is understood;
- research, summarization, planning, drafting, or small edits consume capacity that Chat could have handled;
- Work returns activity without a clean completion state, receipts, or a path back into the project.

The routing question is not **“Is this hard?”**

The routing question is:

> **Does this task genuinely require sustained operational continuity to produce a reliable result?**

## Core Laws

1. **Chat is the default. Work is the exception.**
2. **Difficulty alone does not justify Work. Continuity burden does.**
3. **Chat must remove ambiguity before escalation.**
4. **All safely bounded work should be completed in Chat.**
5. **Work receives an operation, not a raw conversation.**
6. **Work must return proof, not merely a confident summary.**
7. **The default chain is Chat → Work, only if necessary → Chat.**
8. **Saving usage must not become false economy:** use Work when interruption or reconstruction would materially endanger the result.

## Lane Definitions

### Chat

Use Chat for:

- questions, discussion, brainstorming, and decisions;
- web research and source comparison;
- reading files, repositories, logs, and connected sources;
- resolving scope, authority, source of truth, and uncertainty;
- plans, specifications, schemas, prompts, and workflows;
- writing, rewriting, translation, and review;
- small or medium edits with clear verification;
- isolated patches, audits, and pull-request review;
- artifact preparation;
- checkpoints that make longer work safely resumable;
- verification and integration of Work output.

Chat is not only a planning room. It is where **all bounded and inspectable work should be finished**.

### Work

Use Work for operations such as:

- coordinated implementation across several interdependent modules;
- migrations or refactors with a long dependent sequence;
- sustained edit–build–test–debug–repair loops;
- integrated delivery involving multiple dependent artifacts;
- environments with expensive setup that should not be repeatedly reconstructed;
- investigations whose evidence map must evolve continuously;
- operations where interruption creates a material risk of inconsistent, duplicated, or partial delivery.

Do not use Work merely because a task is important, technical, large, contains code, involves many files, or deserves a serious answer.

## Continuity Test

Route to Work only when one or more conditions are true:

- later steps materially depend on transient state created earlier;
- reconstructing the environment would be costly, risky, or error-prone;
- a long feedback loop must remain internally coherent;
- several outputs must be built and validated as one delivery;
- interruption creates a meaningful chance of divergence or partial completion;
- the task requires a continuous experimental or evidence state.

Keep the task in Chat when:

- it can be divided into independent bounded operations;
- current state can be recovered from the thread, source, repository, files, or receipts;
- each phase can close with a checkpoint;
- the task is mainly research, review, writing, planning, or a verifiable patch;
- the real blocker is ambiguity rather than continuity.

## Chat-First Preparation

Before considering Work, Chat should:

1. reconstruct the real objective;
2. identify the governing source of truth;
3. inspect the current baseline;
4. separate facts, evidence, assumptions, and open uncertainty;
5. define scope and authority;
6. complete all bounded work;
7. test whether the remainder truly needs sustained continuity;
8. create a Work-ready handoff only when the answer is yes.

> A vague task should not be made expensive. It should first be made legible.

## Routing Decision Gate

### Keep in Chat

Choose Chat when most of the task is:

- interpretation or research;
- source discovery or comparison;
- architecture or planning;
- writing or artifact preparation;
- read-only audit;
- isolated review;
- a small or medium mutation;
- a sequence that can be safely checkpointed.

### Escalate to Work

Choose Work only when:

- the remaining objective is singular and defined;
- the baseline and source of truth are known;
- allowed and prohibited operations are explicit;
- the definition of done is testable;
- required receipts are named;
- stop and rollback conditions exist where relevant;
- sustained continuity materially improves reliability.

## Work Readiness Gate

A task is ready for Work only when the packet contains:

### Objective

- one unique objective;
- a testable definition of done;
- an explicit non-goal boundary.

### Baseline

- current state;
- relevant evidence;
- unresolved uncertainty;
- source-of-truth location, branch, revision, files, and environment.

### Authority

- what Work may read;
- what Work may change;
- what Work must not change;
- whether destructive operations are allowed;
- whether publication, deployment, sending, or deletion is authorized.

### Delivery

- required artifacts;
- required receipts;
- tests and acceptance gates;
- stop conditions;
- rollback or recovery path;
- valid completion states.

Valid completion states:

- `complete`
- `complete_with_exceptions`
- `partial`
- `blocked`
- `rolled_back`

If these fields cannot be completed, the task is not ready for Work.

## Portable Work Handoff Template

# Work Handoff

## Identity

- **task id:**
- **project:**
- **prepared by:**
- **date:**

## Objective

- **unique objective:**
- **definition of done:**
- **non-goals:**

## Baseline

- **current state:**
- **governing source of truth:**
- **branch / revision / environment:**
- **relevant files or systems:**
- **evidence already collected:**
- **open uncertainty:**

## Scope and Authority

- **allowed reads:**
- **allowed changes:**
- **prohibited changes:**
- **destructive operations:** allowed | prohibited | restricted
- **external publication or sending:** allowed | prohibited | restricted

## Required Delivery

- **deliverables:**
- **tests:**
- **negative checks:**
- **receipts:**
- **acceptance gates:**

## Safety

- **stop conditions:**
- **rollback path:**
- **escalate or block when:**

## Return Contract

Return:

- completion state;
- concise verdict;
- what changed;
- affected files, systems, or artifacts;
- tests and checks;
- receipts;
- deviations;
- limitations and residual risks;
- rollback status;
- one objective next step.

## Work Execution Law

Work should:

- follow the packet rather than reconstruct the project from scratch;
- preserve scope and authority;
- verify each meaningful stage;
- stop when a named stop condition occurs;
- record deviations instead of silently normalizing them;
- return `blocked` when safe completion is impossible;
- avoid adjacent improvements that were not authorized;
- never declare completion without appropriate proof.

## Portable Work Return Template

# Work Return

## Identity

- **task id:**
- **project:**
- **completed at:**
- **completion state:** `complete | complete_with_exceptions | partial | blocked | rolled_back`

## Verdict

[One concise statement of the real result.]

## Changes

-

## Affected Surfaces

-

## Tests and Checks

- **check:**
  **result:**
  **evidence:**

## Receipts

-

## Deviations

-

## Limitations

-

## Residual Risks

-

## Rollback Status

- **required:** yes | no
- **performed:** yes | no | not applicable
- **state:**

## Objective Next Step

-

## Chat Re-entry

After Work returns, Chat should:

1. compare the return with the original packet;
2. verify receipts and tests;
3. distinguish completed work from claimed work;
4. inspect exceptions and residual risk;
5. accept, reject, or request a bounded correction;
6. integrate the verified delta into the governing source;
7. update project state, documentation, or next action;
8. preserve useful handoff and return evidence.

## Chat Acceptance Review

# Chat Acceptance Review

- **task id:**
- **Work completion state:**
- **acceptance decision:** accepted | accepted_with_exceptions | correction_required | rejected | rolled_back
- **objective met:** yes | no | partial
- **definition of done met:** yes | no | partial
- **scope respected:** yes | no
- **authority respected:** yes | no
- **deliverables present:** yes | no | partial
- **receipts sufficient:** yes | no
- **acceptance gates passed:** yes | no | partial
- **verified delta:**
- **exceptions:**
- **governing destination:**
- **source update applied:** yes | no
- **next action:**

## Checkpoint Fallback

When Work is unavailable, unnecessary, or too expensive for the remaining operation, Chat may continue through explicit checkpoints.

Each checkpoint should preserve:

- current objective;
- completed operations;
- receipts;
- current baseline;
- unresolved risks;
- next bounded operation;
- stop or rollback condition;
- recovery path.

# Execution Checkpoint

- **checkpoint id:**
- **objective:**
- **state:** active | paused | blocked | complete
- **completed:**
- **receipts:**
- **current baseline:**
- **open risks:**
- **next operation:**
- **stop condition:**
- **recovery path:**

A checkpoint is not a ceremonial progress report. It must make the task safely resumable.

## Anti-Patterns

### Raw-thread escalation

Sending Work a long conversation and expecting it to infer objective, authority, and done condition.

### Prestige escalation

Using Work because it feels more capable or more serious.

### Fog outsourcing

Spending Work allowance to discover what Chat should have clarified first.

### Work for bounded tasks

Using Work for summaries, first-pass reading, ordinary drafting, simple research, or a small patch.

### Duplicate execution

Running the same operation independently in Chat and Work, producing divergent states.

### Unreceipted success

Declaring completion without diffs, tests, revisions, hashes, logs, or equivalent proof.

### Scope creep

Allowing Work to widen project governance because adjacent improvements appeared convenient.

### Chat as passive receptionist

Treating Chat as a handoff writer instead of the default lane for analysis, bounded execution, verification, and integration.

### Protocol theater

Creating elaborate packets and ledgers for trivial work. The protocol exists to reduce waste, not become another form of it.

## Minimal Decision Matrix

| Condition | Chat | Work |
|---|---:|---:|
| Objective still ambiguous | Yes | No |
| Research or source resolution | Yes | Rarely |
| Writing, review, or planning | Yes | Rarely |
| Small or medium verifiable edit | Yes | No |
| Independent bounded steps | Yes | No |
| Long dependent execution chain | Prepare / checkpoint | Yes |
| Stateful build–test–repair loop | Prepare / verify | Yes |
| Multi-module migration | Prepare | Execute |
| Final verification and integration | Yes | Return only |
| Source update and continuity record | Yes | Provide receipts |

## Quality Assurance

Before routing to Work, confirm:

- the objective is singular;
- the definition of done is testable;
- the baseline is current;
- the source of truth is explicit;
- scope and authority are bounded;
- prohibited actions are named;
- receipts and acceptance gates are defined;
- stop conditions and rollback exist where needed;
- Work buys continuity that Chat cannot safely provide through checkpoints.

After Work returns, confirm:

- the completion state matches reality;
- receipts support the verdict;
- scope and authority were respected;
- tests and negative checks are visible;
- exceptions and residual risks are explicit;
- the verified delta has been integrated;
- the next action is objective.

## Usage-Model Note

ChatGPT product availability and usage accounting may change. At publication, Work follows the agentic usage structure shared with supported agentic features such as Codex, while ordinary Chat uses separate limits. Check the current usage dashboard and plan documentation for account-specific details.

The protocol remains useful if exact allowances change because its governing question is structural:

> **Does this operation genuinely require sustained agentic continuity?**

## Attribution Ops

### Short attribution

> Chat–Work Routing Protocol — created by Lua Helena Moon Martins Cardoso (Moon), Moon Professional Source.  
> https://www.luahelena.com.br/ia/?lang=en

### Adaptation attribution

> Adapted from the **Chat–Work Routing Protocol** by Lua Helena Moon Martins Cardoso (Moon), Moon Professional Source: https://www.luahelena.com.br/ia/?lang=en  
> Modifications by: [name / project], [date or version].

Public sharing, internal adoption, quotation, translation, and adaptation are welcome when original authorship remains visible, modified versions identify themselves as adaptations, and use does not imply partnership, endorsement, or access to private Moon Source materials.

## Final Law

> **Chat is the open, resumable workshop. Work is the operating room. The operating room is not where you go to decide which organ hurts.**
