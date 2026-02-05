import { defineQuery } from 'bitecs';
import { getWorld } from './state';
import { CharacterState, Input, Velocity, Position } from '../ecs/components';
import { 
    INPUT_UP, INPUT_DOWN, INPUT_LEFT, INPUT_RIGHT 
} from './input';
import { toFixed } from '../lib/math';

export const STATE_IDLE = 0;
export const STATE_WALK = 1;
export const STATE_CROUCH = 2;
export const STATE_JUMP = 3;

const WALK_SPEED = toFixed(4);
const JUMP_FORCE = toFixed(-15);
const GRAVITY = toFixed(0.8);
const GROUND_Y = toFixed(400);

const stateQuery = defineQuery([CharacterState, Input, Velocity, Position]);

export function stateMachineSystem() {
    const world = getWorld();
    const entities = stateQuery(world);

    for (let i = 0; i < entities.length; i++) {
        const eid = entities[i];
        
        const input = Input.flags[eid];
        const currentState = CharacterState.state[eid];
        
        let nextState = currentState;
        let nextVelX = 0;
        let nextVelY = Velocity.y[eid];

        // State Logic
        switch (currentState) {
            case STATE_IDLE:
                if (input & INPUT_UP) {
                    nextState = STATE_JUMP;
                    nextVelY = JUMP_FORCE;
                } else if (input & INPUT_DOWN) {
                    nextState = STATE_CROUCH;
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
