import { sendInput } from './network';

export const INPUT_UP    = 1 << 0;
export const INPUT_DOWN  = 1 << 1;
export const INPUT_LEFT  = 1 << 2;
export const INPUT_RIGHT = 1 << 3;
export const INPUT_LP    = 1 << 4; // Light Punch
export const INPUT_LK    = 1 << 5; // Light Kick
export const INPUT_HP    = 1 << 6; // Heavy Punch

export const MAX_FRAMES = 60 * 60 * 10; // 10 mins
const localInputLog = new Uint8Array(MAX_FRAMES);
const remoteInputLog = new Uint8Array(MAX_FRAMES);
const remoteInputReceived = new Uint8Array(MAX_FRAMES); 

// Mapping players
export let localPlayerId = 0; // 0 = P1, 1 = P2
export let remotePlayerId = 1;

let currentInput = 0;

export function setPlayerSide(isP1: boolean) {
    localPlayerId = isP1 ? 0 : 1;
    remotePlayerId = isP1 ? 1 : 0;
}

export function initInput() {
    if (typeof window === 'undefined') return;

    window.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'ArrowUp': case 'w': currentInput |= INPUT_UP; break;
            case 'ArrowDown': case 's': currentInput |= INPUT_DOWN; break;
            case 'ArrowLeft': case 'a': currentInput |= INPUT_LEFT; break;
            case 'ArrowRight': case 'd': currentInput |= INPUT_RIGHT; break;
            case 'z': currentInput |= INPUT_LP; break;
            case 'x': currentInput |= INPUT_LK; break;
            case 'c': currentInput |= INPUT_HP; break;
        }
    });

    window.addEventListener('keyup', (e) => {
        switch(e.key) {
            case 'ArrowUp': case 'w': currentInput &= ~INPUT_UP; break;
            case 'ArrowDown': case 's': currentInput &= ~INPUT_DOWN; break;
            case 'ArrowLeft': case 'a': currentInput &= ~INPUT_LEFT; break;
            case 'ArrowRight': case 'd': currentInput &= ~INPUT_RIGHT; break;
            case 'z': currentInput &= ~INPUT_LP; break;
            case 'x': currentInput &= ~INPUT_LK; break;
            case 'c': currentInput &= ~INPUT_HP; break;
        }
    });
}

export function addLocalInput(frame: number): number {
    localInputLog[frame] = currentInput;
    sendInput(frame, currentInput);
    return currentInput;
}

export function addRemoteInput(frame: number, input: number) {
    remoteInputLog[frame] = input;
    remoteInputReceived[frame] = 1;
}

export function getLocalInput(frame: number): number {
    return localInputLog[frame];
}

export function getRemoteInput(frame: number): number | null {
    if (remoteInputReceived[frame] === 1) {
        return remoteInputLog[frame];
    }
    return null;
}

export function getCurrentInput(): number {
    return currentInput;
}
