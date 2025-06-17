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
import { useAuth } from '@/hooks/useAuth';
import { useResponsive } from '@/hooks/useResponsive';
import Svg, { Path, G } from 'react-native-svg';

// Custom S.A.F.E. Meds Logo Component
function SafeMedsLogo({ size = 48, color = "#2563EB" }: { size?: number; color?: string }) {
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  // Mobile layout
  if (screenSize.isMobile) {
    return (
      <SafeAreaView style={styles.container}>
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
                <SafeMedsLogo size={48} color="#2563EB" />
              </View>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to S.A.F.E. Meds</Text>
            </View>

            <View style={styles.form}>
              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputContainer}>
                  <Mail size={20} color="#64748B" />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    value={formData.email}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputContainer}>
                  <Lock size={20} color="#64748B" />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholderTextColor="#94A3B8"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color="#64748B" />
                    ) : (
                      <Eye size={20} color="#64748B" />
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
    );
  }

  // Desktop/Tablet layout
  return (
    <SafeAreaView style={styles.desktopContainer}>
      <View style={styles.desktopLayout}>
        {/* Left side - Hero section */}
        <View style={styles.heroSection}>
          <View style={styles.heroOverlay}>
            <View style={styles.heroContent}>
              <View style={styles.heroHeader}>
                <View style={styles.heroLogoContainer}>
                  <SafeMedsLogo size={40} color="#FFFFFF" />
                </View>
                <Text style={styles.heroTitle}>S.A.F.E. Meds</Text>
                <Text style={styles.heroSubtitle}>Medication Safety Dashboard</Text>
              </View>

              <View style={styles.heroFeatures}>
                <Text style={styles.heroFeaturesTitle}>Why Choose S.A.F.E. Meds?</Text>
                
                <View style={styles.featureItem}>
                  <CheckCircle size={20} color="#10B981" />
                  <Text style={styles.featureText}>Advanced drug interaction checking</Text>
                </View>
                
                <View style={styles.featureItem}>
                  <Calendar size={20} color="#10B981" />
                  <Text style={styles.featureText}>Smart medication scheduling</Text>
                </View>
                
                <View style={styles.featureItem}>
                  <FileText size={20} color="#10B981" />
                  <Text style={styles.featureText}>Comprehensive health reports</Text>
                </View>
              </View>
            </View>
          </View>
          
          <Image
            source={{ uri: 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=1200' }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>

        {/* Right side - Sign in form */}
        <View style={styles.formSection}>
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
                  <Mail size={20} color="#64748B" />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    value={formData.email}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputContainer}>
                  <Lock size={20} color="#64748B" />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholderTextColor="#94A3B8"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color="#64748B" />
                    ) : (
                      <Eye size={20} color="#64748B" />
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
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Mobile styles
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  form: {
    flex: 1,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#DC2626',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
  },
  eyeButton: {
    padding: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 32,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#2563EB',
  },
  signInButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  signInButtonDisabled: {
    opacity: 0.6,
  },
  signInButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 24,
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  footerLink: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#2563EB',
  },

  // Desktop/Tablet styles
  desktopContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  desktopLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  heroSection: {
    flex: 1,
    position: 'relative',
    minHeight: '100%',
  },
  heroImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(37, 99, 235, 0.85)',
    zIndex: 1,
  },
  heroContent: {
    flex: 1,
    padding: 48,
    justifyContent: 'space-between',
    zIndex: 2,
  },
  heroHeader: {
    alignItems: 'flex-start',
  },
  heroLogoContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 36,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 48,
  },
  heroFeatures: {
    flex: 1,
    justifyContent: 'center',
  },
  heroFeaturesTitle: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  formSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    maxWidth: 500,
  },
  formScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 48,
    paddingVertical: 48,
  },
  formHeader: {
    marginBottom: 40,
  },
  formTitle: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  formContent: {
    flex: 1,
  },
});