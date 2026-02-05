import { createWorld, addEntity, addComponent } from 'bitecs';
import type { IWorld } from 'bitecs';
import { Position, Velocity, Input, CharacterState } from '../ecs/components';
import { toFixed } from '../lib/math';
import { STATE_IDLE } from './fsm';

let world: IWorld;

export function getWorld(): IWorld {
    if (!world) world = createWorld();
    return world;
}

export function createTestEntity() {
    const w = getWorld();
    const eid = addEntity(w);
    addComponent(w, Position, eid);
    addComponent(w, Velocity, eid);
    addComponent(w, Input, eid);
    addComponent(w, CharacterState, eid);
    
    Position.x[eid] = toFixed(100);
    Position.y[eid] = toFixed(300);
    Velocity.x[eid] = 0;
    Velocity.y[eid] = 0;

    CharacterState.state[eid] = STATE_IDLE;
    CharacterState.facing[eid] = 1;
    
    return eid;
}

// Basic state serialization (stub)
export function serializeState() {
    // In a real app, we'd serialize the buffers
    return "STATE_DATA";
}
