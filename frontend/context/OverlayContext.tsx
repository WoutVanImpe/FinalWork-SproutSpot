import React, { createContext, ReactNode, useContext, useState } from "react";
import { StyleSheet, View } from "react-native";

interface OverlayContextValue {
	setOverlay: (element: ReactNode) => void;
}

const OverlayContext = createContext<OverlayContextValue>({ setOverlay: () => {} });

export const useOverlay = () => useContext(OverlayContext);

export const OverlayProvider = ({ children }: { children: ReactNode }) => {
	const [overlay, setOverlay] = useState<ReactNode>(null);

	return (
		<OverlayContext.Provider value={{ setOverlay }}>
			{children}
			{overlay && (
				<View style={StyleSheet.absoluteFill} pointerEvents="box-none">
					{overlay}
				</View>
			)}
		</OverlayContext.Provider>
	);
};
