# Vibe Context

## Functional Specification & Cursor Build Prompt

---

## PART A — FUNCTIONAL SPECIFICATION

---

## 1. Product Overview

**Vibe Context** is a Cursor IDE extension that captures and preserves developer *session-level intent* during vibe coding. It prevents context loss, reduces AI hallucination, and improves developer productivity by making intent retrievable later — without interrupting flow.

---

## 2. Target User

* Solo developers
* Indie hackers
* Vibe coders using Cursor

Non-target (for MVP):

* Large teams
* Project managers
* Non-technical users

---

## 3. Core User Problems

1. Developers forget *why* code was written
2. AI tools hallucinate due to missing context
3. Context writing interrupts flow
4. Revisiting old code is slow and error-prone

---

## 4. Core Design Principles

* Session is the source of truth
* Flow must never be interrupted
* Human intent > AI inference
* AI must be honest when context is missing
* Simplicity over completeness

---

## 5. Functional Scope (MVP)

### 5.1 Session Lifecycle Management

**Functions**

* Auto-detect first file edit
* Suggest session start
* Manual session confirmation
* Manual session end

**Rules**

* Only one active session at a time
* Session must be ended explicitly

---

### 5.2 Automatic Context Capture

**Captured Automatically**

* Session start & end timestamps
* Files touched during session
* Lightweight git diff summary

**Constraints**

* No full source code storage
* No background analysis

---

### 5.3 Intent Capture

**Function**

* Optional one-line intent input on session end

**Rules**

* Never mandatory
* Editable before final save

---

### 5.4 Session Storage

**Stored Data**

* Session metadata
* Intent
* File list
* Diff summary

**Storage Mode (MVP)**

* Local memory first
* Backend persistence optional (Phase 2)

---

### 5.5 Explain From Memory

**Function**

* User can ask: "Why was this written?"

**Rules**

* AI responds only using saved session data
* If context missing → explicit message

---

## 6. Non-Functional Requirements

* Zero noticeable latency
* No forced user input
* No breaking developer flow
* Safe by default

---

## 7. Error Handling

* Missing session → clear warning
* Partial context → marked explicitly
* Conflicting sessions → block start

---

## 8. Security & Privacy

* No source code persistence
* Local-first processing
* User-controlled session lifecycle

---

## 9. Success Criteria (MVP)

* Developer can retrieve intent later
* AI does not hallucinate
* Flow remains uninterrupted

---

## 10. Explicit Non-Goals

* Feature detection
* Auto documentation
* AI code generation
* Team collaboration

---

---

## PART B — COMPREHENSIVE CURSOR BUILD PROMPT

---

You are an expert TypeScript engineer building a **Cursor IDE extension**.

THIS IS A SOFTWARE IMPLEMENTATION TASK.
NOT A DESIGN, SUMMARY, OR HIGH-LEVEL EXPLANATION TASK.

### GOAL

Build a Cursor-compatible VS Code extension called **Vibe Context** that captures session-level developer intent during coding.

---

### ABSOLUTE CONSTRAINTS

1. Build ONLY the MVP described below.
2. Do NOT add extra features.
3. Do NOT introduce AI inference or guessing.
4. Do NOT auto-explain code.
5. One session at a time.

---

### MVP FUNCTIONAL REQUIREMENTS

#### Session Lifecycle

* Auto-detect first file edit
* Prompt user to start session
* Manual start & end

#### Session Data

* Track files touched
* Track timestamps
* Optional intent input

#### Commands

* Context: Start Session
* Context: End Session
* Context: Explain From Memory

#### Explain Logic

* If session exists and ended → show intent
* If no session → show warning

---

### TECH STACK

* TypeScript
* VS Code Extension API (Cursor-compatible)
* No backend initially
* No AI initially

---

### CODE STRUCTURE

* `extension.ts` contains all logic
* No external services
* Use in-memory storage

---

### IMPLEMENTATION RULES

* Use strict typing
* Avoid global state pollution
* Keep logic readable
* Prefer clarity over abstraction

---

### OUTPUT REQUIREMENTS

* Provide complete `extension.ts`
* Provide required `package.json` changes
* No pseudo-code
* No TODO placeholders

---

### FAILURE CONDITIONS

* Auto explanations added
* AI inference without context
* Multiple sessions allowed
* Forced user input

---

### SUCCESS CONDITION

A developer can:

1. Start a session
2. Code freely
3. End the session
4. Ask "Explain from memory"
5. Receive a truthful response

---

END OF PROMPT
