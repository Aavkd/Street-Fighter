import { defineQuery } from 'bitecs';
import { getWorld } from './state';
import { CharacterState, Input, Velocity, Position, HitBox, CombatState } from '../ecs/components';
import { 
    INPUT_UP, INPUT_DOWN, INPUT_LEFT, INPUT_RIGHT, INPUT_LP, INPUT_HP 
} from './input';
import { toFixed } from '../lib/math';

export const STATE_IDLE = 0;
export const STATE_WALK = 1;
export const STATE_CROUCH = 2;
export const STATE_JUMP = 3;
export const STATE_ATTACK_LIGHT = 4;
export const STATE_ATTACK_HEAVY = 5;
export const STATE_HITSTUN = 6;

const WALK_SPEED = toFixed(4);
const JUMP_FORCE = toFixed(-15);
const GRAVITY = toFixed(0.8);
const GROUND_Y = toFixed(400);

const stateQuery = defineQuery([CharacterState, Input, Velocity, Position]); // Updates main query if needed?
// Queries in BitECS are dynamic, so adding components later doesn't break existing queries unless we require them.
// But we need to access HitBox/CombatState inside the loop, so we should check if they exist on the entity.
// Or just assume players have them.

export function stateMachineSystem() {
    const world = getWorld();
    const entities = stateQuery(world);

    for (let i = 0; i < entities.length; i++) {
        const eid = entities[i];
        
        // Handle Hitstop (Freeze)
        if (CombatState.hitStopTimer[eid] && CombatState.hitStopTimer[eid] > 0) {
            CombatState.hitStopTimer[eid]--;
            continue; // Skip FSM update during hitstop
        }

        const input = Input.flags[eid];
        const currentState = CharacterState.state[eid];
        const timer = CharacterState.timer[eid];
        
        let nextState = currentState;
        let nextVelX = 0;
        let nextVelY = Velocity.y[eid];

        // Default: Hitbox inactive
        if (HitBox.active[eid] !== undefined) HitBox.active[eid] = 0;

        // State Logic
        switch (currentState) {
            case STATE_IDLE:
                if (input & INPUT_UP) {
                    nextState = STATE_JUMP;
                    nextVelY = JUMP_FORCE;
                } else if (input & INPUT_DOWN) {
                    nextState = STATE_CROUCH;
                } else if (input & INPUT_LP) {
                    nextState = STATE_ATTACK_LIGHT;
                } else if (input & INPUT_HP) {
                    nextState = STATE_ATTACK_HEAVY;
                } else if ((input & INPUT_LEFT) || (input & INPUT_RIGHT)) {
                    nextState = STATE_WALK;
                }
                break;

            case STATE_WALK:
                if (input & INPUT_UP) {
                    nextState = STATE_JUMP;
                    nextVelY = JUMP_FORCE;
                } else if (input & INPUT_DOWN) {
                    nextState = STATE_CROUCH;
                } else if (input & INPUT_LP) {
                    nextState = STATE_ATTACK_LIGHT;
                } else if (input & INPUT_HP) {
                    nextState = STATE_ATTACK_HEAVY;
                } else if (!((input & INPUT_LEFT) || (input & INPUT_RIGHT))) {
                    nextState = STATE_IDLE;
                } else {
                    if (input & INPUT_LEFT) {
                        nextVelX = -WALK_SPEED;
                        CharacterState.facing[eid] = -1;
                    }
                    if (input & INPUT_RIGHT) {
                        nextVelX = WALK_SPEED;
                        CharacterState.facing[eid] = 1;
                    }
                    if ((input & INPUT_LEFT) && (input & INPUT_RIGHT)) {
                        nextVelX = 0;
                        nextState = STATE_IDLE;
                    }
                }
                break;

            case STATE_CROUCH:
                if (!(input & INPUT_DOWN)) {
                    if ((input & INPUT_LEFT) || (input & INPUT_RIGHT)) nextState = STATE_WALK;
                    else nextState = STATE_IDLE;
                }
                // TODO: Crouch attacks
                break;

            case STATE_JUMP:
                nextVelX = Velocity.x[eid]; // Preserve momentum
                nextVelY += GRAVITY;
                
                // Ground collision
                if (Position.y[eid] >= GROUND_Y && nextVelY > 0) {
                    Position.y[eid] = GROUND_Y;
                    nextVelY = 0;
                    nextVelX = 0;
                    nextState = STATE_IDLE;
                }
                break;

            case STATE_ATTACK_LIGHT:
                // Frame data: 5 startup, 5 active, 5 recovery
                if (timer < 5) {
                    // Startup
                } else if (timer < 10) {
                    // Active
                    HitBox.active[eid] = 1;
                    HitBox.width[eid] = 60; // Example values
                    HitBox.height[eid] = 40;
                    HitBox.offsetX[eid] = 40;
                    HitBox.offsetY[eid] = -50;
                    HitBox.damage[eid] = 10;
                    HitBox.hitstun[eid] = 20;
                } else if (timer < 15) {
                    // Recovery
                } else {
                    nextState = STATE_IDLE;
                }
                // Cancel into Special (Not implemented yet)
                break;

            case STATE_ATTACK_HEAVY:
                // Frame data: 8 startup, 8 active, 10 recovery
                if (timer < 8) {
                    // Startup
                } else if (timer < 16) {
                    // Active
                    HitBox.active[eid] = 1;
                    HitBox.width[eid] = 80;
                    HitBox.height[eid] = 50;
                    HitBox.offsetX[eid] = 50;
                    HitBox.offsetY[eid] = -60;
                    HitBox.damage[eid] = 20;
                    HitBox.hitstun[eid] = 30;
                } else if (timer < 26) {
                    // Recovery
                } else {
                    nextState = STATE_IDLE;
                }
                break;

            case STATE_HITSTUN:
                if (CombatState.hitStunTimer[eid] > 0) {
                    CombatState.hitStunTimer[eid]--;
                    // Pushback friction could go here
                } else {
                    nextState = STATE_IDLE;
                    CombatState.isHit[eid] = 0;
                }
                break;
        }

        // Apply State Changes
        if (nextState !== currentState) {
            CharacterState.state[eid] = nextState;
            CharacterState.timer[eid] = 0;
            // console.log(`[FSM] Entity ${eid} ${currentState} -> ${nextState}`);
        } else {
            CharacterState.timer[eid]++;
        }

        Velocity.x[eid] = nextVelX;
        Velocity.y[eid] = nextVelY;
    }
}
