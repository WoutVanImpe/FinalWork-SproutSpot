import React from "react";
import { SvgProps } from "react-native-svg";
import { Styling } from "../../constants/Styling";

type IconSize = keyof typeof Styling.IconSize;

const getSize = (size: IconSize | number): number =>
  typeof size === "number" ? size : Styling.IconSize[size];

const StyledIcon = ({
  Icon,
  size = "reg",
  fill = Styling.Colors.white,
  ...props
}: { Icon: React.FC<SvgProps>; size?: IconSize | number; fill?: string } & Omit<SvgProps, "fill" | "size">) => {
  const iconSize = getSize(size);
  return <Icon width={iconSize} height={iconSize} fill={fill} {...props} />;
};

export default StyledIcon;