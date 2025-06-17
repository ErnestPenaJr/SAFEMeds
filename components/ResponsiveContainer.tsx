import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useResponsive } from '@/hooks/useResponsive';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  maxWidth?: number;
  padding?: number;
  style?: any;
}

export function ResponsiveContainer({ 
  children, 
  maxWidth = 1200, 
  padding = 24,
  style 
}: ResponsiveContainerProps) {
  const { isDesktop, width } = useResponsive();

  const containerStyle = [
    styles.container,
    {
      maxWidth: isDesktop ? maxWidth : '100%',
      paddingHorizontal: isDesktop ? Math.max(padding, (width - maxWidth) / 2) : padding,
      alignSelf: 'center',
      width: '100%',
    },
    style,
  ];

  return <View style={containerStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});