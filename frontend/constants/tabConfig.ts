import React from "react";
import HomeIcon from "../assets/icons/home.svg";
import GardenIcon from "../assets/icons/garden.svg";
import ExploreIcon from "../assets/icons/explore.svg";
import { scaled } from "./scale";

export const BAR_HEIGHT = scaled(65);
export const BAR_MARGIN = scaled(20);
export const TAB_WIDTH = scaled(64);
export const TAB_GAP = scaled(32);
export const CORNER_RADIUS = scaled(24);
export const SCOOP_RADIUS = scaled(40);
export const SCOOP_DEPTH = scaled(48);

export const routeIcons: Record<string, React.FC<any>> = {
	index: HomeIcon,
	"(garden)/garden": GardenIcon,
	"(explore)/explore": ExploreIcon,
};

export const routeOrder = ["index", "(garden)/garden", "(explore)/explore"];
