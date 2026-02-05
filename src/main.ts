import Phaser from 'phaser';
import { getWorld, createTestEntity } from './core/state';
import { startLoop, setCallbacks, currentP1Input, currentP2Input } from './core/loop';
import { Position, Velocity, Input, PlayerID } from './ecs/components';
import { defineQuery } from 'bitecs';
import { initInput, setPlayerSide } from './core/input';
import { stateMachineSystem } from './core/fsm';
import { initRenderer, renderSystem } from './view/renderer';
import { initNetwork, connectToPeer } from './core/network';

// -- ECS Systems --
const movementQuery = defineQuery([Position, Velocity]);

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
    const inputEntities = defineQuery([Input, PlayerID])(w);
    
    for (let i = 0; i < inputEntities.length; i++) {
        const eid = inputEntities[i];
        const pid = PlayerID.id[eid];
        if (pid === 0) {
            Input.flags[eid] = currentP1Input;
        } else if (pid === 1) {
            Input.flags[eid] = currentP2Input;
        }
    }
}

// -- Main --
console.log('Starting SF Clone Phase 4 (Netcode)...');

initInput();
// Create P1 and P2
const p1 = createTestEntity(0);
const p2 = createTestEntity(1);
console.log(`Spawned P1: ${p1}, P2: ${p2}`);

// Network Setup
const urlParams = new URLSearchParams(window.location.search);
const hostId = urlParams.get('host');

if (hostId) {
    // We are Client -> P2
    setPlayerSide(false);
    console.log("Connecting to Host:", hostId);
    initNetwork().then(() => {
        connectToPeer(hostId);
    });
} else {
    // We are Host -> P1
    setPlayerSide(true);
    console.log("Initializing Host...");
    initNetwork().then((id) => {
        console.log("Host ID:", id);
        // Display ID
        const el = document.createElement('div');
        el.style.position = 'absolute';
        el.style.top = '10px';
        el.style.right = '10px';
        el.style.color = 'white';
        el.style.background = 'rgba(0,0,0,0.5)';
        el.style.padding = '10px';
        el.innerText = `Host ID: ${id}\n(Share this URL with ?host=${id})`;
        document.body.appendChild(el);
    });
}

// Integration with Phaser
class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
    }

    create() {
        this.add.text(10, 10, 'SF Clone Phase 4: Netcode\nArrows/WASD: Move', { color: '#ffffff' });
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
    // Update
    () => {
        inputSystem();
        stateMachineSystem();
        movementSystem();
    },
    // Render
    (interpolation) => {
        renderSystem(interpolation);
    }
);

startLoop();
