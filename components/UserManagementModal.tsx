import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { X, User, Mail, Lock, Shield, Save } from 'lucide-react-native';
import { useUsers } from '@/hooks/useUsers';

interface UserManagementModalProps {
  visible: boolean;
  onClose: () => void;
  user?: any;
  mode: 'create' | 'edit';
}

export function UserManagementModal({ visible, onClose, user, mode }: UserManagementModalProps) {
  const { createUser, updateUserRole } = useUsers();
  const [formData, setFormData] = useState({
    email: user?.email || '',
    password: '',
    confirmPassword: '',
    fullName: user?.full_name || '',
    role: user?.role || 'user',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const roles = [
    { value: 'user', label: 'User', description: 'Standard user access' },
    { value: 'premium', label: 'Premium', description: 'Premium features access' },
    { value: 'moderator', label: 'Moderator', description: 'Content moderation access' },
    { value: 'admin', label: 'Admin', description: 'Full system access' },
  ];

  const validateForm = () => {
    // All validation is temporarily disabled per user request.
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      if (mode === 'create') {
        await createUser({
          email: formData.email.trim(),
          password: formData.password,
          full_name: formData.fullName.trim(),
          role: formData.role,
        });
        Alert.alert('Success', 'User created successfully!');
      } else {
        await updateUserRole(user.id, formData.role);
        Alert.alert('Success', 'User updated successfully!');
      }
      
      handleClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      role: 'user',
    });
    setError('');
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
          <Text style={styles.title}>
            {mode === 'create' ? 'Create New User' : 'Edit User'}
          </Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={24} color="#64748B" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.label}>Full Name *</Text>
            <View style={styles.inputContainer}>
              <User size={20} color="#64748B" />
              <TextInput
                style={styles.input}
                placeholder="Enter full name"
                value={formData.fullName}
                onChangeText={(text) => setFormData(prev => ({ ...prev, fullName: text }))}
                autoCapitalize="words"
                autoCorrect={false}
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Email Address *</Text>
            <View style={styles.inputContainer}>
              <Mail size={20} color="#64748B" />
              <TextInput
                style={styles.input}
                placeholder="Enter email address"
                value={formData.email}
                onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor="#94A3B8"
                editable={mode === 'create'}
              />
            </View>
          </View>

          {mode === 'create' && (
            <>
              <View style={styles.section}>
                <Text style={styles.label}>Password *</Text>
                <View style={styles.inputContainer}>
                  <Lock size={20} color="#64748B" />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter password"
                    value={formData.password}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.label}>Confirm Password *</Text>
                <View style={styles.inputContainer}>
                  <Lock size={20} color="#64748B" />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              </View>
            </>
          )}

          <View style={styles.section}>
            <Text style={styles.label}>User Role *</Text>
            <View style={styles.rolesContainer}>
              {roles.map((role) => (
                <TouchableOpacity
                  key={role.value}
                  style={[
                    styles.roleOption,
                    formData.role === role.value && styles.roleOptionSelected
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, role: role.value }))}
                >
                  <View style={styles.roleHeader}>
                    <Shield 
                      size={16} 
                      color={formData.role === role.value ? '#2563EB' : '#64748B'} 
                    />
                    <Text style={[
                      styles.roleLabel,
                      formData.role === role.value && styles.roleLabelSelected
                    ]}>
                      {role.label}
                    </Text>
                  </View>
                  <Text style={[
                    styles.roleDescription,
                    formData.role === role.value && styles.roleDescriptionSelected
                  ]}>
                    {role.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              💡 Users will receive an email notification about their account. 
              {mode === 'create' && ' They can sign in immediately with the provided credentials.'}
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled
            ]} 
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Save size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>
                  {mode === 'create' ? 'Create User' : 'Update User'}
                </Text>
              </>
            )}
          </TouchableOpacity>
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
  title: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
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
  section: {
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
  rolesContainer: {
    gap: 12,
  },
  roleOption: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  roleOptionSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  roleLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
    marginLeft: 8,
  },
  roleLabelSelected: {
    color: '#2563EB',
  },
  roleDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
  },
  roleDescriptionSelected: {
    color: '#1E40AF',
  },
  disclaimer: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
    marginBottom: 20,
  },
  disclaimerText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#1E40AF',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});