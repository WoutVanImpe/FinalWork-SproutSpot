import { createContext, useContext } from "react";

interface ScrollContextValue {
  scrollTo: (y: number, animated?: boolean) => void;
}

export const ScrollContext = createContext<ScrollContextValue>({
  scrollTo: () => {},
});

export const useScroll = () => useContext(ScrollContext);
