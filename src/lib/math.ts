export const FIXED_SCALE = 1000;

export function toFixed(n: number): number {
    return Math.round(n * FIXED_SCALE);
}

export function fromFixed(n: number): number {
    return n / FIXED_SCALE;
}

export function add(a: number, b: number): number {
    return a + b;
}

export function sub(a: number, b: number): number {
    return a - b;
}

export function mul(a: number, b: number): number {
    return Math.floor((a * b) / FIXED_SCALE);
}

export function div(a: number, b: number): number {
    return Math.floor((a * FIXED_SCALE) / b);
}
