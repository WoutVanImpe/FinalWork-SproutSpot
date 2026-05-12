import { StyleSheet } from "react-native";
import React from "react";
import { SvgProps } from "react-native-svg";
import { Styling } from "../../constants/Styling";

type IconSize = keyof typeof Styling.IconSize;

const StyledIcon = ({
  Icon,
  size = "reg",
  fill = Styling.Colors.white,
  ...props
}: { Icon: React.FC<SvgProps>; size?: IconSize; fill?: string } & Omit<SvgProps, "fill" | "size">) => {
  return <Icon width={Styling.IconSize[size]} height={Styling.IconSize[size]} fill={fill} {...props} />;
};

export default StyledIcon;