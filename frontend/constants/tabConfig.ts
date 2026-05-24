import React from "react";
import HomeIcon from "../assets/icons/home.svg";
import GardenIcon from "../assets/icons/garden.svg";
import ExploreIcon from "../assets/icons/explore.svg";

export const BAR_HEIGHT = 65;
export const BAR_MARGIN = 20;
export const TAB_WIDTH = 64;
export const TAB_GAP = 32;
export const CORNER_RADIUS = 24;
export const SCOOP_RADIUS = 40;
export const SCOOP_DEPTH = 48;

export const routeIcons: Record<string, React.FC<any>> = {
	index: HomeIcon,
	"(garden)/garden": GardenIcon,
	"(explore)/explore": ExploreIcon,
};

export const routeOrder = ["index", "(garden)/garden", "(explore)/explore"];
