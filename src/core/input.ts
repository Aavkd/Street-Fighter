export const INPUT_UP    = 1 << 0;
export const INPUT_DOWN  = 1 << 1;
export const INPUT_LEFT  = 1 << 2;
export const INPUT_RIGHT = 1 << 3;
export const INPUT_LP    = 1 << 4; // Light Punch
export const INPUT_LK    = 1 << 5; // Light Kick
export const INPUT_HP    = 1 << 6; // Heavy Punch

const BUFFER_SIZE = 60;
const inputBuffer = new Uint8Array(BUFFER_SIZE);
let head = 0;
let currentInput = 0;

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

export function pushInput() {
    inputBuffer[head] = currentInput;
    head = (head + 1) % BUFFER_SIZE;
}

export function getCurrentInput(): number {
    return currentInput;
}

export function getInput(framesBack: number): number {
    let index = head - 1 - framesBack;
    if (index < 0) index += BUFFER_SIZE;
    return inputBuffer[index];
}
