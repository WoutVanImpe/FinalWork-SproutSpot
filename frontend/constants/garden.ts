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
	const centerX = vw / 2 - cx;
	const centerY = vh / 2 - cy;

	const minX = Math.min(vw - gw * scale, centerX);
	const maxX = Math.max(0, centerX);
	const minY = Math.min(vh - gh * scale, centerY);
	const maxY = Math.max(0, centerY);

	return {
		x: Math.min(maxX, Math.max(minX, desired.x)),
		y: Math.min(maxY, Math.max(minY, desired.y)),
	};
}
