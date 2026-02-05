import { 
    remoteInputQueue
} from './network';
import { 
    addRemoteInput, getRemoteInput, addLocalInput, 
    getLocalInput, localPlayerId
} from './input';
import { saveState, loadState } from './state';
import type { Snapshot } from './state';

let updateFn: () => void = () => {};
let renderFn: (interp: number) => void = () => {};

export function setCallbacks(u: () => void, r: (i: number) => void) {
    updateFn = u;
    renderFn = r;
}

let currentFrame = 0;
const MAX_ROLLBACK = 60; // Max rollback frames
const stateHistory: (Snapshot | null)[] = new Array(MAX_ROLLBACK).fill(null);

export function getCurrentFrame() { return currentFrame; }

export let currentP1Input = 0;
export let currentP2Input = 0;

export function startLoop() {
    let lastTime = performance.now();
    const tickRate = 1000 / 60;
    let accumulator = 0;

    const loop = (time: number) => {
        const delta = time - lastTime;
        lastTime = time;
        
        accumulator += delta;

        // Process Incoming Network Packets
        let earliestNewInput = -1;
        while (remoteInputQueue.length > 0) {
            const data = remoteInputQueue.shift();
            if (data) {
                addRemoteInput(data.frame, data.input);
                if (earliestNewInput === -1 || data.frame < earliestNewInput) {
                    earliestNewInput = data.frame;
                }
            }
        }

        // Rollback if needed
        if (earliestNewInput !== -1 && earliestNewInput < currentFrame) {
             const restoreFrame = earliestNewInput;
             const snapshot = stateHistory[restoreFrame % MAX_ROLLBACK];
             
             if (snapshot) {
                 loadState(snapshot);
                 
                 const targetFrame = currentFrame;
                 currentFrame = restoreFrame;
                 
                 while (currentFrame < targetFrame) {
                     simulateFrame(true);
                 }
             } else {
                 console.warn("Could not rollback, state missing!");
             }
        }

        // Normal Updates
        while (accumulator >= tickRate) {
            simulateFrame(false);
            accumulator -= tickRate;
        }

        renderFn(accumulator / tickRate);
        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
}

function simulateFrame(isResimulating: boolean) {
    // 1. Save State
    stateHistory[currentFrame % MAX_ROLLBACK] = saveState();

    // 2. Prepare Inputs
    let localIn = 0;
    if (!isResimulating) {
        localIn = addLocalInput(currentFrame);
    } else {
        localIn = getLocalInput(currentFrame);
    }
    
    let remoteIn = getRemoteInput(currentFrame);
    if (remoteIn === null) {
        // Prediction: Use last known input or 0
        if (currentFrame > 0) {
            // Simple prediction: Repeat last frame
            // We'd need to peek history or just assume 0 or repeat?
            // Since we don't store remoteInputLog history for 'predicted' values in a simple way 
            // without access to input module internals, let's use a simple heuristic.
            // Actually, getRemoteInput returns what is LOGGED. 
            // If it returns null, we haven't received it.
            // We should use the last frame's remote input (if available).
            
            // To do this cleanly, we'd cache 'lastRemoteInput'.
            remoteIn = lastKnownRemoteInput;
        } else {
            remoteIn = 0;
        }
    } else {
        lastKnownRemoteInput = remoteIn;
    }
    
    // Assign P1/P2 based on localPlayerId
    if (localPlayerId === 0) {
        currentP1Input = localIn;
        currentP2Input = remoteIn;
    } else {
        currentP1Input = remoteIn;
        currentP2Input = localIn;
    }

    // 3. Run Update
    updateFn();
    
    currentFrame++;
}

let lastKnownRemoteInput = 0;
