import Phaser from 'phaser';
import { getWorld, createTestEntity } from './core/state';
import { startLoop, setCallbacks } from './core/loop';
import { Position, Velocity, Input } from './ecs/components';
import { defineQuery } from 'bitecs';
import { initInput, pushInput, getCurrentInput } from './core/input';
import { stateMachineSystem } from './core/fsm';
import { initRenderer, renderSystem } from './view/renderer';

// -- ECS Systems --
const movementQuery = defineQuery([Position, Velocity]);
let tickCount = 0;

function movementSystem() {
    const w = getWorld();
    const ents = movementQuery(w);
    for (let i = 0; i < ents.length; i++) {
        const eid = ents[i];
        Position.x[eid] += Velocity.x[eid];
        Position.y[eid] += Velocity.y[eid];
    }
}

function inputSystem() {
    const w = getWorld();
    const inputEntities = defineQuery([Input])(w);
    const current = getCurrentInput();
    
    for (let i = 0; i < inputEntities.length; i++) {
        const eid = inputEntities[i];
        Input.flags[eid] = current;
    }
}

// -- Main --
console.log('Starting SF Clone Phase 2...');

initInput();
const eid = createTestEntity();
console.log(`Spawned Entity: ${eid}`);

// Integration with Phaser
class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
    }

    create() {
        this.add.text(10, 10, 'SF Clone Phase 2\nArrows: Move/Jump/Crouch\nWASD: Alternative', { color: '#ffffff' });
        
        // Ground line (visual only, logic is in FSM)
        // Ground is at 400
        this.add.line(0, 400, 0, 0, 800, 0, 0x888888).setOrigin(0,0);
        
        initRenderer(this);
    }
}

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'app',
    scene: MainScene,
    backgroundColor: '#2d2d2d'
};

new Phaser.Game(config);

// Logic Loop
setCallbacks(
    // Update (60Hz)
    () => {
        pushInput(); // Store in buffer (for rollback later)
        inputSystem(); // Apply to ECS
        stateMachineSystem();
        movementSystem();
        tickCount++;
    },
    // Render
    (interpolation) => {
        renderSystem(interpolation);
    }
);

startLoop();
