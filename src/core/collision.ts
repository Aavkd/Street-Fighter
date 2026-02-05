
// import { toFixed } from '../lib/math';

export function checkAABB(
    x1: number, y1: number, w1: number, h1: number,
    x2: number, y2: number, w2: number, h2: number
): boolean {
    // Standard AABB check
    // Note: Coordinates are typically top-left
    return (
        x1 < x2 + w2 &&
        x1 + w1 > x2 &&
        y1 < y2 + h2 &&
        y1 + h1 > y2
    );
}

export function getOverlapX(
    x1: number, w1: number,
    x2: number, w2: number
): number {
    // Returns how much x1 should move to resolve overlap with x2
    // Positive = move right, Negative = move left
    // We assume we want to push away from the center of x2
    
    const c1 = x1 + (w1 >> 1);
    const c2 = x2 + (w2 >> 1);
    
    const diff = c1 - c2;
    const minDist = (w1 + w2) >> 1;
    
    if (Math.abs(diff) < minDist) {
        const penetration = minDist - Math.abs(diff);
        if (diff > 0) return penetration;
        return -penetration;
    }
    return 0;
}
