import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { DesignSystem } from '@/constants/DesignSystem';

interface BentoGridProps {
  children: React.ReactNode;
}

interface BentoItemProps {
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large' | 'tall' | 'wide';
}

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;
const isTabletLarge = screenWidth >= 1024;

export function BentoGrid({ children }: BentoGridProps) {
  const getColumns = () => {
    if (isTabletLarge) return 4;
    if (isTablet) return 3;
    return 2;
  };

  return (
    <View style={[styles.grid, { 
      gridTemplateColumns: `repeat(${getColumns()}, 1fr)` as any 
    }]}>
      {children}
    </View>
  );
}

export function BentoItem({ children, size = 'small' }: BentoItemProps) {
  const getSizeStyle = () => {
    const columns = isTabletLarge ? 4 : isTablet ? 3 : 2;
    
    switch (size) {
      case 'medium':
        return { gridColumn: 'span 2', gridRow: 'span 1', minHeight: 140 };
      case 'large':
        return { gridColumn: 'span 2', gridRow: 'span 2', minHeight: 280 };
      case 'tall':
        return { gridColumn: 'span 1', gridRow: 'span 2', minHeight: 280 };
      case 'wide':
        return { gridColumn: `span ${columns}`, gridRow: 'span 1', minHeight: 120 };
      default:
        return { gridColumn: 'span 1', gridRow: 'span 1', minHeight: 120 };
    }
  };

  return (
    <View style={[styles.item, getSizeStyle() as any]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    display: 'grid' as any,
    gap: DesignSystem.spacing.md,
    padding: DesignSystem.spacing.lg,
    gridAutoFlow: 'dense' as any,
  },
  item: {
    borderRadius: DesignSystem.borderRadius.lg,
  },
});