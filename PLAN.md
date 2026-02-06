# Street Fighter Clone - Roadmap (Agent Optimized)

## Executive Summary
**Project:** SF_Clone (Project Shoryuken)
**Stack:** Web/JS (Phaser 3 + TypeScript + Vite)
**Core Pillar:** Deterministic Gameplay with Rollback Netcode
**Target:** A lightweight, highly iterative 2D fighting game built by AI Subagents.

---

## 1. Technical Architecture

### Engine: Phaser 3 + Vite
We chose **Phaser 3** because:
1.  **Code-First:** Entirely controllable via text files (JS/TS). No binary scene files or GUI editors.
2.  **Iteration Speed:** Hot-module replacement via Vite allows instant testing.
3.  **Portability:** Runs in any browser, easy to deploy for testing.

### Core Pattern: Deterministic Simulation (The "Black Box")
To support Rollback Netcode, the game logic must be **completely decoupled** from Phaser's rendering loop.

*   **The Sim (Logic):** Pure JavaScript/TypeScript.
    *   *Math:* Integer Math only. (e.g., `x: 15000` = 15.000px). No floats.
    *   *State:* A specialized `GameState` object/buffer that can be serialized/cloned instantly.
    *   *Loop:* A fixed timestep loop (e.g., 60hz) independent of screen refresh rate.
*   **The View (Presentation):** Phaser GameObjects.
    *   Reads `GameState` components.
    *   Interpolates sprites between previous and current tick for smooth 144hz+ rendering.
    *   Visual effects are strictly "fire and forget" and do not affect game state.

### Entity Component System (ECS) - bitECS
We will use **bitECS** for performance and strict data separation.
*   **Entities:** Integers.
*   **Components:** TypedArrays (Int32Array, Uint8Array). This makes "saving state" as easy as copying a few arrays.
*   **Systems:** `PhysicsSystem`, `InputSystem`, `HitboxSystem`.

---

## 2. Development Phases

### Phase 1: The Code Foundation
*Goal: A generic red box and blue box moving deterministically in a browser.*
- [ ] **Setup:** Initialize Vite + Phaser + TypeScript project.
- [ ] **Deterministic Loop:** Implement a fixed-step accumulator loop (Update @ 60fps, Render @ Monitor Hz).
- [ ] **Integer Math:** Create a helper library for handling integer coordinates/velocities.
- [ ] **State Management:**
    - [ ] Implement `GameState` serialization (saving/loading bitECS worlds).
    - [ ] Verify determinism (replay same inputs = exact same state).

### Phase 2: The Character Body
*Goal: A character that can Idle, Walk, and Crouch.*
- [ ] **Input Handling:**
    - [ ] Hardware Polling (Keyboard/Gamepad API).
    - [ ] Input Buffer (Circular buffer for last 60 frames).
    - [ ] Input Delay Logic.
- [ ] **State Machine:**
    - [ ] Finite State Machine (FSM) for character actions (Idle, Walk, Crouch, Jump).
- [ ] **Animation Integration:**
    - [ ] Link Logic States (e.g., `state: ATTACK`) to Phaser Animation Keys.

### Phase 3: The Fight Systems
*Goal: Hitboxes, Hurtboxes, and Collisions.*
- [ ] **Collision Engine:**
    - [ ] AABB (Axis-Aligned Bounding Box) physics implementation using Integer Math.
    - [ ] Pushbox logic (players cannot overlap).
    - [ ] Stage bounds.
- [ ] **Combat Logic:**
    - [ ] Hitboxes (Red) vs Hurtboxes (Green).
    - [ ] Hitstun, Blockstun, and Hitstop (freeze frames).
    - [ ] Health and Damage calculations.

### Phase 4: Netcode (Rollback)
*Goal: P2P Multiplayer over the web.*
- [ ] **Transport Layer:** Implement **PeerJS** (WebRTC) for UDP-like data transfer.
- [ ] **Rollback Engine:**
    - [ ] **Prediction:** Execute frames assuming remote input is same as last frame.
    - [ ] **Rollback:** On input mismatch, restore `GameState` from history -> re-simulate frames -> render.
- [ ] **Desync Detection:** Checksum comparison every N frames.

### Phase 5: Visuals & Juice
*Goal: Make it look good.*
- [ ] **Art Pipeline:** Aseprite spritesheets.
- [ ] **VFX:** Particle emitters for hits/blocks (visual only).
- [ ] **UI:** Health bars, Super meter, Round timer.

#### Asset List (Production)
*   **Neon Samurai (P1):**
    - [ ] Idle (4 frames)
    - [ ] Walk (6 frames)
    - [ ] Attack Light (3 frames)
    - [ ] Hit (1 frame)
*   **Heavy Cyborg (P2):**
    - [ ] Idle (4 frames)
    - [ ] Walk (6 frames)
    - [ ] Attack Heavy (3 frames)
    - [ ] Hit (1 frame)
*   **Stages (Clean):**
    - [ ] Neon Dojo (Rooftop only)
    - [ ] Cyber Slums (Alleyway only)
*   **UI Kit:**
    - [ ] Healthbar Frame & Fill
    - [ ] Timer Background


---

## 3. Directory Structure
```text
sf-clone/
├── index.html
├── package.json
├── public/
│   └── assets/             # Sprites, Audio, JSON data
└── src/
    ├── main.ts             # Entry point
    ├── config.ts           # Phaser Config
    ├── core/
    │   ├── loop.ts         # Deterministic Loop
    │   ├── input.ts        # Input Buffers
    │   └── network.ts      # PeerJS / Rollback logic
    ├── ecs/
    │   ├── components.ts   # bitECS Components (Pos, Vel, Box)
    │   └── systems/        # Logic (Movement, Physics, Combat)
    ├── lib/
    │   └── math.ts         # Integer Math Utils
    └── view/
        ├── scenes/         # Phaser Scenes (MainGame, Menu)
        └── renderer.ts     # Sync ECS state to Sprites
```
