import Phaser from 'phaser';
import { getWorld, createTestEntity } from './core/state';
import { startLoop, setCallbacks } from './core/loop';
import { Position, Velocity } from './ecs/components';
import { fromFixed } from './lib/math';
import { defineQuery } from 'bitecs';

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

// -- Main --
console.log('Starting SF Clone Core...');

const eid = createTestEntity();
console.log(`Spawned Entity ${eid} at (100, 300) with Velocity (2, 0)`);

// Integration with Phaser
class MainScene extends Phaser.Scene {
    text!: Phaser.GameObjects.Text;
    circle!: Phaser.GameObjects.Arc;

    constructor() {
        super('MainScene');
    }

    create() {
        this.text = this.add.text(10, 10, 'SF Clone Phase 1', { color: '#ffffff' });
        this.circle = this.add.circle(0, 0, 10, 0xff0000);
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

const game = new Phaser.Game(config);

// Logic Loop
setCallbacks(
    // Update (60Hz)
    () => {
        movementSystem();
        tickCount++;
        
        // Log to console every 60 ticks (1 second)
        if (tickCount % 60 === 0) {
            const x = fromFixed(Position.x[eid]);
            console.log(`Tick ${tickCount}: Entity Pos X=${x}`);
        }
    },
    // Render (Monitor Hz)
    () => {
        // Interpolate position for rendering (simple linear interpolation could go here)
        // For now, just taking current state
        const x = fromFixed(Position.x[eid]);
        const y = fromFixed(Position.y[eid]);
        
        const scene = game.scene.getScene('MainScene') as MainScene;
        if (scene && scene.text) {
            scene.text.setText(`Tick: ${tickCount}\nEntity Pos: (${x.toFixed(3)}, ${y.toFixed(3)})`);
            scene.circle.setPosition(x, y);
        }
    }
);

startLoop();
