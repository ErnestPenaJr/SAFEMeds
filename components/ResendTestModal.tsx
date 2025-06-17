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
  ScrollView,
} from 'react-native';
import { X, Mail, Send, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Zap } from 'lucide-react-native';

interface ResendTestModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ResendTestModal({ visible, onClose }: ResendTestModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ 
    success: boolean; 
    message: string; 
    details?: any;
    testCode?: string;
    emailId?: string;
  } | null>(null);

  const handleTestResend = async () => {
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
      const response = await fetch('/test-resend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email.trim(),
          testType: 'verification'
        }),
      });

      // Read the response body as text first
      const responseText = await response.text();
      
      if (response.ok) {
        // Response is successful, try to parse as JSON
        try {
          const data = JSON.parse(responseText);
          setResult({
            success: true,
            message: data.message,
            testCode: data.testCode,
            emailId: data.emailId,
            details: data,
          });
        } catch (jsonError) {
          // If JSON parsing fails even on success, treat as error
          setResult({
            success: false,
            message: 'Server returned invalid JSON response',
            details: responseText,
          });
        }
      } else {
        // Response is not successful, try JSON first, then fallback to text
        try {
          const data = JSON.parse(responseText);
          setResult({
            success: false,
            message: data.error || 'Failed to send test email',
            details: data.details,
          });
        } catch (jsonError) {
          // If JSON parsing fails, use the text response (likely HTML error page)
          setResult({
            success: false,
            message: `Server error (${response.status}): Unable to process request`,
            details: responseText.length > 500 ? responseText.substring(0, 500) + '...' : responseText,
          });
        }
      }
    } catch (error) {
      console.error('Error testing Resend:', error);
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
            <Zap size={24} color="#F59E0B" />
            <Text style={styles.title}>Test Resend Integration</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={24} color="#64748B" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>🧪 Resend Email Test</Text>
            <Text style={styles.infoText}>
              This will send a test email directly through the Resend API to verify your email configuration is working properly.
            </Text>
          </View>

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
                  <CheckCircle size={24} color="#10B981" />
                ) : (
                  <AlertCircle size={24} color="#EF4444" />
                )}
                <Text style={[
                  styles.resultTitle,
                  result.success ? styles.successTitle : styles.errorTitle
                ]}>
                  {result.success ? '🎉 Success!' : '❌ Error'}
                </Text>
              </View>
              
              <Text style={[
                styles.resultMessage,
                result.success ? styles.successMessage : styles.errorMessage
              ]}>
                {result.message}
              </Text>

              {result.success && result.testCode && (
                <View style={styles.codeContainer}>
                  <Text style={styles.codeLabel}>Test Verification Code:</Text>
                  <Text style={styles.codeValue}>{result.testCode}</Text>
                  <Text style={styles.codeNote}>
                    Check your email inbox for the full test email!
                  </Text>
                </View>
              )}

              {result.success && result.emailId && (
                <View style={styles.detailsContainer}>
                  <Text style={styles.detailsLabel}>Email ID:</Text>
                  <Text style={styles.detailsValue}>{result.emailId}</Text>
                </View>
              )}

              {!result.success && result.details && (
                <View style={styles.errorDetails}>
                  <Text style={styles.errorDetailsLabel}>Error Details:</Text>
                  <Text style={styles.errorDetailsText}>
                    {typeof result.details === 'string' ? result.details : JSON.stringify(result.details, null, 2)}
                  </Text>
                </View>
              )}
            </View>
          )}

          <TouchableOpacity
            style={[styles.testButton, loading && styles.testButtonDisabled]}
            onPress={handleTestResend}
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

          <View style={styles.checklistSection}>
            <Text style={styles.checklistTitle}>✅ What this test verifies:</Text>
            <Text style={styles.checklistItem}>• Resend API key is configured correctly</Text>
            <Text style={styles.checklistItem}>• Email sending functionality works</Text>
            <Text style={styles.checklistItem}>• HTML and text email templates render properly</Text>
            <Text style={styles.checklistItem}>• FROM email and name are set correctly</Text>
            <Text style={styles.checklistItem}>• Email delivery to your inbox</Text>
          </View>

          <View style={styles.troubleshootSection}>
            <Text style={styles.troubleshootTitle}>🔧 Troubleshooting:</Text>
            <Text style={styles.troubleshootItem}>
              <Text style={styles.troubleshootLabel}>No email received?</Text> Check spam folder
            </Text>
            <Text style={styles.troubleshootItem}>
              <Text style={styles.troubleshootLabel}>API key error?</Text> Verify RESEND_API_KEY in .env
            </Text>
            <Text style={styles.troubleshootItem}>
              <Text style={styles.troubleshootLabel}>Domain issues?</Text> Ensure FROM_EMAIL domain is verified in Resend
            </Text>
          </View>
        </ScrollView>
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
  infoCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E40AF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1E40AF',
    lineHeight: 20,
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
    padding: 20,
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
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 18,
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
    marginBottom: 16,
  },
  successMessage: {
    color: '#047857',
  },
  errorMessage: {
    color: '#991B1B',
  },
  codeContainer: {
    backgroundColor: '#DBEAFE',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  codeLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#1E40AF',
    marginBottom: 8,
  },
  codeValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1E40AF',
    letterSpacing: 4,
    marginBottom: 8,
  },
  codeNote: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#3730A3',
    textAlign: 'center',
  },
  detailsContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
  },
  detailsLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    marginBottom: 4,
  },
  detailsValue: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
  },
  errorDetails: {
    backgroundColor: '#FEE2E2',
    borderRadius: 6,
    padding: 12,
  },
  errorDetailsLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#991B1B',
    marginBottom: 4,
  },
  errorDetailsText: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#7F1D1D',
    lineHeight: 16,
  },
  testButton: {
    backgroundColor: '#F59E0B',
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
  checklistSection: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  checklistTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#059669',
    marginBottom: 8,
  },
  checklistItem: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#047857',
    marginBottom: 4,
  },
  troubleshootSection: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  troubleshootTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#D97706',
    marginBottom: 8,
  },
  troubleshootItem: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#92400E',
    marginBottom: 6,
    lineHeight: 16,
  },
  troubleshootLabel: {
    fontFamily: 'Inter-SemiBold',
  },
});