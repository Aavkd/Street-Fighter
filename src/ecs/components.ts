import { defineComponent, Types } from 'bitecs';

export const Position = defineComponent({
    x: Types.i32,
    y: Types.i32
});

export const Velocity = defineComponent({
    x: Types.i32,
    y: Types.i32
});
