import { defineQuery } from 'bitecs';
import { getWorld } from './state';
import { Position, Velocity, PushBox, HurtBox, HitBox, Health, CombatState, CharacterState } from '../ecs/components';
import { checkAABB, getOverlapX } from './collision';
import { STATE_HITSTUN } from './fsm';

const pushboxQuery = defineQuery([Position, PushBox, Velocity]);
const hitboxQuery = defineQuery([Position, HitBox, CharacterState, CombatState]);
const hurtboxQuery = defineQuery([Position, HurtBox, CharacterState, Health, CombatState]);

export function combatSystem() {
    const world = getWorld();
    
    // 1. Pushbox Collision
    const pushEntities = pushboxQuery(world);
    for (let i = 0; i < pushEntities.length; i++) {
        for (let j = i + 1; j < pushEntities.length; j++) {
            const e1 = pushEntities[i];
            const e2 = pushEntities[j];
            
            const x1 = Position.x[e1] + PushBox.offsetX[e1];
            const y1 = Position.y[e1] + PushBox.offsetY[e1];
            const w1 = PushBox.width[e1];
            const h1 = PushBox.height[e1];
            
            const x2 = Position.x[e2] + PushBox.offsetX[e2];
            const y2 = Position.y[e2] + PushBox.offsetY[e2];
            const w2 = PushBox.width[e2];
            const h2 = PushBox.height[e2];
            
            if (checkAABB(x1, y1, w1, h1, x2, y2, w2, h2)) {
                const overlap = getOverlapX(x1, w1, x2, w2);
                if (overlap !== 0) {
                    const shift = Math.floor(overlap / 2);
                    Position.x[e1] += shift;
                    Position.x[e2] -= shift;
                }
            }
        }
    }

    // 2. Hitbox vs Hurtbox
    const attackers = hitboxQuery(world);
    const victims = hurtboxQuery(world);
    
    for (let i = 0; i < attackers.length; i++) {
        const att = attackers[i];
        
        // Skip if Hitbox inactive or attacker in Hitstun (interrupted)
        if (!HitBox.active[att]) continue;
        if (CharacterState.state[att] === STATE_HITSTUN) continue;

        // Calculate Attacker Hitbox World Pos
        const facingA = CharacterState.facing[att];
        const offXA = HitBox.offsetX[att];
        // If facing left (-1), box is flipped relative to center? 
        // Or simplified: Box X is center + offset.
        // Let's assume offset is always relative to center in the facing direction.
        // X = Pos + (Facing * Offset) - (Facing == -1 ? Width : 0) ?
        // Standard: anchor is bottom-center.
        // X = Pos + OffsetX * Facing. (If Facing is 1, X+Offset. If -1, X-Offset).
        // But if we subtract offset, the box starts at X-Offset. It extends right?
        // Box is [X, X+W].
        // If facing right: [X+Off, X+Off+W]
        // If facing left:  [X-Off-W, X-Off]
        
        const boxXA = (facingA === 1) 
            ? Position.x[att] + offXA 
            : Position.x[att] - offXA - HitBox.width[att];
            
        const boxYA = Position.y[att] + HitBox.offsetY[att];
        
        for (let j = 0; j < victims.length; j++) {
            const vic = victims[j];
            if (att === vic) continue;
            
            // Skip if victim is in Hitstop (already hit this frame or paused)
            if (CombatState.hitStopTimer[vic] > 0) continue;

            const facingV = CharacterState.facing[vic];
            const offXV = HurtBox.offsetX[vic];
            const boxXV = (facingV === 1)
                ? Position.x[vic] + offXV
                : Position.x[vic] - offXV - HurtBox.width[vic];
                
            const boxYV = Position.y[vic] + HurtBox.offsetY[vic];

            if (checkAABB(
                boxXA, boxYA, HitBox.width[att], HitBox.height[att],
                boxXV, boxYV, HurtBox.width[vic], HurtBox.height[vic]
            )) {
                console.log(`Hit Confirmed: ${att} -> ${vic} | Damage: ${HitBox.damage[att]}`);
                
                // Apply Damage
                Health.current[vic] -= HitBox.damage[att];
                
                // Apply Stun
                CombatState.hitStunTimer[vic] = HitBox.hitstun[att];
                CombatState.isHit[vic] = 1;
                
                // Trigger State Change
                CharacterState.state[vic] = STATE_HITSTUN;
                CharacterState.timer[vic] = 0;
                Velocity.x[vic] = 0; // Stop movement
                
                // Hitstop (freeze both)
                const stopTime = 10; // 10 ticks
                CombatState.hitStopTimer[att] = stopTime;
                CombatState.hitStopTimer[vic] = stopTime;
                
                // Deactivate Hitbox (Single hit)
                HitBox.active[att] = 0;
            }
        }
    }
}
