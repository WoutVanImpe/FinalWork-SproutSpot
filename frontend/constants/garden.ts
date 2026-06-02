import { scaled } from "./scale";

export const CELL = scaled(80);
export const MIN_SCALE = 0.5;
export const MAX_SCALE = 2;
export const SCALE_STEP = 0.2;

export function gridDimensions(cols: number, rows: number) {
	return { w: cols * CELL, h: rows * CELL };
}

export function clampOffset(
	desired: { x: number; y: number },
	scale: number,
	vw: number,
	vh: number,
	gw: number,
	gh: number,
): { x: number; y: number } {
	const cx = gw / 2;
	const cy = gh / 2;

	return {
		x: gw * scale <= vw
			? vw / 2 - cx
			: Math.min(cx * (scale - 1), Math.max(vw - cx * (1 + scale), desired.x)),
		y: gh * scale <= vh
			? vh / 2 - cy
			: Math.min(cy * (scale - 1), Math.max(vh - cy * (1 + scale), desired.y)),
	};
}
