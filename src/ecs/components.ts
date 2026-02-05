import { defineComponent, Types } from 'bitecs';

export const Position = defineComponent({
    x: Types.i32,
    y: Types.i32
});

export const Velocity = defineComponent({
    x: Types.i32,
    y: Types.i32
});

export const Input = defineComponent({
    flags: Types.ui8
});

export const CharacterState = defineComponent({
    state: Types.ui8,
    timer: Types.ui32,
    facing: Types.i8 // 1 for right, -1 for left
});
