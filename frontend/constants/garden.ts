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
	const scaledW = gw * scale;
	const scaledH = gh * scale;

	const minX = scaledW <= vw ? vw / 2 - cx : vw - cx * (1 - scale) - gw * scale;
	const maxX = scaledW <= vw ? vw / 2 - cx : cx * (scale - 1);
	const minY = scaledH <= vh ? vh / 2 - cy : vh - cy * (1 - scale) - gh * scale;
	const maxY = scaledH <= vh ? vh / 2 - cy : cy * (scale - 1);

	return {
		x: Math.min(maxX, Math.max(minX, desired.x)),
		y: Math.min(maxY, Math.max(minY, desired.y)),
	};
}
