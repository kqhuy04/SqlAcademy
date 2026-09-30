import React from 'react';

interface AppLogoProps {
  className?: string;
  size?: number;
}

export const AppLogo: React.FC<AppLogoProps> = ({ className = 'w-7 h-7', size }) => {
  const style = size ? { width: size, height: size } : undefined;

  return (
    <img
      src="/app-logo.png"
      alt="SQL Detective"
      className={`${className} object-contain select-none`}
      style={style}
      draggable={false}
    />
  );
};
