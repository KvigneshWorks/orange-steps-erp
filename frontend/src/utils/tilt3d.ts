import type { MouseEvent } from 'react';

/** Pointer-tracked 3D tilt — attach as onMouseMove on any element with `position:relative`. */
export function tiltMove(e: MouseEvent<HTMLElement>, maxDeg = 10, liftPx = 8) {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rx = (0.5 - py) * maxDeg;
    const ry = (px - 0.5) * maxDeg;
    el.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(${liftPx}px)`;
}

export function tiltLeave(e: MouseEvent<HTMLElement>) {
    e.currentTarget.style.transform = '';
}
