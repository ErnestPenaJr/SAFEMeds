import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { DesignSystem } from '@/constants/DesignSystem';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
}

export function GlassCard({ 
  children, 
  style, 
  intensity = 20,
  tint = 'light' 
}: GlassCardProps) {
  return (
    <View style={[styles.container, style]}>
      <BlurView intensity={intensity} tint={tint} style={styles.blur}>
        <View style={styles.content}>
          {children}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: DesignSystem.borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: DesignSystem.glassmorphism.background,
    borderWidth: 1,
    borderColor: DesignSystem.glassmorphism.borderColor,
    ...DesignSystem.shadows.card,
  },
  blur: {
    flex: 1,
  },
  content: {
    padding: DesignSystem.spacing.lg,
  },
});