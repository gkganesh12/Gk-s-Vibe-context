# Vibe Context — Software Design Document (SDD)

## 1. Document Purpose

This document defines the **software-level design** for building the next version of **Vibe Context** as a VS Code extension.

It translates product intent into **clear system components, responsibilities, data flows, and boundaries** — without implementation code.

The goal is to enable:

- Focused development
- Predictable evolution
- Low-risk extension of capabilities

---

## 2. System Overview

### 2.1 System Definition

**Vibe Context** is a **local-first VS Code extension** that captures, stores, analyzes, and surfaces _developer intent and development context_ to make AI-assisted coding safer and more understandable.

The system operates entirely inside the editor and acts as a **memory + intelligence layer**, not a code generator.

---

## 3. Architectural Principles

- **Passive-first**: Capture signals automatically
- **Deterministic behavior**: No opaque AI decisions
- **Heuristic intelligence**: Rules before ML
- **Low-noise UX**: Intervene only when justified
- **Composable layers**: Each layer can evolve independently

---

## 4. High-Level Architecture

### 4.1 Logical Layers

1. **Event Capture Layer**
2. **Context Storage Layer**
3. **Intelligence Layer**
4. **Interaction Layer (UI)**
5. **Integration Layer**

Each layer communicates through well-defined internal APIs.

---

## 5. Component Design

### 5.1 Event Capture Layer

**Responsibility**

- Observe developer activity without disruption

**Captured Events**

- Session start / end
- File open / close
- Text document changes
- Git metadata (diff summaries)
- Manual intent / decision entries

**Design Constraints**

- No heavy processing in listeners
- Events must be timestamped and ordered

---

### 5.2 Context Storage Layer

**Responsibility**

- Persist development context locally
- Provide time-indexed retrieval

**Key Characteristics**

- Immutable historical records
- Append-only session logs
- No cross-session mutation

**Stored Entities**

- Session
- Intent
- Decision
- FileChange
- DerivedSignals

---

### 5.3 Intelligence Layer

**Responsibility**

- Analyze stored context
- Generate insights without AI dependency

**Subcomponents**

#### 5.3.1 Intent-Aware Prompt Assembler

- Builds constraint-aware AI prompts
- Uses intent, decisions, and scoped context

#### 5.3.2 Context Query Engine

- Answers predefined queries
- Uses deterministic retrieval rules

#### 5.3.3 Intent Drift Analyzer

- Computes divergence between original intent and current state
- Produces drift scores and explanations

#### 5.3.4 Risk Scoring Engine

- Computes blast-radius risk scores for files/modules
- Uses historical and structural signals

**Design Rules**

- No blocking behavior
- No direct UI rendering

---

### 5.4 Interaction Layer (UI)

**Responsibility**

- Surface insights at the right moment

**Interaction Modes**

- Command Palette actions
- Read-only panels
- Passive notifications (later phase)

**Design Constraints**

- No chat interfaces
- No free-text dependency
- Minimal clicks

---

### 5.5 Integration Layer

**Responsibility**

- Interface with external tools without coupling

**Supported Integrations**

- Clipboard export
- AI tools via prompt handoff
- Git metadata consumption

**Explicit Non-Integrations**

- No cloud services
- No direct AI model APIs

---

## 6. Data Model Summary

### Core Entities

- **Session**: Time-bounded development activity
- **Intent**: Goal associated with a session
- **Decision**: Key technical choices made
- **FileChange**: Metadata about edits
- **Signal**: Derived intelligence output

### Relationships

- Session → Intent (1:1)
- Session → Decisions (1:N)
- Session → FileChanges (1:N)
- File → Signals (1:N)

---

## 7. Key Workflows

### 7.1 Development Session Lifecycle

1. Session starts
2. Events captured passively
3. Optional intent/decision input
4. Session ends
5. Summary and signals generated

---

### 7.2 Context Query Workflow

1. User invokes query command
2. Engine resolves file/session scope
3. Relevant context retrieved
4. Answer rendered

---

### 7.3 Intent Drift Evaluation Workflow

1. New changes detected
2. Compare against original intent
3. Drift score computed
4. Stored for later surfacing

---

## 8. Non-Functional Requirements

- Low memory overhead
- Fast response (<1s for queries)
- No noticeable editor lag
- Safe under frequent file changes

---

## 9. Security & Privacy

- All data stored locally
- No telemetry by default
- No external network calls

---

## 10. Explicit Out of Scope

- Team collaboration
- Cloud synchronization
- Real-time AI inference
- Analytics dashboards

---

## 11. Future Extension Points

- Team-level memory
- Cross-repo context
- AI-assisted explanations (optional)

---

## 12. Success Criteria

- Developer understands code intent faster
- Reduced AI-related regressions
- Extension remains enabled long-term

---

## Final Design Principle

> **The system must be quiet, accurate, and helpful — or not exist at all.**
