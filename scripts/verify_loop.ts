import { startLoop, setCallbacks } from './src/core/loop';
import { add, toFixed, fromFixed } from './src/lib/math';

// Polyfill for Node.js
let currentTime = 0;
global.performance = {
    now: () => currentTime
} as any;

global.requestAnimationFrame = (cb) => {
    // Simulate 16ms frame (approx 60fps)
    // We use setImmediate or just call it to simulate fast forward?
    // setTimeout is safer to avoid stack overflow if not careful, but slow.
    // Let's use a small timeout
    setTimeout(() => {
        currentTime += 16.666;
        cb(currentTime);
    }, 10);
    return 0;
};

// Setup logic
let logicTicks = 0;
let x = toFixed(0);
const speed = toFixed(10); // 10 units per tick

setCallbacks(
    () => {
        x = add(x, speed);
        logicTicks++;
        if (logicTicks % 60 === 0) {
            console.log(`Logic Tick ${logicTicks}: x = ${fromFixed(x)} (Expected: ${logicTicks * 10})`);
        }
        if (logicTicks >= 120) {
            console.log("Verification Complete. Exiting.");
            process.exit(0);
        }
    },
    (alpha) => {
        // Render tick
    }
);

console.log("Starting verification loop...");
startLoop();
