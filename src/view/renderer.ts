import Phaser from 'phaser';
import { defineQuery, enterQuery, exitQuery } from 'bitecs';
import { getWorld } from '../core/state';
import { Position, CharacterState } from '../ecs/components';
import { fromFixed } from '../lib/math';
import { STATE_IDLE, STATE_WALK, STATE_CROUCH, STATE_JUMP } from '../core/fsm';

const renderQuery = defineQuery([Position, CharacterState]);
const renderQueryEnter = enterQuery(renderQuery);
const renderQueryExit = exitQuery(renderQuery);

const sprites = new Map<number, Phaser.GameObjects.Container>();
let scene: Phaser.Scene;

export function initRenderer(s: Phaser.Scene) {
    scene = s;
}

export function renderSystem(_interpolation: number) {
    if (!scene) return;

    const world = getWorld();
    
    // Create new sprites
    const enterEntities = renderQueryEnter(world);
    for (let i = 0; i < enterEntities.length; i++) {
        const eid = enterEntities[i];
        
        // Use a container for more complex visuals later
        const container = scene.add.container(0, 0);
        
        // Body
        const rect = scene.add.rectangle(0, 0, 50, 100, 0xffffff);
        rect.setName('body');
        
        // "Eye" to show facing
        const eye = scene.add.rectangle(15, -30, 10, 10, 0x000000);
        eye.setName('eye');

        container.add([rect, eye]);
        sprites.set(eid, container);
    }

    // Remove old sprites
    const exitEntities = renderQueryExit(world);
    for (let i = 0; i < exitEntities.length; i++) {
        const eid = exitEntities[i];
        const sprite = sprites.get(eid);
        if (sprite) {
            sprite.destroy();
            sprites.delete(eid);
        }
    }

    // Update sprites
    const entities = renderQuery(world);
    for (let i = 0; i < entities.length; i++) {
        const eid = entities[i];
        const sprite = sprites.get(eid);
        if (!sprite) continue;

        const x = fromFixed(Position.x[eid]);
        const y = fromFixed(Position.y[eid]);
        const state = CharacterState.state[eid];
        const facing = CharacterState.facing[eid] || 1;

        sprite.setPosition(x, y);
        sprite.setScale(facing, 1);

        const body = sprite.getByName('body') as Phaser.GameObjects.Rectangle;

        // Visuals based on state
        switch (state) {
            case STATE_IDLE: 
                body.setFillStyle(0xffffff); // White
                body.height = 100;
                break;
            case STATE_WALK: 
                body.setFillStyle(0x00ff00); // Green
                body.height = 100;
                break;
            case STATE_CROUCH: 
                body.setFillStyle(0x0000ff); // Blue
                body.height = 60; 
                body.y = 20; // Offset down so feet stay on ground
                break;
            case STATE_JUMP: 
                body.setFillStyle(0xff0000); // Red
                body.height = 100;
                body.y = 0;
                break;
            default:
                body.y = 0;
        }
        
        if (state !== STATE_CROUCH) body.y = 0;
    }
}
