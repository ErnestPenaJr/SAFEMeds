import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { X, Mail, Send, CircleCheck as CheckCircle, CircleAlert as AlertCircle } from 'lucide-react-native';

interface EmailTestModalProps {
  visible: boolean;
  onClose: () => void;
}

export function EmailTestModal({ visible, onClose }: EmailTestModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; code?: string } | null>(null);

  const handleTestEmail = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      let data;

      if (response.ok) {
        // Response is successful, try to parse as JSON
        try {
          data = await response.json();
        } catch (jsonError) {
          // If JSON parsing fails even on success, treat as error
          const textResponse = await response.text();
          setResult({
            success: false,
            message: 'Server returned invalid JSON response',
          });
          return;
        }

        setResult({
          success: true,
          message: data.message,
          code: data.code,
        });
      } else {
        // Response is not successful, try JSON first, then fallback to text
        try {
          data = await response.json();
          setResult({
            success: false,
            message: data.error || 'Failed to send test email',
          });
        } catch (jsonError) {
          // If JSON parsing fails, get the text response (likely HTML error page)
          const textResponse = await response.text();
          setResult({
            success: false,
            message: `Server error (${response.status}): Unable to process request`,
          });
        }
      }
    } catch (error) {
      console.error('Error testing email:', error);
      setResult({
        success: false,
        message: 'Network error. Please check your connection.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setResult(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Mail size={24} color="#2563EB" />
            <Text style={styles.title}>Test Email Sending</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={24} color="#64748B" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.description}>
            Send a test verification email to check if your email configuration is working properly.
          </Text>

          <View style={styles.inputSection}>
            <Text style={styles.label}>Test Email Address</Text>
            <View style={styles.inputContainer}>
              <Mail size={20} color="#64748B" />
              <TextInput
                style={styles.input}
                placeholder="Enter email to test"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          {result && (
            <View style={[
              styles.resultContainer,
              result.success ? styles.successContainer : styles.errorContainer
            ]}>
              <View style={styles.resultHeader}>
                {result.success ? (
                  <CheckCircle size={20} color="#10B981" />
                ) : (
                  <AlertCircle size={20} color="#EF4444" />
                )}
                <Text style={[
                  styles.resultTitle,
                  result.success ? styles.successTitle : styles.errorTitle
                ]}>
                  {result.success ? 'Success!' : 'Error'}
                </Text>
              </View>
              
              <Text style={[
                styles.resultMessage,
                result.success ? styles.successMessage : styles.errorMessage
              ]}>
                {result.message}
              </Text>

              {result.success && result.code && (
                <View style={styles.codeContainer}>
                  <Text style={styles.codeLabel}>Development Code:</Text>
                  <Text style={styles.codeValue}>{result.code}</Text>
                </View>
              )}
            </View>
          )}

          <TouchableOpacity
            style={[styles.testButton, loading && styles.testButtonDisabled]}
            onPress={handleTestEmail}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Send size={20} color="#FFFFFF" />
                <Text style={styles.testButtonText}>Send Test Email</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>What this test does:</Text>
            <Text style={styles.infoItem}>• Generates a verification code</Text>
            <Text style={styles.infoItem}>• Calls the email sending edge function</Text>
            <Text style={styles.infoItem}>• Verifies email service configuration</Text>
            <Text style={styles.infoItem}>• Shows development codes in console</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginLeft: 8,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    lineHeight: 24,
    marginBottom: 24,
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
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
  resultContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
  },
  successContainer: {
    backgroundColor: '#F0FDF4',
    borderLeftColor: '#10B981',
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderLeftColor: '#EF4444',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  successTitle: {
    color: '#059669',
  },
  errorTitle: {
    color: '#DC2626',
  },
  resultMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  successMessage: {
    color: '#047857',
  },
  errorMessage: {
    color: '#991B1B',
  },
  codeContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  codeLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginBottom: 4,
  },
  codeValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    letterSpacing: 2,
  },
  testButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  testButtonDisabled: {
    opacity: 0.6,
  },
  testButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  infoSection: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  infoTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1E40AF',
    marginBottom: 8,
  },
  infoItem: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#1E40AF',
    marginBottom: 4,
  },
});