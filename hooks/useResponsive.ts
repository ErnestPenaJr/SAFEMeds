import { useState, useEffect } from 'react';
import { Dimensions, Platform } from 'react-native';

export interface ScreenSize {
  width: number;
  height: number;
  isDesktop: boolean;
  isTablet: boolean;
  isMobile: boolean;
  isLandscape: boolean;
}

export function useResponsive(): ScreenSize {
  const [screenData, setScreenData] = useState(() => {
    const { width, height } = Dimensions.get('window');
    return calculateScreenSize(width, height);
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData(calculateScreenSize(window.width, window.height));
    });

    return () => subscription?.remove();
  }, []);

  return screenData;
}

function calculateScreenSize(width: number, height: number): ScreenSize {
  const isLandscape = width > height;
  const isDesktop = Platform.OS === 'web' && width >= 1024;
  const isTablet = Platform.OS === 'web' ? width >= 768 && width < 1024 : width >= 768;
  const isMobile = !isTablet && !isDesktop;

  return {
    width,
    height,
    isDesktop,
    isTablet,
    isMobile,
    isLandscape,
  };
}

export const breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
} as const;

export function getResponsiveValue<T>(
  values: {
    mobile?: T;
    tablet?: T;
    desktop?: T;
    wide?: T;
  },
  screenSize: ScreenSize
): T | undefined {
  const { width } = screenSize;
  
  if (width >= breakpoints.wide && values.wide !== undefined) {
    return values.wide;
  }
  if (width >= breakpoints.desktop && values.desktop !== undefined) {
    return values.desktop;
  }
  if (width >= breakpoints.tablet && values.tablet !== undefined) {
    return values.tablet;
  }
  return values.mobile;
}