import { createWorld, addEntity, addComponent } from 'bitecs';
import type { IWorld } from 'bitecs';
import { 
    Position, Velocity, Input, CharacterState, 
    PushBox, HurtBox, HitBox, Health, CombatState, PlayerID
} from '../ecs/components';
import { toFixed } from '../lib/math';
import { STATE_IDLE } from './fsm';

let world: IWorld;

export function getWorld(): IWorld {
    if (!world) world = createWorld();
    return world;
}

export function createTestEntity(playerId: number) {
    const w = getWorld();
    const eid = addEntity(w);
    addComponent(w, Position, eid);
    addComponent(w, Velocity, eid);
    addComponent(w, Input, eid);
    addComponent(w, PlayerID, eid);
    addComponent(w, CharacterState, eid);
    addComponent(w, Health, eid);
    addComponent(w, CombatState, eid);
    addComponent(w, PushBox, eid);
    addComponent(w, HurtBox, eid);
    addComponent(w, HitBox, eid);
    
    // Set Player ID
    PlayerID.id[eid] = playerId;

    // Start positions
    Position.x[eid] = toFixed(playerId === 0 ? 100 : 300);
    Position.y[eid] = toFixed(300);
    Velocity.x[eid] = 0;
    Velocity.y[eid] = 0;

    CharacterState.state[eid] = STATE_IDLE;
    CharacterState.facing[eid] = playerId === 0 ? 1 : -1;
    
    Health.current[eid] = 1000;
    Health.max[eid] = 1000;

    return eid;
}

export type Snapshot = {
    Position: { x: Int32Array, y: Int32Array };
    Velocity: { x: Int32Array, y: Int32Array };
    Input: { flags: Uint8Array };
    PlayerID: { id: Uint8Array };
    CharacterState: { state: Uint8Array, timer: Uint32Array, facing: Int8Array };
    Health: { current: Int32Array, max: Int32Array };
    CombatState: { hitStunTimer: Uint32Array, hitStopTimer: Uint32Array, isHit: Uint8Array };
    HitBox: { active: Uint8Array, damage: Int32Array, hitstun: Int32Array, width: Int32Array, height: Int32Array, offsetX: Int32Array, offsetY: Int32Array };
    PushBox: { width: Int32Array, height: Int32Array, offsetX: Int32Array, offsetY: Int32Array };
    HurtBox: { width: Int32Array, height: Int32Array, offsetX: Int32Array, offsetY: Int32Array };
};

export function saveState(): Snapshot {
    return {
        Position: { x: Position.x.slice(), y: Position.y.slice() },
        Velocity: { x: Velocity.x.slice(), y: Velocity.y.slice() },
        Input: { flags: Input.flags.slice() },
        PlayerID: { id: PlayerID.id.slice() },
        CharacterState: { 
            state: CharacterState.state.slice(), 
            timer: CharacterState.timer.slice(), 
            facing: CharacterState.facing.slice() 
        },
        Health: { current: Health.current.slice(), max: Health.max.slice() },
        CombatState: { 
            hitStunTimer: CombatState.hitStunTimer.slice(), 
            hitStopTimer: CombatState.hitStopTimer.slice(), 
            isHit: CombatState.isHit.slice() 
        },
        HitBox: {
            active: HitBox.active.slice(),
            damage: HitBox.damage.slice(),
            hitstun: HitBox.hitstun.slice(),
            width: HitBox.width.slice(),
            height: HitBox.height.slice(),
            offsetX: HitBox.offsetX.slice(),
            offsetY: HitBox.offsetY.slice(),
        },
        PushBox: {
            width: PushBox.width.slice(),
            height: PushBox.height.slice(),
            offsetX: PushBox.offsetX.slice(),
            offsetY: PushBox.offsetY.slice(),
        },
        HurtBox: {
            width: HurtBox.width.slice(),
            height: HurtBox.height.slice(),
            offsetX: HurtBox.offsetX.slice(),
            offsetY: HurtBox.offsetY.slice(),
        }
    };
}

export function loadState(snapshot: Snapshot) {
    Position.x.set(snapshot.Position.x);
    Position.y.set(snapshot.Position.y);
    Velocity.x.set(snapshot.Velocity.x);
    Velocity.y.set(snapshot.Velocity.y);
    Input.flags.set(snapshot.Input.flags);
    PlayerID.id.set(snapshot.PlayerID.id);
    
    CharacterState.state.set(snapshot.CharacterState.state);
    CharacterState.timer.set(snapshot.CharacterState.timer);
    CharacterState.facing.set(snapshot.CharacterState.facing);
    
    Health.current.set(snapshot.Health.current);
    Health.max.set(snapshot.Health.max);
    
    CombatState.hitStunTimer.set(snapshot.CombatState.hitStunTimer);
    CombatState.hitStopTimer.set(snapshot.CombatState.hitStopTimer);
    CombatState.isHit.set(snapshot.CombatState.isHit);
    
    HitBox.active.set(snapshot.HitBox.active);
    HitBox.damage.set(snapshot.HitBox.damage);
    HitBox.hitstun.set(snapshot.HitBox.hitstun);
    HitBox.width.set(snapshot.HitBox.width);
    HitBox.height.set(snapshot.HitBox.height);
    HitBox.offsetX.set(snapshot.HitBox.offsetX);
    HitBox.offsetY.set(snapshot.HitBox.offsetY);
    
    PushBox.width.set(snapshot.PushBox.width);
    PushBox.height.set(snapshot.PushBox.height);
    PushBox.offsetX.set(snapshot.PushBox.offsetX);
    PushBox.offsetY.set(snapshot.PushBox.offsetY);
    
    HurtBox.width.set(snapshot.HurtBox.width);
    HurtBox.height.set(snapshot.HurtBox.height);
    HurtBox.offsetX.set(snapshot.HurtBox.offsetX);
    HurtBox.offsetY.set(snapshot.HurtBox.offsetY);
}
