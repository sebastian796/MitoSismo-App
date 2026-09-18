import React from 'react';
import Svg, { Ellipse, Path, Circle } from 'react-native-svg';

interface IgnisProps {
  size?: number;
}

export function Ignis({ size = 60 }: IgnisProps) {
  // Base SVG viewBox is 52 x 60
  const width = size * (52 / 60);
  const height = size;

  return (
    <Svg width={width} height={height} viewBox="0 0 52 60">
      {/* Body */}
      <Ellipse cx="26" cy="40" rx="16" ry="17" fill="#E8521A" />
      
      {/* Flame head */}
      <Path
        d="M26,28 C20,20 16,10 22,2 C24,12 30,6 28,0 C36,8 38,18 32,26 C36,20 41,22 38,30 C34,22 30,26 26,28Z"
        fill="#E8942A"
      />
      
      {/* Eyes */}
      <Circle cx="20" cy="38" r="3.5" fill="white" />
      <Circle cx="32" cy="38" r="3.5" fill="white" />
      <Circle cx="21" cy="38.8" r="1.8" fill="#1C0C04" />
      <Circle cx="33" cy="38.8" r="1.8" fill="#1C0C04" />
      
      {/* Smile */}
      <Path
        d="M20,46 Q26,51 32,46"
        stroke="white"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Arms */}
      <Ellipse cx="9" cy="39" rx="5" ry="4" fill="#D44010" transform="rotate(-20 9 39)" />
      <Ellipse cx="43" cy="39" rx="5" ry="4" fill="#D44010" transform="rotate(20 43 39)" />
      
      {/* Legs */}
      <Ellipse cx="19" cy="54" rx="6" ry="4.5" fill="#C03808" />
      <Ellipse cx="33" cy="54" rx="6" ry="4.5" fill="#C03808" />
    </Svg>
  );
}
