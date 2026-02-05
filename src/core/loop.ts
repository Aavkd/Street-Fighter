const LOGIC_RATE = 60;
const STEP_SIZE_MS = 1000 / LOGIC_RATE;

let accumulator = 0;
let lastTime = 0;

export type UpdateCallback = () => void;
export type RenderCallback = (interpolation: number) => void;

let onUpdate: UpdateCallback = () => {};
let onRender: RenderCallback = () => {};

export function setCallbacks(update: UpdateCallback, render: RenderCallback) {
    onUpdate = update;
    onRender = render;
}

export function startLoop() {
    lastTime = performance.now();
    requestAnimationFrame(loop);
}

function loop(currentTime: number) {
    const frameTime = currentTime - lastTime;
    lastTime = currentTime;
    
    accumulator += frameTime;
    
    // Clamp to avoid spiral of death
    if (accumulator > 200) accumulator = 200;

    while (accumulator >= STEP_SIZE_MS) {
        onUpdate();
        accumulator -= STEP_SIZE_MS;
    }

    const interpolation = accumulator / STEP_SIZE_MS;
    onRender(interpolation);
    
    requestAnimationFrame(loop);
}
