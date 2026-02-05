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

export const PlayerID = defineComponent({
    id: Types.ui8 // 0 or 1
});

export const CharacterState = defineComponent({
    state: Types.ui8,
    timer: Types.ui32,
    facing: Types.i8 // 1 for right, -1 for left
});

export const PushBox = defineComponent({
    width: Types.i32,
    height: Types.i32,
    offsetX: Types.i32,
    offsetY: Types.i32
});

export const HurtBox = defineComponent({
    width: Types.i32,
    height: Types.i32,
    offsetX: Types.i32,
    offsetY: Types.i32
});

export const HitBox = defineComponent({
    width: Types.i32,
    height: Types.i32,
    offsetX: Types.i32,
    offsetY: Types.i32,
    damage: Types.i32,
    hitstun: Types.i32,
    active: Types.ui8 // 0 or 1
});

export const Health = defineComponent({
    current: Types.i32,
    max: Types.i32
});

export const CombatState = defineComponent({
    hitStunTimer: Types.ui32,
    hitStopTimer: Types.ui32,
    isHit: Types.ui8
});
