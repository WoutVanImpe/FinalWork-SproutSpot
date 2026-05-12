interface Styling {
	Colors: {
		green: string;
		red: string;
		white: string;
		lightGrey: string;
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
		lrg: string;
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
		gradGrey: "linear-gradient(25deg,rgba(109, 118, 126, 1) 0%, rgba(69, 78, 86, 1) 100%)",
	},

	Fonts: {
		Family: {
			reg: "SpaceGrotesk-Regular",
			bold: "SpaceGrotesk-Bold",
		},

		Size: {
			sml: 10,
			reg: 14,
			med: 16,
			lrg: 20,
			xlg: 24,
			xxl: 32,
		},

		Weight: {
			reg: "500",
			bold: "700",
		},
	},

	Spacing: {
		xsm: 4,
		sml: 8,
		reg: 12,
		med: 16,
		lrg: 24,
		xlg: 32,
		xxl: 40,
	},

	Padding: {
		xsm: 4,
		sml: 8,
		reg: 12,
		med: 16,
		lrg: 24,
		xlg: 32,
		xxl: 40,
	},

	BorderRadius: {
		sml: 4,
		reg: 8,
		med: 32,
		lrg: "50%",
	},

	IconSize: {
		sml: 16,
		reg: 24,
		med: 32,
		lrg: 48,
		xlg: 64,
	},

	Shadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
};
