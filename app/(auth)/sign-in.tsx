import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, CircleCheck as CheckCircle, Calendar, FileText } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAuth } from '@/hooks/useAuth';
import { useResponsive } from '@/hooks/useResponsive';
import { DesignSystem } from '@/constants/DesignSystem';
import Svg, { Path, G } from 'react-native-svg';

// Custom S.A.F.E. Meds Logo Component
function SafeMedsLogo({ size = 48, color = "#4A90E2" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 871 870" style={{ fillRule: 'evenodd' }}>
      <G transform="matrix(2.08012,0,0,2.08012,-682.116,-291.637)">
        <Path
          d="M639.257,197.626C696.981,197.626 743.845,244.49 743.845,302.215C743.845,359.939 696.981,406.803 639.257,406.803C581.532,406.803 534.668,359.939 534.668,302.215C534.668,244.49 581.532,197.626 639.257,197.626ZM639.257,224.401C596.31,224.401 561.443,259.268 561.443,302.215C561.443,345.161 596.31,380.028 639.257,380.028C682.203,380.028 717.07,345.161 717.07,302.215C717.07,259.268 682.203,224.401 639.257,224.401ZM629.07,307.309C628.907,306.583 628.82,305.828 628.82,305.054C628.82,304.772 628.832,304.494 628.854,304.218L628.854,253.548C628.854,247.901 633.439,243.316 639.085,243.316C644.732,243.316 649.317,247.901 649.317,253.548L649.317,294.822L677.64,294.822C683.287,294.822 687.872,299.407 687.872,305.054C687.872,310.7 683.287,315.285 677.64,315.285L640.868,315.285C640.289,315.387 639.694,315.44 639.085,315.44C634.158,315.44 630.04,311.95 629.07,307.309ZM518.374,296.231L397.322,412.718L361.429,375.418C319.33,331.669 320.425,262.206 363.873,220.397C407.32,178.587 476.774,180.162 518.873,223.911L535.278,240.958C525.5,257.283 519.468,276.104 518.374,296.231ZM642.66,423.562C638.174,443.745 627.928,462.843 611.962,478.207C568.514,520.017 499.06,518.442 456.961,474.693L414.366,430.429L520.815,327.994C532.387,382.596 580.909,423.618 638.937,423.618C640.182,423.618 641.424,423.599 642.66,423.562Z"
          fill={color}
        />
      </G>
    </Svg>
  );
}

export default function SignInScreen() {
  const { signIn, loading } = useAuth();
  const screenSize = useResponsive();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = async () => {
    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setIsSubmitting(true);

    const result = await signIn(formData.email.trim(), formData.password);
    
    if (result.error) {
      setError(result.error);
    } else {
      router.replace('/(tabs)');
    }
    
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color="#FFFFFF" />
      </LinearGradient>
    );
  }

  // Mobile layout
  if (screenSize.isMobile) {
    return (
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.header}>
                <View style={styles.logoContainer}>
                  <SafeMedsLogo size={48} color="#FFFFFF" />
                </View>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Sign in to S.A.F.E. Meds</Text>
              </View>

              <View style={styles.formContainer}>
                <BlurView intensity={20} tint="light" style={styles.formBlur}>
                  <View style={styles.form}>
                    {error ? (
                      <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                      </View>
                    ) : null}

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Email Address</Text>
                      <View style={styles.inputContainer}>
                        <Mail size={20} color={DesignSystem.colors.text.secondary} />
                        <TextInput
                          style={styles.input}
                          placeholder="Enter your email"
                          value={formData.email}
                          onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoCorrect={false}
                          placeholderTextColor={DesignSystem.colors.text.muted}
                        />
                      </View>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Password</Text>
                      <View style={styles.inputContainer}>
                        <Lock size={20} color={DesignSystem.colors.text.secondary} />
                        <TextInput
                          style={styles.input}
                          placeholder="Enter your password"
                          value={formData.password}
                          onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
                          secureTextEntry={!showPassword}
                          autoCapitalize="none"
                          autoCorrect={false}
                          placeholderTextColor={DesignSystem.colors.text.muted}
                        />
                        <TouchableOpacity
                          onPress={() => setShowPassword(!showPassword)}
                          style={styles.eyeButton}
                        >
                          {showPassword ? (
                            <EyeOff size={20} color={DesignSystem.colors.text.secondary} />
                          ) : (
                            <Eye size={20} color={DesignSystem.colors.text.secondary} />
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.forgotPassword}
                      onPress={() => router.push('/(auth)/forgot-password')}
                    >
                      <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.signInButton, isSubmitting && styles.signInButtonDisabled]}
                      onPress={handleSignIn}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.signInButtonText}>Sign In</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </BlurView>
              </View>

              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  Don't have an account?{' '}
                  <Link href="/(auth)/sign-up" style={styles.footerLink}>
                    Sign Up
                  </Link>
                </Text>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Desktop/Tablet layout
  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.desktopContainer}
    >
      <SafeAreaView style={styles.desktopSafeArea}>
        <View style={styles.desktopLayout}>
          {/* Left side - Hero section */}
          <View style={styles.heroSection}>
            <View style={styles.heroContent}>
              <View style={styles.heroHeader}>
                <View style={styles.heroLogoContainer}>
                  <SafeMedsLogo size={64} color="#FFFFFF" />
                </View>
                <Text style={styles.heroTitle}>S.A.F.E. Meds</Text>
                <Text style={styles.heroSubtitle}>Medication Safety Dashboard</Text>
              </View>

              <View style={styles.heroFeatures}>
                <Text style={styles.heroFeaturesTitle}>Why Choose S.A.F.E. Meds?</Text>
                
                <View style={styles.featureItem}>
                  <CheckCircle size={24} color="#10B981" />
                  <Text style={styles.featureText}>Advanced drug interaction checking</Text>
                </View>
                
                <View style={styles.featureItem}>
                  <Calendar size={24} color="#10B981" />
                  <Text style={styles.featureText}>Smart medication scheduling</Text>
                </View>
                
                <View style={styles.featureItem}>
                  <FileText size={24} color="#10B981" />
                  <Text style={styles.featureText}>Comprehensive health reports</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Right side - Sign in form */}
          <View style={styles.formSection}>
            <BlurView intensity={20} tint="light" style={styles.formBlurDesktop}>
              <ScrollView
                contentContainerStyle={styles.formScrollContent}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.formHeader}>
                  <Text style={styles.formTitle}>Welcome Back</Text>
                  <Text style={styles.formSubtitle}>Please enter your details to sign in</Text>
                </View>

                {error ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                <View style={styles.formContent}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email Address</Text>
                    <View style={styles.inputContainer}>
                      <Mail size={20} color={DesignSystem.colors.text.secondary} />
                      <TextInput
                        style={styles.input}
                        placeholder="Enter your email"
                        value={formData.email}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        placeholderTextColor={DesignSystem.colors.text.muted}
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Password</Text>
                    <View style={styles.inputContainer}>
                      <Lock size={20} color={DesignSystem.colors.text.secondary} />
                      <TextInput
                        style={styles.input}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        placeholderTextColor={DesignSystem.colors.text.muted}
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeButton}
                      >
                        {showPassword ? (
                          <EyeOff size={20} color={DesignSystem.colors.text.secondary} />
                        ) : (
                          <Eye size={20} color={DesignSystem.colors.text.secondary} />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.forgotPassword}
                    onPress={() => router.push('/(auth)/forgot-password')}
                  >
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.signInButton, isSubmitting && styles.signInButtonDisabled]}
                    onPress={handleSignIn}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.signInButtonText}>Sign In</Text>
                    )}
                  </TouchableOpacity>

                  <View style={styles.footer}>
                    <Text style={styles.footerText}>
                      Don't have an account?{' '}
                      <Link href="/(auth)/sign-up" style={styles.footerLink}>
                        Sign Up
                      </Link>
                    </Text>
                  </View>
                </View>
              </ScrollView>
            </BlurView>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  // Common styles
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.xxxl,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: DesignSystem.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  title: {
    fontSize: DesignSystem.typography.sizes.hero,
    fontFamily: DesignSystem.typography.fontFamilies.display,
    color: DesignSystem.colors.text.onDark,
    marginBottom: DesignSystem.spacing.sm,
  },
  subtitle: {
    fontSize: DesignSystem.typography.sizes.body,
    fontFamily: DesignSystem.typography.fontFamilies.primary,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  formContainer: {
    borderRadius: DesignSystem.borderRadius.xl,
    overflow: 'hidden',
    marginBottom: DesignSystem.spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    ...DesignSystem.shadows.card,
  },
  formBlur: {
    padding: DesignSystem.spacing.lg,
  },
  form: {
    flex: 1,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: DesignSystem.borderRadius.md,
    padding: DesignSystem.spacing.md,
    marginBottom: DesignSystem.spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  errorText: {
    fontSize: DesignSystem.typography.sizes.caption,
    fontFamily: DesignSystem.typography.fontFamilies.primaryMedium,
    color: '#DC2626',
  },
  inputGroup: {
    marginBottom: DesignSystem.spacing.lg,
  },
  label: {
    fontSize: DesignSystem.typography.sizes.caption,
    fontFamily: DesignSystem.typography.fontFamilies.primarySemiBold,
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: DesignSystem.borderRadius.md,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  input: {
    flex: 1,
    marginLeft: DesignSystem.spacing.md,
    fontSize: DesignSystem.typography.sizes.body,
    fontFamily: DesignSystem.typography.fontFamilies.primary,
    color: DesignSystem.colors.text.primary,
  },
  eyeButton: {
    padding: DesignSystem.spacing.xs,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: DesignSystem.spacing.xl,
  },
  forgotPasswordText: {
    fontSize: DesignSystem.typography.sizes.caption,
    fontFamily: DesignSystem.typography.fontFamilies.primaryMedium,
    color: DesignSystem.colors.primary.blue,
  },
  signInButton: {
    backgroundColor: DesignSystem.colors.primary.blue,
    borderRadius: DesignSystem.borderRadius.md,
    paddingVertical: DesignSystem.spacing.md,
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.lg,
    ...DesignSystem.shadows.button,
  },
  signInButtonDisabled: {
    opacity: 0.6,
  },
  signInButtonText: {
    fontSize: DesignSystem.typography.sizes.body,
    fontFamily: DesignSystem.typography.fontFamilies.primarySemiBold,
    color: DesignSystem.colors.text.onDark,
  },
  footer: {
    alignItems: 'center',
    paddingTop: DesignSystem.spacing.lg,
  },
  footerText: {
    fontSize: DesignSystem.typography.sizes.caption,
    fontFamily: DesignSystem.typography.fontFamilies.primary,
    color: DesignSystem.colors.text.onDark,
  },
  footerLink: {
    fontSize: DesignSystem.typography.sizes.caption,
    fontFamily: DesignSystem.typography.fontFamilies.primarySemiBold,
    color: '#FFFFFF',
  },

  // Desktop/Tablet styles
  desktopContainer: {
    flex: 1,
  },
  desktopSafeArea: {
    flex: 1,
  },
  desktopLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  heroSection: {
    flex: 1,
    position: 'relative',
    minHeight: '100%',
    justifyContent: 'center',
  },
  heroContent: {
    flex: 1,
    padding: DesignSystem.spacing.xxxl,
    justifyContent: 'space-between',
    zIndex: 2,
  },
  heroHeader: {
    alignItems: 'center',
  },
  heroLogoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: DesignSystem.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  heroTitle: {
    fontSize: 42,
    fontFamily: DesignSystem.typography.fontFamilies.display,
    color: DesignSystem.colors.text.onDark,
    marginBottom: DesignSystem.spacing.sm,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: DesignSystem.typography.sizes.subtitle,
    fontFamily: DesignSystem.typography.fontFamilies.primary,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: DesignSystem.spacing.xxxl,
    textAlign: 'center',
  },
  heroFeatures: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroFeaturesTitle: {
    fontSize: DesignSystem.typography.sizes.title,
    fontFamily: DesignSystem.typography.fontFamilies.primarySemiBold,
    color: DesignSystem.colors.text.onDark,
    marginBottom: DesignSystem.spacing.xl,
    textAlign: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: DesignSystem.spacing.md,
    borderRadius: DesignSystem.borderRadius.md,
    width: '80%',
  },
  featureText: {
    fontSize: DesignSystem.typography.sizes.body,
    fontFamily: DesignSystem.typography.fontFamilies.primary,
    color: DesignSystem.colors.text.onDark,
    marginLeft: DesignSystem.spacing.md,
  },
  formSection: {
    flex: 1,
    maxWidth: 500,
    padding: DesignSystem.spacing.xl,
    justifyContent: 'center',
  },
  formBlurDesktop: {
    flex: 1,
    borderRadius: DesignSystem.borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    ...DesignSystem.shadows.card,
  },
  formScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: DesignSystem.spacing.xl,
  },
  formHeader: {
    marginBottom: DesignSystem.spacing.xl,
  },
  formTitle: {
    fontSize: DesignSystem.typography.sizes.hero,
    fontFamily: DesignSystem.typography.fontFamilies.display,
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.sm,
  },
  formSubtitle: {
    fontSize: DesignSystem.typography.sizes.body,
    fontFamily: DesignSystem.typography.fontFamilies.primary,
    color: DesignSystem.colors.text.secondary,
  },
  formContent: {
    flex: 1,
  },
});