import { createWorld, addEntity, addComponent } from 'bitecs';
import type { IWorld } from 'bitecs';
import { Position, Velocity } from '../ecs/components';
import { toFixed } from '../lib/math';

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
    
    Position.x[eid] = toFixed(100);
    Position.y[eid] = toFixed(300);
    Velocity.x[eid] = toFixed(2); // 2 units/tick
    Velocity.y[eid] = 0;
    
    return eid;
}

// Basic state serialization (stub)
export function serializeState() {
    // In a real app, we'd serialize the buffers
    return "STATE_DATA";
}
