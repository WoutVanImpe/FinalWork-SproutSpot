import { scaled } from "./scale";

interface Styling {
	Colors: {
		green: string;
		red: string;
		white: string;
		lightGrey: string;
		darkGrey: string;
		black: string;
		gradGrey: string;
	};
	Fonts: {
		Family: {
			reg: string;
			bold: string;
		};
		Size: {
			sml: number;
			reg: number;
			med: number;
			lrg: number;
			xlg: number;
			xxl: number;
		};
		Weight: {
			reg: "500";
			bold: "700";
		};
	};
	Spacing: {
		xsm: number;
		sml: number;
		reg: number;
		med: number;
		lrg: number;
		xlg: number;
		xxl: number;
	};
	Padding: {
		xsm: number;
		sml: number;
		reg: number;
		med: number;
		lrg: number;
		xlg: number;
		xxl: number;
	};
	BorderRadius: {
		sml: number;
		reg: number;
		med: number;
		lrg: number;
	};
	IconSize: {
		sml: number;
		reg: number;
		med: number;
		lrg: number;
		xlg: number;
	};
	Shadow: string;
}

export const Styling: Styling = {
	Colors: {
		green: "#00CA68",
		red: "#C44028",
		white: "#fff",
		lightGrey: "#a1a1a1",
		darkGrey: "#555",
		black: "#222222",
		gradGrey: "linear-gradient(25deg,rgba(109, 118, 126, 1) 0%, rgba(69, 78, 86, 1) 100%)",
	},

	Fonts: {
		Family: {
			reg: "SpaceGrotesk-Regular",
			bold: "SpaceGrotesk-Bold",
		},

		Size: {
			sml: scaled(10),
			reg: scaled(14),
			med: scaled(16),
			lrg: scaled(20),
			xlg: scaled(24),
			xxl: scaled(32),
		},

		Weight: {
			reg: "500",
			bold: "700",
		},
	},

	Spacing: {
		xsm: scaled(4),
		sml: scaled(8),
		reg: scaled(12),
		med: scaled(16),
		lrg: scaled(24),
		xlg: scaled(32),
		xxl: scaled(40),
	},

	Padding: {
		xsm: scaled(4),
		sml: scaled(8),
		reg: scaled(12),
		med: scaled(16),
		lrg: scaled(24),
		xlg: scaled(32),
		xxl: scaled(40),
	},

	BorderRadius: {
		sml: scaled(4),
		reg: scaled(8),
		med: scaled(32),
		lrg: 999,
	},

	IconSize: {
		sml: scaled(16),
		reg: scaled(24),
		med: scaled(32),
		lrg: scaled(48),
		xlg: scaled(64),
	},

	Shadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
};
